export enum AppState {
  Disconnected = 'disconnected',
  UnsupportedNetwork = 'unsupported-network',
  Idle = 'idle',
  Pending = 'pending',
  Confirmed = 'confirmed',
  Rejected = 'rejected',
}

export interface TxRecord {
  type: 'deposit' | 'withdrawal'
  amount: string
  txHash: string
}

export interface LockBoxProvider {
  deposit(amount: string): Promise<string>
  withdraw(amount: string): Promise<string>
  getBalance(): Promise<string>
  getHistory(): Promise<TxRecord[]>
}

export interface WalletState {
  address: string | null
  walletBalance: string | null
  isConnected: boolean
  isNoWallet: boolean
  connect: () => Promise<void>
  disconnect: () => void
}

export interface NetworkState {
  chainId: number | null
  networkName: string | null
  isSupported: boolean
}

export interface LockBoxState {
  balance: string
  appState: AppState
  statusMessage: string
  lastAction: string
  lastTxHash: string | null
  history: TxRecord[]
  deposit: (amount: string) => Promise<void>
  withdraw: (amount: string) => Promise<void>
}
