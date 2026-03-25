import { useState, useEffect } from 'react'
import type { NetworkState, Eip1193Provider } from '../lib/types'
import { HOODI_CHAIN_ID, HARDHAT_CHAIN_ID, HOODI_NETWORK_NAME, HARDHAT_NETWORK_NAME, SUPPORTED_CHAIN_IDS } from '../lib/constants'

const KNOWN_NETWORKS: Record<number, string> = {
  1: 'Ethereum Mainnet',
  5: 'Goerli',
  11155111: 'Sepolia',
  17000: 'Holesky',
  137: 'Polygon',
  80002: 'Polygon Amoy',
  42161: 'Arbitrum One',
  421614: 'Arbitrum Sepolia',
  10: 'Optimism',
  11155420: 'Optimism Sepolia',
  8453: 'Base',
  84532: 'Base Sepolia',
  56: 'BNB Smart Chain',
  43114: 'Avalanche',
  100: 'Gnosis',
  [HOODI_CHAIN_ID]: HOODI_NETWORK_NAME,
  [HARDHAT_CHAIN_ID]: HARDHAT_NETWORK_NAME,
}

function getNetworkName(chainId: number): string {
  return KNOWN_NETWORKS[chainId] ?? `Unknown (${chainId})`
}

function parseChainId(raw: string): number {
  return raw.startsWith('0x') ? parseInt(raw, 16) : Number(raw)
}

export function useNetwork(isConnected: boolean, provider: Eip1193Provider | null): NetworkState {
  const [chainId, setChainId] = useState<number | null>(null)

  useEffect(() => {
    if (!isConnected || !provider) {
      setChainId(null)
      return
    }

    const fetchChainId = async () => {
      try {
        const raw = (await provider.request({ method: 'eth_chainId' })) as string
        setChainId(parseChainId(raw))
      } catch {
        setChainId(null)
      }
    }

    fetchChainId()

    const handleChainChanged = (newChainId: unknown) => {
      setChainId(parseChainId(newChainId as string))
    }

    // Re-check chain when tab regains focus (MetaMask may not fire
    // chainChanged to background tabs when switching via the extension UI)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') fetchChainId()
    }

    provider.on('chainChanged', handleChainChanged)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', fetchChainId)
    return () => {
      provider.removeListener('chainChanged', handleChainChanged)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', fetchChainId)
    }
  }, [isConnected, provider])

  return {
    chainId,
    networkName: chainId !== null ? getNetworkName(chainId) : null,
    isSupported: chainId !== null && (SUPPORTED_CHAIN_IDS as readonly number[]).includes(chainId),
  }
}
