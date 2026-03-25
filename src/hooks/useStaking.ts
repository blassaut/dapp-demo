import { useState, useCallback, useEffect, useRef } from 'react'
import { AppState } from '../lib/types'
import type { StakingProvider, StakingState } from '../lib/types'
import { STATUS_TIMEOUT_MS } from '../lib/constants'

interface UseStakingProps {
  provider: StakingProvider | null
  isConnected: boolean
  isSupported: boolean
}

export function useStaking({ provider, isConnected, isSupported }: UseStakingProps): StakingState {
  const [balance, setBalance] = useState('0')
  const [appState, setAppState] = useState(AppState.Disconnected)
  const [statusMessage, setStatusMessage] = useState('')
  const [lastAction, setLastAction] = useState('')
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

  const stake = useCallback(
    async (amount: string) => {
      if (!provider) return
      setAppState(AppState.Pending)
      setStatusMessage('Processing stake...')

      try {
        await provider.stake(amount)
        const newBalance = await provider.getBalance()
        setBalance(newBalance)
        setAppState(AppState.Confirmed)
        setStatusMessage('')
        setLastAction(`Stake confirmed for ${amount} ETH`)
        returnToIdle()
      } catch {
        setAppState(AppState.Rejected)
        setStatusMessage('')
        setLastAction('Transaction rejected')
        returnToIdle()
      }
    },
    [provider, returnToIdle],
  )

  const unstake = useCallback(async () => {
    if (!provider) return
    setAppState(AppState.Pending)
    setStatusMessage('Processing unstake...')

    try {
      await provider.unstake()
      const newBalance = await provider.getBalance()
      setBalance(newBalance)
      setAppState(AppState.Confirmed)
      setStatusMessage('')
      setLastAction('Unstake confirmed')
      returnToIdle()
    } catch {
      setAppState(AppState.Rejected)
      setStatusMessage('')
      setLastAction('Transaction rejected')
      returnToIdle()
    }
  }, [provider, returnToIdle])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return { balance, appState, statusMessage, lastAction, stake, unstake }
}
