import { useState, useCallback, useEffect, useRef } from 'react'
import { AppState } from '../lib/types'
import type { LockBoxProvider, LockBoxState } from '../lib/types'
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
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  const withdraw = useCallback(async () => {
    if (!provider) return
    setAppState(AppState.Pending)
    setStatusMessage('Processing withdrawal...')

    try {
      const txHash = await provider.withdraw()
      const newBalance = await provider.getBalance()
      setBalance(newBalance)
      setAppState(AppState.Confirmed)
      setStatusMessage('')
      setLastAction('Withdrawal confirmed')
      setLastTxHash(txHash)
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

  return { balance, appState, statusMessage, lastAction, lastTxHash, deposit, withdraw }
}
