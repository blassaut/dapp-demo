import { useState, useEffect, useRef } from 'react'
import { AppState } from '../lib/types'

interface StakeFormProps {
  appState: AppState
  balance: string
  isConnected: boolean
  isSupported: boolean
  onStake: (amount: string) => void
  onUnstake: () => void
}

export function StakeForm({
  appState,
  balance,
  isConnected,
  isSupported,
  onStake,
  onUnstake,
}: StakeFormProps) {
  const [amount, setAmount] = useState('')
  const prevAppState = useRef(appState)

  useEffect(() => {
    if (prevAppState.current !== AppState.Confirmed && appState === AppState.Confirmed) {
      setAmount('')
    }
    prevAppState.current = appState
  }, [appState])

  const isPending = appState === AppState.Pending
  const canInteract = isConnected && isSupported && !isPending
  const stakeDisabled = !canInteract || !amount || parseFloat(amount) <= 0
  const unstakeDisabled = !canInteract || parseFloat(balance) <= 0

  return (
    <div className="space-y-4">
      <input
        data-testid="staking-input-amount"
        type="number"
        placeholder="Amount in ETH"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        disabled={!canInteract}
        min="0"
        step="0.01"
        className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-white/10 text-light font-mono text-sm placeholder:text-muted/30 focus:border-teal-400/40 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
      />

      <div className="flex gap-3">
        <button
          data-testid="staking-button-stake"
          onClick={() => onStake(amount)}
          disabled={stakeDisabled}
          className="flex-1 px-5 py-2.5 bg-teal-400 text-dark-900 font-body font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
        >
          Stake
        </button>
        <button
          data-testid="staking-button-unstake"
          onClick={onUnstake}
          disabled={unstakeDisabled}
          className="flex-1 px-5 py-2.5 border border-teal-400/30 text-teal-400 font-body font-semibold rounded-lg hover:bg-teal-400/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Unstake
        </button>
      </div>
    </div>
  )
}
