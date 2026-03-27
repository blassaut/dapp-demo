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
  Approving = 'approving',
  Depositing = 'depositing',
  Confirmed = 'confirmed',
  Rejected = 'rejected',
}

export interface TxRecord {
  type: 'mint' | 'deposit' | 'withdrawal'
  amount: string
  txHash: string
  blockNumber: number
}

export interface LockBoxProvider {
  mintLKBOX(ethAmount: string): Promise<string>
  approveLKBOX(amount: string): Promise<string>
  depositLKBOX(amount: string): Promise<string>
  withdrawLKBOX(amount: string): Promise<string>
  getLKBOXBalance(): Promise<string>
  getLockedBalance(): Promise<string>
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
  lkboxBalance: string
  lockedBalance: string
  appState: AppState
  statusMessage: string
  lastAction: string
  lastTxHash: string | null
  history: TxRecord[]
  mint: (ethAmount: string) => Promise<void>
  deposit: (amount: string) => Promise<void>
  withdraw: (amount: string) => Promise<void>
}
