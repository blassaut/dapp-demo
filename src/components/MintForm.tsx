import { useState, useEffect, useRef } from 'react'
import { AppState } from '../lib/types'
import { MINT_RATE } from '../lib/constants'

interface MintFormProps {
  appState: AppState
  walletBalance: string | null
  onMint: (ethAmount: string) => void
}

export function MintForm({ appState, walletBalance, onMint }: MintFormProps) {
  const [ethAmount, setEthAmount] = useState('')
  const prevAppState = useRef(appState)

  useEffect(() => {
    if (prevAppState.current !== AppState.Confirmed && appState === AppState.Confirmed) {
      setEthAmount('')
    }
    prevAppState.current = appState
  }, [appState])

  const isBusy = appState === AppState.Pending || appState === AppState.Approving || appState === AppState.Depositing
  const parsed = parseFloat(ethAmount) || 0
  const estimatedLkbox = parsed * MINT_RATE
  const mintDisabled = isBusy || parsed <= 0

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-mono text-muted/40 uppercase tracking-wider">Mint LKBOX</p>
        <p className="text-[10px] font-mono text-muted/30">1 ETH = {MINT_RATE} LKBOX</p>
      </div>
      <div className="flex gap-2.5 items-center">
        <div className="relative flex-1">
          <input
            data-testid="mint-eth-input"
            type="number"
            placeholder="0.0"
            value={ethAmount}
            onChange={(e) => setEthAmount(e.target.value)}
            disabled={isBusy}
            min="0"
            step="0.01"
            className="w-full px-4 py-3.5 rounded-xl bg-dark-900/60 border border-white/[0.06] text-light font-mono text-lg placeholder:text-muted/20 focus:border-teal-400/30 focus:outline-none focus:ring-1 focus:ring-teal-400/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-muted/30">ETH</span>
        </div>
        <span className="text-muted/30 text-lg">&rarr;</span>
        <p className="text-sm font-mono text-teal-400/70 min-w-[80px] text-right">
          {estimatedLkbox > 0 ? estimatedLkbox.toLocaleString() : '0'} LKBOX
        </p>
      </div>
      <button
        data-testid="mint-lkbox-btn"
        onClick={() => onMint(ethAmount)}
        disabled={mintDisabled}
        className={`w-full px-5 py-3 bg-teal-400 text-dark-900 font-body font-semibold text-sm rounded-xl hover:bg-teal-300 hover:shadow-[0_0_32px_rgba(20,184,166,0.3)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:bg-teal-400 disabled:hover:translate-y-0 ${isBusy ? 'animate-shimmer' : ''}`}
      >
        <span className={isBusy ? 'animate-pulse-soft' : ''}>{appState === AppState.Pending ? 'Minting...' : 'Mint LKBOX'}</span>
      </button>
    </div>
  )
}
