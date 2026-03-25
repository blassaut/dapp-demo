import { BrowserProvider } from 'ethers'
import type { StakingProvider } from './types'
import { PENDING_DELAY_MS } from './constants'

export class ControlledProvider implements StakingProvider {
  private balance = 0

  private async requestSignature(message: string): Promise<void> {
    const provider = new BrowserProvider(window.ethereum!)
    const signer = await provider.getSigner()
    await signer.signMessage(message)
  }

  private delay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, PENDING_DELAY_MS))
  }

  async stake(amount: string): Promise<void> {
    await this.requestSignature(`Stake ${amount} ETH`)
    await this.delay()
    this.balance = parseFloat((this.balance + parseFloat(amount)).toFixed(10))
  }

  async unstake(): Promise<void> {
    await this.requestSignature(`Unstake ${this.balance} ETH`)
    await this.delay()
    this.balance = 0
  }

  async getBalance(): Promise<string> {
    return this.balance.toString()
  }
}
