import { BrowserProvider, Contract, formatEther, parseEther } from 'ethers'
import type { LockBoxProvider } from './types'

const LOCKBOX_ABI = [
  'function deposit() external payable',
  'function withdraw() external',
  'function balanceOf(address account) external view returns (uint256)',
]

export class ContractProvider implements LockBoxProvider {
  private contractAddress: string

  constructor(contractAddress: string) {
    this.contractAddress = contractAddress
  }

  private async getContract() {
    const provider = new BrowserProvider(window.ethereum!)
    const signer = await provider.getSigner()
    const address = await signer.getAddress()
    const contract = new Contract(this.contractAddress, LOCKBOX_ABI, signer)
    return { contract, address }
  }

  async deposit(amount: string): Promise<string> {
    const { contract } = await this.getContract()
    const tx = await contract.deposit({ value: parseEther(amount) })
    await tx.wait()
    return tx.hash
  }

  async withdraw(): Promise<string> {
    const { contract } = await this.getContract()
    const tx = await contract.withdraw()
    await tx.wait()
    return tx.hash
  }

  async getBalance(): Promise<string> {
    const { contract, address } = await this.getContract()
    const balance = await contract.balanceOf(address)
    return formatEther(balance)
  }
}
