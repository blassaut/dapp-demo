interface LockedBalanceProps {
  balance: string
}

export function LockedBalance({ balance }: LockedBalanceProps) {
  return (
    <div data-testid="lockbox-balance" className="text-center py-4">
      <p className="text-4xl font-heading font-bold text-teal-400 tracking-tight">{balance} ETH</p>
      <p className="text-[10px] font-mono text-muted/40 mt-2 uppercase tracking-wider">Locked balance</p>
    </div>
  )
}
