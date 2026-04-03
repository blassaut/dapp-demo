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
  const [contractBalance, setContractBalance] = useState('0')
  const [appState, setAppState] = useState(AppState.Disconnected)
  const [statusMessage, setStatusMessage] = useState('')
  const [lastAction, setLastAction] = useState('')
  const [lastTxHash, setLastTxHash] = useState<string | null>(null)
  const [history, setHistory] = useState<TxRecord[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
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
      setStatusMessage('')
    } else {
      setAppState(AppState.Idle)
      setStatusMessage('')
    }
  }, [isConnected, isSupported])

  // Fetch locked balance and history on connect
  useEffect(() => {
    if (!provider || !isConnected || !isSupported) return
    provider.getBalance().then(setBalance).catch(() => {})
    provider.getContractBalance().then(setContractBalance).catch(() => {})
    setHistoryLoading(true)
    provider.getHistory().then(setHistory).catch(() => {}).finally(() => setHistoryLoading(false))
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
      const parsed = parseFloat(amount)
      if (isNaN(parsed) || parsed <= 0 || !isFinite(parsed)) return
      setAppState(AppState.Pending)
      setStatusMessage('Processing deposit...')
      setLastAction('')
      setLastTxHash(null)

      try {
        const txHash = await provider.deposit(amount)
        const [newBalance, newContractBalance] = await Promise.all([
          provider.getBalance(),
          provider.getContractBalance(),
        ])
        setBalance(newBalance)
        setContractBalance(newContractBalance)
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
    [provider, returnToIdle, refreshHistory],
  )

  const withdraw = useCallback(async (amount: string) => {
    if (!provider) return
    const parsed = parseFloat(amount)
    if (isNaN(parsed) || parsed <= 0 || !isFinite(parsed)) return
    setAppState(AppState.Pending)
    setStatusMessage('Processing withdrawal...')
    setLastAction('')
    setLastTxHash(null)

    try {
      const txHash = await provider.withdraw(amount)
      const [newBalance, newContractBalance] = await Promise.all([
        provider.getBalance(),
        provider.getContractBalance(),
      ])
      setBalance(newBalance)
      setContractBalance(newContractBalance)
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

  return { balance, contractBalance, appState, statusMessage, lastAction, lastTxHash, history, historyLoading, deposit, withdraw }
}
