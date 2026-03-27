import { useState, useEffect, useRef } from 'react'
import { parseEther } from 'ethers'
import { AppState } from '../lib/types'

interface DepositFormProps {
  appState: AppState
  lkboxBalance: string
  onDeposit: (amount: string) => void
}

export function DepositForm({ appState, lkboxBalance, onDeposit }: DepositFormProps) {
  const [amount, setAmount] = useState('')
  const prevAppState = useRef(appState)

  useEffect(() => {
    if (prevAppState.current !== AppState.Confirmed && appState === AppState.Confirmed) {
      setAmount('')
    }
    prevAppState.current = appState
  }, [appState])

  const isBusy = appState === AppState.Approving || appState === AppState.Depositing || appState === AppState.Pending
  const parsed = parseFloat(amount) || 0

  let exceedsBalance = false
  try {
    if (amount && parsed > 0) {
      exceedsBalance = parseEther(amount) > parseEther(lkboxBalance || '0')
    }
  } catch {
    exceedsBalance = true
  }

  const depositDisabled = isBusy || parsed <= 0 || exceedsBalance

  const buttonLabel = appState === AppState.Approving
    ? 'Approving...'
    : appState === AppState.Depositing
      ? 'Depositing...'
      : 'Approve & Deposit'

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-mono text-muted/40 uppercase tracking-wider">Deposit LKBOX</p>
        <p className="text-[10px] font-mono text-muted/30">climb the leaderboard</p>
      </div>
      <div className="relative">
        <input
          data-testid="deposit-input"
          type="number"
          placeholder="0.0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={isBusy}
          min="0"
          step="1"
          className="w-full px-4 py-3.5 rounded-xl bg-dark-900/60 border border-white/[0.06] text-light font-mono text-lg placeholder:text-muted/20 focus:border-teal-400/30 focus:outline-none focus:ring-1 focus:ring-teal-400/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAmount(lkboxBalance)}
            disabled={isBusy || !lkboxBalance || lkboxBalance === '0'}
            className="text-[9px] font-mono text-teal-400/50 hover:text-teal-400 border border-teal-400/20 hover:border-teal-400/40 rounded px-1.5 py-0.5 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
          >
            MAX
          </button>
          <span className="text-xs font-mono text-muted/30">LKBOX</span>
        </div>
      </div>
      <div className="flex gap-2.5">
        <button
          data-testid={appState === AppState.Approving ? 'approve-btn' : 'deposit-btn'}
          onClick={() => onDeposit(amount)}
          disabled={depositDisabled}
          className={`flex-1 px-5 py-3 bg-teal-400 text-dark-900 font-body font-semibold text-sm rounded-xl hover:bg-teal-300 hover:shadow-[0_0_32px_rgba(20,184,166,0.3)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:bg-teal-400 disabled:hover:translate-y-0 ${isBusy ? 'animate-shimmer' : ''}`}
        >
          <span className={isBusy ? 'animate-pulse-soft' : ''}>{buttonLabel}</span>
        </button>
      </div>
      {exceedsBalance && parsed > 0 && (
        <p className="text-[11px] font-mono text-muted/40">Max: {lkboxBalance} LKBOX</p>
      )}
    </div>
  )
}
