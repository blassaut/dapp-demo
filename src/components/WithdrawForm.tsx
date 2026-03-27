import { useState, useEffect, useRef } from 'react'
import { parseEther } from 'ethers'
import { AppState } from '../lib/types'

interface WithdrawFormProps {
  appState: AppState
  lockedBalance: string
  onWithdraw: (amount: string) => void
}

export function WithdrawForm({ appState, lockedBalance, onWithdraw }: WithdrawFormProps) {
  const [amount, setAmount] = useState('')
  const prevAppState = useRef(appState)

  useEffect(() => {
    if (prevAppState.current !== AppState.Confirmed && appState === AppState.Confirmed) {
      setAmount('')
    }
    prevAppState.current = appState
  }, [appState])

  const isBusy = appState === AppState.Pending || appState === AppState.Approving || appState === AppState.Depositing
  const parsed = parseFloat(amount) || 0

  let exceedsLocked = false
  try {
    if (amount && parsed > 0) {
      exceedsLocked = parseEther(amount) > parseEther(lockedBalance || '0')
    }
  } catch {
    exceedsLocked = true
  }

  const withdrawDisabled = isBusy || parsed <= 0 || exceedsLocked

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-mono text-muted/40 uppercase tracking-wider">Withdraw LKBOX</p>
      <div className="relative">
        <input
          data-testid="withdraw-input"
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
            onClick={() => setAmount(lockedBalance)}
            disabled={isBusy || !lockedBalance || lockedBalance === '0'}
            className="text-[9px] font-mono text-teal-400/50 hover:text-teal-400 border border-teal-400/20 hover:border-teal-400/40 rounded px-1.5 py-0.5 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
          >
            MAX
          </button>
          <span className="text-xs font-mono text-muted/30">LKBOX</span>
        </div>
      </div>
      <button
        data-testid="withdraw-btn"
        onClick={() => onWithdraw(amount)}
        disabled={withdrawDisabled}
        className="w-full px-5 py-3 border border-white/[0.08] text-light/70 font-body font-semibold text-sm rounded-xl hover:bg-white/[0.03] hover:border-white/[0.12] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-white/[0.08] disabled:hover:translate-y-0"
      >
        {appState === AppState.Pending ? 'Withdrawing...' : 'Withdraw'}
      </button>
      {exceedsLocked && parsed > 0 && (
        <p className="text-[11px] font-mono text-muted/40">Max: {lockedBalance} LKBOX</p>
      )}
    </div>
  )
}
