import { BrowserProvider, JsonRpcProvider, Contract, formatEther, parseEther, EventLog } from 'ethers'
import type { Eip1193Provider, LockBoxProvider, TxRecord } from './types'

const LOCKBOX_ABI = [
  'function deposit() external payable',
  'function withdraw(uint256 amount) external',
  'function balanceOf(address account) external view returns (uint256)',
  'function contractBalance() external view returns (uint256)',
  'event Deposited(address indexed user, uint256 amount)',
  'event Withdrawn(address indexed user, uint256 amount)',
]

export class ContractProvider implements LockBoxProvider {
  private contractAddress: string
  private eip1193Provider: Eip1193Provider
  private rpcUrl: string

  constructor(contractAddress: string, eip1193Provider: Eip1193Provider, rpcUrl: string) {
    this.contractAddress = contractAddress
    this.eip1193Provider = eip1193Provider
    this.rpcUrl = rpcUrl
  }

  private async getContract() {
    const provider = new BrowserProvider(this.eip1193Provider)
    const signer = await provider.getSigner()
    const address = await signer.getAddress()
    const contract = new Contract(this.contractAddress, LOCKBOX_ABI, signer)
    return { contract, address, provider }
  }

  async deposit(amount: string): Promise<string> {
    const { contract } = await this.getContract()
    const tx = await contract.deposit({ value: parseEther(amount) })
    await tx.wait()
    return tx.hash
  }

  async withdraw(amount: string): Promise<string> {
    const { contract } = await this.getContract()
    const tx = await contract.withdraw(parseEther(amount))
    await tx.wait()
    return tx.hash
  }

  async getBalance(): Promise<string> {
    const { contract, address } = await this.getContract()
    const balance = await contract.balanceOf(address)
    return formatEther(balance)
  }

  async getContractBalance(): Promise<string> {
    const { contract } = await this.getContract()
    const balance = await contract.contractBalance()
    return formatEther(balance)
  }

  async getHistory(): Promise<TxRecord[]> {
    const { address } = await this.getContract()
    const records: TxRecord[] = []

    // Use a direct JSON-RPC provider for event queries — some wallets
    // (e.g. Rabby) don't support eth_getLogs via their injected provider.
    const rpcProvider = new JsonRpcProvider(this.rpcUrl)
    const readContract = new Contract(this.contractAddress, LOCKBOX_ABI, rpcProvider)

    // Public RPCs limit eth_getLogs to 50k blocks per request.
    const currentBlock = await rpcProvider.getBlockNumber()
    const fromBlock = Math.max(0, currentBlock - 29_999)

    const depositFilter = readContract.filters.Deposited(address)
    const withdrawFilter = readContract.filters.Withdrawn(address)

    const [depositEvents, withdrawEvents] = await Promise.all([
      readContract.queryFilter(depositFilter, fromBlock, currentBlock),
      readContract.queryFilter(withdrawFilter, fromBlock, currentBlock),
    ])

    for (const event of depositEvents) {
      if (event instanceof EventLog) {
        records.push({
          type: 'deposit',
          amount: formatEther(event.args[1]),
          txHash: event.transactionHash,
          blockNumber: event.blockNumber,
        })
      }
    }

    for (const event of withdrawEvents) {
      if (event instanceof EventLog) {
        records.push({
          type: 'withdrawal',
          amount: formatEther(event.args[1]),
          txHash: event.transactionHash,
          blockNumber: event.blockNumber,
        })
      }
    }

    records.sort((a, b) => b.blockNumber - a.blockNumber)

    return records
  }
}
