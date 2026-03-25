export enum AppState {
  Disconnected = 'disconnected',
  UnsupportedNetwork = 'unsupported-network',
  Idle = 'idle',
  Pending = 'pending',
  Confirmed = 'confirmed',
  Rejected = 'rejected',
}

export interface StakingProvider {
  stake(amount: string): Promise<void>
  unstake(): Promise<void>
  getBalance(): Promise<string>
}

export interface WalletState {
  address: string | null
  isConnected: boolean
  isNoWallet: boolean
  connect: () => Promise<void>
}

export interface NetworkState {
  chainId: number | null
  networkName: string | null
  isSupported: boolean
}

export interface StakingState {
  balance: string
  appState: AppState
  statusMessage: string
  lastAction: string
  stake: (amount: string) => Promise<void>
  unstake: () => Promise<void>
}
