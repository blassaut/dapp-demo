import { useState, useEffect } from 'react'
import type { NetworkState } from '../lib/types'
import { HOODI_CHAIN_ID, HOODI_NETWORK_NAME } from '../lib/constants'

const KNOWN_NETWORKS: Record<number, string> = {
  1: 'Ethereum Mainnet',
  5: 'Goerli',
  11155111: 'Sepolia',
  137: 'Polygon',
  [HOODI_CHAIN_ID]: HOODI_NETWORK_NAME,
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

    window.ethereum.on('chainChanged', handleChainChanged)
    return () => {
      window.ethereum?.removeListener('chainChanged', handleChainChanged)
    }
  }, [isConnected])

  return {
    chainId,
    networkName: chainId !== null ? getNetworkName(chainId) : null,
    isSupported: chainId === HOODI_CHAIN_ID,
  }
}
