import { BrowserProvider } from 'ethers'
import type { LockBoxProvider } from './types'
import { PENDING_DELAY_MS } from './constants'

export class ControlledProvider implements LockBoxProvider {
  private balance = 0

  private async requestSignature(message: string): Promise<void> {
    const provider = new BrowserProvider(window.ethereum!)
    const signer = await provider.getSigner()
    await signer.signMessage(message)
  }

  private delay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, PENDING_DELAY_MS))
  }

  async deposit(amount: string): Promise<void> {
    await this.requestSignature(`Deposit ${amount} ETH`)
    await this.delay()
    this.balance = parseFloat((this.balance + parseFloat(amount)).toFixed(10))
  }

  async withdraw(): Promise<void> {
    await this.requestSignature(`Withdraw ${this.balance} ETH`)
    await this.delay()
    this.balance = 0
  }

  async getBalance(): Promise<string> {
    return this.balance.toString()
  }
}
