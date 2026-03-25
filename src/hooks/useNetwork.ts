import { useState, useEffect } from 'react'
import type { NetworkState } from '../lib/types'
import { HOODI_CHAIN_ID, HARDHAT_CHAIN_ID, HOODI_NETWORK_NAME, HARDHAT_NETWORK_NAME, SUPPORTED_CHAIN_IDS } from '../lib/constants'

const KNOWN_NETWORKS: Record<number, string> = {
  1: 'Ethereum Mainnet',
  5: 'Goerli',
  11155111: 'Sepolia',
  137: 'Polygon',
  [HOODI_CHAIN_ID]: HOODI_NETWORK_NAME,
  [HARDHAT_CHAIN_ID]: HARDHAT_NETWORK_NAME,
}

function getNetworkName(chainId: number): string {
  return KNOWN_NETWORKS[chainId] ?? `Unknown (${chainId})`
}

export function useNetwork(isConnected: boolean): NetworkState {
  const [chainId, setChainId] = useState<number | null>(null)

  useEffect(() => {
    if (!isConnected || !window.ethereum) {
      setChainId(null)
      return
    }

    const fetchChainId = async () => {
      try {
        const hex = (await window.ethereum!.request({ method: 'eth_chainId' })) as string
        setChainId(parseInt(hex, 16))
      } catch {
        setChainId(null)
      }
    }

    fetchChainId()

    const handleChainChanged = (newChainId: unknown) => {
      setChainId(parseInt(newChainId as string, 16))
    }

    // Re-check chain when tab regains focus (MetaMask may not fire
    // chainChanged to background tabs when switching via the extension UI)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') fetchChainId()
    }

    window.ethereum.on('chainChanged', handleChainChanged)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', fetchChainId)
    return () => {
      window.ethereum?.removeListener('chainChanged', handleChainChanged)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', fetchChainId)
    }
  }, [isConnected])

  return {
    chainId,
    networkName: chainId !== null ? getNetworkName(chainId) : null,
    isSupported: chainId !== null && (SUPPORTED_CHAIN_IDS as readonly number[]).includes(chainId),
  }
}
