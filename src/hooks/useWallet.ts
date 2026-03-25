import { useState, useCallback, useEffect, useRef } from 'react'
import type { WalletState, Eip1193Provider } from '../lib/types'
import { connectWalletConnectProvider, disconnectWalletConnect, isWalletConnectConfigured } from '../lib/walletconnect'

declare global {
  interface Window {
    ethereum?: Eip1193Provider & { isMetaMask?: boolean }
  }
}

import { formatEther } from 'ethers'

function formatEthBalance(weiHex: string): string {
  const formatted = formatEther(BigInt(weiHex))
  const dot = formatted.indexOf('.')
  return dot === -1 ? formatted : formatted.slice(0, dot + 5)
}

export function useWallet(): WalletState {
  const [address, setAddress] = useState<string | null>(null)
  const [walletBalance, setWalletBalance] = useState<string | null>(null)
  const providerRef = useRef<Eip1193Provider | null>(window.ethereum ?? null)

  const fetchBalance = useCallback(async (addr: string) => {
    const p = providerRef.current
    if (!p) return
    try {
      const balanceHex = (await p.request({
        method: 'eth_getBalance',
        params: [addr, 'latest'],
      })) as string
      setWalletBalance(formatEthBalance(balanceHex))
    } catch {
      setWalletBalance(null)
    }
  }, [])

  /** Connect using the injected wallet (MetaMask, etc.) */
  const connect = useCallback(async () => {
    if (!window.ethereum) return

    providerRef.current = window.ethereum
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

  /** Connect via WalletConnect (Trust Wallet, Rainbow, etc.) */
  const connectWalletConnect = useCallback(async () => {
    if (!isWalletConnectConfigured()) return

    try {
      const wcProvider = await connectWalletConnectProvider()
      providerRef.current = wcProvider

      const accounts = (await wcProvider.request({ method: 'eth_accounts' })) as string[]
      if (accounts.length > 0) {
        setAddress(accounts[0])
        fetchBalance(accounts[0])
      }
    } catch {
      // User closed modal or rejected
    }
  }, [fetchBalance])

  // Listen for account changes on the active provider
  useEffect(() => {
    const p = providerRef.current
    if (!p) return

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

    p.on('accountsChanged', handleAccountsChanged)
    return () => {
      p.removeListener('accountsChanged', handleAccountsChanged)
    }
  }, [fetchBalance])

  // Refresh balance periodically when connected
  useEffect(() => {
    if (!address) return
    const interval = setInterval(() => fetchBalance(address), 15000)
    return () => clearInterval(interval)
  }, [address, fetchBalance])

  const disconnect = useCallback(() => {
    disconnectWalletConnect()
    providerRef.current = window.ethereum ?? null
    setAddress(null)
    setWalletBalance(null)
  }, [])

  return {
    address,
    walletBalance,
    isConnected: address !== null,
    hasInjectedWallet: Boolean(window.ethereum),
    provider: providerRef.current,
    connect,
    connectWalletConnect,
    disconnect,
  }
}
