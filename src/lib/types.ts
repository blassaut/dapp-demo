/** EIP-1193 compatible provider (MetaMask, WalletConnect, etc.) */
export interface Eip1193Provider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
  on: (event: string, handler: (...args: unknown[]) => void) => void
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void
}

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
  blockNumber: number
}

export interface LockBoxProvider {
  deposit(amount: string): Promise<string>
  withdraw(amount: string): Promise<string>
  getBalance(): Promise<string>
  getContractBalance(): Promise<string>
  getHistory(): Promise<TxRecord[]>
}

export interface WalletState {
  address: string | null
  walletBalance: string | null
  isConnected: boolean
  hasInjectedWallet: boolean
  provider: Eip1193Provider | null
  connect: () => Promise<void>
  connectWalletConnect: () => Promise<void>
  disconnect: () => void
}

export interface NetworkState {
  chainId: number | null
  networkName: string | null
  isSupported: boolean
}

export interface LockBoxState {
  balance: string
  contractBalance: string
  appState: AppState
  statusMessage: string
  lastAction: string
  lastTxHash: string | null
  history: TxRecord[]
  deposit: (amount: string) => Promise<void>
  withdraw: (amount: string) => Promise<void>
}
