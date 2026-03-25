import EthereumProvider from '@walletconnect/ethereum-provider'
import { HOODI_CHAIN_ID, HARDHAT_CHAIN_ID } from './constants'
import type { Eip1193Provider } from './types'

const PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined

export function isWalletConnectConfigured(): boolean {
  return Boolean(PROJECT_ID)
}

let cachedProvider: EthereumProvider | null = null

export async function connectWalletConnectProvider(): Promise<Eip1193Provider> {
  if (!PROJECT_ID) {
    throw new Error('VITE_WALLETCONNECT_PROJECT_ID is not set')
  }

  if (!cachedProvider) {
    cachedProvider = await EthereumProvider.init({
      projectId: PROJECT_ID,
      chains: [HOODI_CHAIN_ID],
      optionalChains: [HARDHAT_CHAIN_ID],
      showQrModal: true,
      metadata: {
        name: 'LockBox Demo',
        description: 'On-chain staking demo',
        url: window.location.origin,
        icons: [],
      },
    })
  }

  // .connect() triggers the QR modal; eth_requestAccounts alone does not
  if (!cachedProvider.session) {
    await cachedProvider.connect()
  }
  return cachedProvider as unknown as Eip1193Provider
}

export function disconnectWalletConnect(): void {
  if (cachedProvider) {
    cachedProvider.disconnect()
    cachedProvider = null
  }
}
