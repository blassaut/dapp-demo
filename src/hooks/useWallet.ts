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

import { formatEther } from 'ethers'

function formatEthBalance(weiHex: string): string {
  const formatted = formatEther(BigInt(weiHex))
  // Show 4 decimal places
  const dot = formatted.indexOf('.')
  return dot === -1 ? formatted : formatted.slice(0, dot + 5)
}

export function useWallet(): WalletState {
  const [address, setAddress] = useState<string | null>(null)
  const [walletBalance, setWalletBalance] = useState<string | null>(null)
  const [isNoWallet, setIsNoWallet] = useState(!window.ethereum)

  const fetchBalance = useCallback(async (addr: string) => {
    if (!window.ethereum) return
    try {
      const balanceHex = (await window.ethereum.request({
        method: 'eth_getBalance',
        params: [addr, 'latest'],
      })) as string
      setWalletBalance(formatEthBalance(balanceHex))
    } catch {
      setWalletBalance(null)
    }
  }, [])

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
        fetchBalance(accounts[0])
      }
    } catch {
      // User rejected or error - stay disconnected
    }
  }, [fetchBalance])

  useEffect(() => {
    if (!window.ethereum) return

    const handleAccountsChanged = (accounts: unknown) => {
      const accs = accounts as string[]
      if (accs.length === 0) {
        setAddress(null)
        setWalletBalance(null)
      } else {
        setAddress(accs[0])
        fetchBalance(accs[0])
      }
    }

    window.ethereum.on('accountsChanged', handleAccountsChanged)
    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged)
    }
  }, [fetchBalance])

  // Refresh balance periodically when connected
  useEffect(() => {
    if (!address) return
    const interval = setInterval(() => fetchBalance(address), 15000)
    return () => clearInterval(interval)
  }, [address, fetchBalance])

  const disconnect = useCallback(() => {
    setAddress(null)
    setWalletBalance(null)
  }, [])

  return {
    address,
    walletBalance,
    isConnected: address !== null,
    isNoWallet,
    disconnect,
    connect,
  }
}
