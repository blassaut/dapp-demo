import { useState, useEffect, useRef } from 'react'
import { parseEther } from 'ethers'
import { AppState } from '../lib/types'

interface DepositFormProps {
  appState: AppState
  balance: string
  isConnected: boolean
  isSupported: boolean
  onDeposit: (amount: string) => void
  onWithdraw: (amount: string) => void
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
  const parsedAmount = parseFloat(amount) || 0
  const depositDisabled = !canInteract || parsedAmount <= 0

  // Use BigInt/wei comparison to avoid floating-point precision issues
  let exceedsBalance = false
  try {
    if (amount && parsedAmount > 0) {
      exceedsBalance = parseEther(amount) > parseEther(balance || '0')
    }
  } catch {
    exceedsBalance = true
  }
  const withdrawDisabled = !canInteract || parsedAmount <= 0 || exceedsBalance
  const withdrawTitle = exceedsBalance && parsedAmount > 0
    ? `Insufficient balance (max ${balance} ETH)`
    : undefined

  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          data-testid="lockbox-input-amount"
          type="number"
          placeholder="0.0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={!canInteract}
          min="0"
          step="0.01"
          className="w-full px-4 py-3.5 rounded-xl bg-dark-900/60 border border-white/[0.06] text-light font-mono text-lg placeholder:text-muted/20 focus:border-teal-400/30 focus:outline-none focus:ring-1 focus:ring-teal-400/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-muted/30">
          ETH
        </span>
      </div>

      <div className="flex gap-2.5">
        <button
          data-testid="lockbox-button-deposit"
          onClick={() => onDeposit(amount)}
          disabled={depositDisabled}
          className="flex-1 px-5 py-3 bg-teal-400 text-dark-900 font-body font-semibold text-sm rounded-xl hover:bg-teal-400/90 hover:shadow-[0_0_24px_rgba(20,184,166,0.2)] transition-all disabled:opacity-20 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:bg-teal-400"
        >
          {isPending ? 'Processing...' : 'Deposit'}
        </button>
        <button
          data-testid="lockbox-button-withdraw"
          onClick={() => onWithdraw(amount)}
          disabled={withdrawDisabled}
          title={withdrawTitle}
          className="flex-1 px-5 py-3 border border-white/[0.08] text-light/70 font-body font-semibold text-sm rounded-xl hover:bg-white/[0.03] hover:border-white/[0.12] transition-all disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-white/[0.08]"
        >
          Withdraw
        </button>
      </div>
    </div>
  )
}
