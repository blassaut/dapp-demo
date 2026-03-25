import { useState, useEffect, useRef } from 'react'
import { AppState } from '../lib/types'

interface DepositFormProps {
  appState: AppState
  balance: string
  isConnected: boolean
  isSupported: boolean
  onDeposit: (amount: string) => void
  onWithdraw: () => void
}

export function DepositForm({
  appState,
  balance,
  isConnected,
  isSupported,
  onDeposit,
  onWithdraw,
}: DepositFormProps) {
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
  const depositDisabled = !canInteract || !amount || parseFloat(amount) <= 0
  const withdrawDisabled = !canInteract || parseFloat(balance) <= 0

  return (
    <div className="space-y-4">
      <input
        data-testid="lockbox-input-amount"
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
          data-testid="lockbox-button-deposit"
          onClick={() => onDeposit(amount)}
          disabled={depositDisabled}
          className="flex-1 px-5 py-2.5 bg-teal-400 text-dark-900 font-body font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
        >
          Deposit
        </button>
        <button
          data-testid="lockbox-button-withdraw"
          onClick={onWithdraw}
          disabled={withdrawDisabled}
          className="flex-1 px-5 py-2.5 border border-teal-400/30 text-teal-400 font-body font-semibold rounded-lg hover:bg-teal-400/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Withdraw
        </button>
      </div>
    </div>
  )
}
