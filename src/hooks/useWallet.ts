import { useState, useCallback, useEffect } from 'react'
import type { WalletState } from '../lib/types'

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
      on: (event: string, handler: (...args: unknown[]) => void) => void
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void
      isMetaMask?: boolean
    }
  }
}

export function useWallet(): WalletState {
  const [address, setAddress] = useState<string | null>(null)
  const [isNoWallet, setIsNoWallet] = useState(!window.ethereum)

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setIsNoWallet(true)
      return
    }

    try {
      const accounts = (await window.ethereum.request({
        method: 'eth_requestAccounts',
      })) as string[]
      if (accounts.length > 0) {
        setAddress(accounts[0])
      }
    } catch {
      // User rejected or error - stay disconnected
    }
  }, [])

  useEffect(() => {
    if (!window.ethereum) return

    const handleAccountsChanged = (accounts: unknown) => {
      const accs = accounts as string[]
      if (accs.length === 0) {
        setAddress(null)
      } else {
        setAddress(accs[0])
      }
    }

    window.ethereum.on('accountsChanged', handleAccountsChanged)
    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged)
    }
  }, [])

  return {
    address,
    isConnected: address !== null,
    isNoWallet,
    connect,
  }
}
