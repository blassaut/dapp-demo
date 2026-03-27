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
  const [lkboxBalance, setLkboxBalance] = useState('0')
  const [lockedBalance, setLockedBalance] = useState('0')
  const [appState, setAppState] = useState(AppState.Disconnected)
  const [statusMessage, setStatusMessage] = useState('')
  const [lastAction, setLastAction] = useState('')
  const [lastTxHash, setLastTxHash] = useState<string | null>(null)
  const [history, setHistory] = useState<TxRecord[]>([])
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isConnected) {
      setAppState(AppState.Disconnected)
      setStatusMessage('')
      setLastAction('')
      setLkboxBalance('0')
      setLockedBalance('0')
    } else if (!isSupported) {
      setAppState(AppState.UnsupportedNetwork)
      setStatusMessage('')
    } else {
      setAppState(AppState.Idle)
      setStatusMessage('')
    }
  }, [isConnected, isSupported])

  useEffect(() => {
    if (!provider || !isConnected || !isSupported) return
    provider.getLKBOXBalance().then(setLkboxBalance).catch(() => {})
    provider.getLockedBalance().then(setLockedBalance).catch(() => {})
    provider.getHistory().then(setHistory).catch(() => {})
  }, [provider, isConnected, isSupported])

  const refreshBalances = useCallback(async () => {
    if (!provider) return
    const [newLkbox, newLocked] = await Promise.all([
      provider.getLKBOXBalance(),
      provider.getLockedBalance(),
    ])
    setLkboxBalance(newLkbox)
    setLockedBalance(newLocked)
  }, [provider])

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

  const mint = useCallback(async (ethAmount: string) => {
    if (!provider) return
    const parsed = parseFloat(ethAmount)
    if (isNaN(parsed) || parsed <= 0 || !isFinite(parsed)) return
    setAppState(AppState.Pending)
    setStatusMessage('Minting LKBOX...')
    setLastAction('')
    setLastTxHash(null)
    try {
      const txHash = await provider.mintLKBOX(ethAmount)
      await refreshBalances()
      setAppState(AppState.Confirmed)
      setStatusMessage('')
      setLastAction(`Minted ${parsed * 1000} LKBOX`)
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
  }, [provider, refreshBalances, refreshHistory, returnToIdle])

  const deposit = useCallback(async (amount: string) => {
    if (!provider) return
    const parsed = parseFloat(amount)
    if (isNaN(parsed) || parsed <= 0 || !isFinite(parsed)) return
    setLastAction('')
    setLastTxHash(null)

    setAppState(AppState.Approving)
    setStatusMessage('Step 1/2: Approving LKBOX spending...')
    try {
      await provider.approveLKBOX(amount)
    } catch {
      setAppState(AppState.Rejected)
      setStatusMessage('')
      setLastAction('Approval rejected')
      setLastTxHash(null)
      returnToIdle()
      return
    }

    setAppState(AppState.Depositing)
    setStatusMessage('Step 2/2: Depositing LKBOX...')
    try {
      const txHash = await provider.depositLKBOX(amount)
      await refreshBalances()
      setAppState(AppState.Confirmed)
      setStatusMessage('')
      setLastAction(`Deposited ${amount} LKBOX`)
      setLastTxHash(txHash)
      refreshHistory()
      returnToIdle()
    } catch {
      setAppState(AppState.Rejected)
      setStatusMessage('')
      setLastAction('Deposit rejected')
      setLastTxHash(null)
      returnToIdle()
    }
  }, [provider, refreshBalances, refreshHistory, returnToIdle])

  const withdraw = useCallback(async (amount: string) => {
    if (!provider) return
    const parsed = parseFloat(amount)
    if (isNaN(parsed) || parsed <= 0 || !isFinite(parsed)) return
    setAppState(AppState.Pending)
    setStatusMessage('Withdrawing LKBOX...')
    setLastAction('')
    setLastTxHash(null)
    try {
      const txHash = await provider.withdrawLKBOX(amount)
      await refreshBalances()
      setAppState(AppState.Confirmed)
      setStatusMessage('')
      setLastAction(`Withdrew ${amount} LKBOX`)
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
  }, [provider, refreshBalances, refreshHistory, returnToIdle])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return { lkboxBalance, lockedBalance, appState, statusMessage, lastAction, lastTxHash, history, mint, deposit, withdraw }
}
