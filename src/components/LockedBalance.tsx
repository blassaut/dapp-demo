interface LockedBalanceProps {
  lockedBalance: string
}

export function LockedBalance({ lockedBalance }: LockedBalanceProps) {
  return (
    <div data-testid="locked-balance" className="text-center py-4">
      <p className="text-4xl font-heading font-bold text-teal-400 tracking-tight">{lockedBalance} LKBOX</p>
      <p className="text-[10px] font-mono text-muted/40 mt-2 uppercase tracking-wider">Locked balance</p>
    </div>
  )
}
