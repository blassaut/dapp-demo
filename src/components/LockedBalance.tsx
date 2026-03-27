interface LockedBalanceProps {
  lkboxBalance: string
  lockedBalance: string
}

export function LockedBalance({ lkboxBalance, lockedBalance }: LockedBalanceProps) {
  return (
    <div className="text-center py-4">
      <p data-testid="lkbox-balance" className="text-sm font-mono text-muted/50">
        Wallet: <span className="text-teal-400/80">{lkboxBalance} LKBOX</span>
      </p>
      <p data-testid="locked-balance" className="text-4xl font-heading font-bold text-teal-400 tracking-tight mt-1">
        {lockedBalance} LKBOX
      </p>
      <p className="text-[10px] font-mono text-muted/40 mt-2 uppercase tracking-wider">Locked balance</p>
    </div>
  )
}
