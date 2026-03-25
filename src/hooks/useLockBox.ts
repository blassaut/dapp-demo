import { useState, useCallback, useEffect, useRef } from 'react'
import { AppState } from '../lib/types'
import type { LockBoxProvider, LockBoxState, TxRecord } from '../lib/types'
import { STATUS_TIMEOUT_MS } from '../lib/constants'

interface UseLockBoxProps {
  provider: LockBoxProvider | null
  isConnected: boolean
  isSupported: boolean
}

export function useLockBox({ provider, isConnected, isSupported }: UseLockBoxProps): LockBoxState {
  const [balance, setBalance] = useState('0')
  const [appState, setAppState] = useState(AppState.Disconnected)
  const [statusMessage, setStatusMessage] = useState('')
  const [lastAction, setLastAction] = useState('')
  const [lastTxHash, setLastTxHash] = useState<string | null>(null)
  const [history, setHistory] = useState<TxRecord[]>([])
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Derive base state from connection/network
  useEffect(() => {
    if (!isConnected) {
      setAppState(AppState.Disconnected)
      setStatusMessage('')
      setLastAction('')
      setBalance('0')
    } else if (!isSupported) {
      setAppState(AppState.UnsupportedNetwork)
      setStatusMessage('Unsupported network')
    } else {
      setAppState(AppState.Idle)
      setStatusMessage('')
    }
  }, [isConnected, isSupported])

  // Fetch locked balance and history on connect
  useEffect(() => {
    if (!provider || !isConnected || !isSupported) return
    provider.getBalance().then(setBalance).catch(() => {})
    provider.getHistory().then(setHistory).catch(() => {})
  }, [provider, isConnected, isSupported])

  const refreshHistory = useCallback(() => {
    if (!provider) return
    provider.getHistory().then(setHistory).catch(() => {})
  }, [provider])

  const returnToIdle = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setAppState(AppState.Idle)
    }, STATUS_TIMEOUT_MS)
  }, [])

  const deposit = useCallback(
    async (amount: string) => {
      if (!provider) return
      setAppState(AppState.Pending)
      setStatusMessage('Processing deposit...')

      try {
        const txHash = await provider.deposit(amount)
        const newBalance = await provider.getBalance()
        setBalance(newBalance)
        setAppState(AppState.Confirmed)
        setStatusMessage('')
        setLastAction(`Deposit confirmed for ${amount} ETH`)
        setLastTxHash(txHash)
        refreshHistory()
        returnToIdle()
      } catch {
        setAppState(AppState.Rejected)
        setStatusMessage('')
        setLastAction('Transaction rejected')
        setLastTxHash(null)
        returnToIdle()
      }
    },
    [provider, returnToIdle],
  )

  const withdraw = useCallback(async (amount: string) => {
    if (!provider) return
    setAppState(AppState.Pending)
    setStatusMessage('Processing withdrawal...')

    try {
      const txHash = await provider.withdraw(amount)
      const newBalance = await provider.getBalance()
      setBalance(newBalance)
      setAppState(AppState.Confirmed)
      setStatusMessage('')
      setLastAction(`Withdrawal confirmed for ${amount} ETH`)
      setLastTxHash(txHash)
      refreshHistory()
      returnToIdle()
    } catch {
      setAppState(AppState.Rejected)
      setStatusMessage('')
      setLastAction('Transaction rejected')
      setLastTxHash(null)
      returnToIdle()
    }
  }, [provider, returnToIdle])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return { balance, appState, statusMessage, lastAction, lastTxHash, history, deposit, withdraw }
}
