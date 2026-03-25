import { useState, useEffect, useRef } from 'react'
import { parseEther } from 'ethers'
import { AppState } from '../lib/types'

interface DepositFormProps {
  appState: AppState
  balance: string
  walletBalance: string | null
  isConnected: boolean
  isSupported: boolean
  onDeposit: (amount: string) => void
  onWithdraw: (amount: string) => void
}

export function DepositForm({
  appState,
  balance,
  walletBalance,
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

  // Use BigInt/wei comparison to avoid floating-point precision issues
  let exceedsLockedBalance = false
  try {
    if (amount && parsedAmount > 0) {
      exceedsLockedBalance = parseEther(amount) > parseEther(balance || '0')
    }
  } catch {
    exceedsLockedBalance = true
  }

  let exceedsWalletBalance = false
  try {
    if (amount && parsedAmount > 0 && walletBalance) {
      exceedsWalletBalance = parseEther(amount) > parseEther(walletBalance)
    }
  } catch {
    exceedsWalletBalance = true
  }

  const depositDisabled = !canInteract || parsedAmount <= 0 || exceedsWalletBalance
  const withdrawDisabled = !canInteract || parsedAmount <= 0 || exceedsLockedBalance

  const hasBalance = parseFloat(balance || '0') > 0
  const depositHint = exceedsWalletBalance && parsedAmount > 0
    ? `Max deposit: ${walletBalance} ETH`
    : undefined
  const withdrawHint = !hasBalance
    ? 'No locked balance to withdraw'
    : exceedsLockedBalance && parsedAmount > 0
      ? `Max withdraw: ${balance} ETH`
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
          className={`flex-1 px-5 py-3 bg-teal-400 text-dark-900 font-body font-semibold text-sm rounded-xl hover:bg-teal-300 hover:shadow-[0_0_32px_rgba(20,184,166,0.3)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:bg-teal-400 disabled:hover:translate-y-0 ${isPending ? 'animate-shimmer' : ''}`}
        >
          <span className={isPending ? 'animate-pulse-soft' : ''}>{isPending ? 'Processing...' : 'Deposit'}</span>
        </button>
        <button
          data-testid="lockbox-button-withdraw"
          onClick={() => onWithdraw(amount)}
          disabled={withdrawDisabled}
          className="flex-1 px-5 py-3 border border-white/[0.08] text-light/70 font-body font-semibold text-sm rounded-xl hover:bg-white/[0.03] hover:border-white/[0.12] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-white/[0.08] disabled:hover:translate-y-0"
        >
          Withdraw
        </button>
      </div>
      {(depositHint || withdrawHint) && (
        <div className="flex justify-between text-[11px] font-mono text-muted/40">
          <p data-testid="deposit-hint">{depositHint ?? ''}</p>
          <p data-testid="withdraw-hint">{withdrawHint ?? ''}</p>
        </div>
      )}
    </div>
  )
}
