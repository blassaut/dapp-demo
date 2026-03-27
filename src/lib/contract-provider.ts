import { BrowserProvider, JsonRpcProvider, Contract, formatEther, parseEther, EventLog } from 'ethers'
import type { Eip1193Provider, LockBoxProvider, TxRecord } from './types'
import { BLOCK_RANGE } from './constants'

const LKBOX_TOKEN_ABI = [
  'function mint() external payable',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function balanceOf(address account) external view returns (uint256)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'event Minted(address indexed user, uint256 ethAmount, uint256 tokenAmount)',
]

const LOCKBOX_ABI = [
  'function deposit(uint256 amount) external',
  'function withdraw(uint256 amount) external',
  'function lockedBalance(address account) external view returns (uint256)',
  'event Deposited(address indexed user, uint256 amount)',
  'event Withdrawn(address indexed user, uint256 amount)',
]

export class ContractProvider implements LockBoxProvider {
  private tokenAddress: string
  private lockboxAddress: string
  private eip1193Provider: Eip1193Provider
  private rpcUrl: string

  constructor(tokenAddress: string, lockboxAddress: string, eip1193Provider: Eip1193Provider, rpcUrl: string) {
    this.tokenAddress = tokenAddress
    this.lockboxAddress = lockboxAddress
    this.eip1193Provider = eip1193Provider
    this.rpcUrl = rpcUrl
  }

  private async getSigner() {
    const provider = new BrowserProvider(this.eip1193Provider)
    const signer = await provider.getSigner()
    const address = await signer.getAddress()
    return { signer, address, provider }
  }

  private async getTokenContract() {
    const { signer, address, provider } = await this.getSigner()
    const contract = new Contract(this.tokenAddress, LKBOX_TOKEN_ABI, signer)
    return { contract, address, provider }
  }

  private async getLockboxContract() {
    const { signer, address, provider } = await this.getSigner()
    const contract = new Contract(this.lockboxAddress, LOCKBOX_ABI, signer)
    return { contract, address, provider }
  }

  async mintLKBOX(ethAmount: string): Promise<string> {
    const { contract } = await this.getTokenContract()
    const tx = await contract.mint({ value: parseEther(ethAmount) })
    await tx.wait()
    return tx.hash
  }

  async approveLKBOX(amount: string): Promise<string> {
    const { contract } = await this.getTokenContract()
    const tx = await contract.approve(this.lockboxAddress, parseEther(amount))
    await tx.wait()
    return tx.hash
  }

  async depositLKBOX(amount: string): Promise<string> {
    const { contract } = await this.getLockboxContract()
    const tx = await contract.deposit(parseEther(amount))
    await tx.wait()
    return tx.hash
  }

  async withdrawLKBOX(amount: string): Promise<string> {
    const { contract } = await this.getLockboxContract()
    const tx = await contract.withdraw(parseEther(amount))
    await tx.wait()
    return tx.hash
  }

  async getLKBOXBalance(): Promise<string> {
    const { contract, address } = await this.getTokenContract()
    const balance = await contract.balanceOf(address)
    return formatEther(balance)
  }

  async getLockedBalance(): Promise<string> {
    const { contract, address } = await this.getLockboxContract()
    const balance = await contract.lockedBalance(address)
    return formatEther(balance)
  }

  async getHistory(): Promise<TxRecord[]> {
    const { address } = await this.getSigner()
    const records: TxRecord[] = []

    const rpcProvider = new JsonRpcProvider(this.rpcUrl)
    const tokenContract = new Contract(this.tokenAddress, LKBOX_TOKEN_ABI, rpcProvider)
    const lockboxContract = new Contract(this.lockboxAddress, LOCKBOX_ABI, rpcProvider)

    const currentBlock = await rpcProvider.getBlockNumber()
    const fromBlock = Math.max(0, currentBlock - BLOCK_RANGE)

    const [mintEvents, depositEvents, withdrawEvents] = await Promise.all([
      tokenContract.queryFilter(tokenContract.filters.Minted(address), fromBlock, currentBlock),
      lockboxContract.queryFilter(lockboxContract.filters.Deposited(address), fromBlock, currentBlock),
      lockboxContract.queryFilter(lockboxContract.filters.Withdrawn(address), fromBlock, currentBlock),
    ])

    for (const event of mintEvents) {
      if (event instanceof EventLog) {
        records.push({ type: 'mint', amount: formatEther(event.args[2]), txHash: event.transactionHash, blockNumber: event.blockNumber })
      }
    }
    for (const event of depositEvents) {
      if (event instanceof EventLog) {
        records.push({ type: 'deposit', amount: formatEther(event.args[1]), txHash: event.transactionHash, blockNumber: event.blockNumber })
      }
    }
    for (const event of withdrawEvents) {
      if (event instanceof EventLog) {
        records.push({ type: 'withdrawal', amount: formatEther(event.args[1]), txHash: event.transactionHash, blockNumber: event.blockNumber })
      }
    }

    records.sort((a, b) => b.blockNumber - a.blockNumber)
    return records
  }
}
