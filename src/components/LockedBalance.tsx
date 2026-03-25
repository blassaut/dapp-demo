interface LockedBalanceProps {
  balance: string
}

export function LockedBalance({ balance }: LockedBalanceProps) {
  return (
    <div data-testid="lockbox-balance" className="text-center">
      <p className="text-3xl font-heading font-bold text-teal-400">{balance} ETH</p>
      <p className="text-[10px] font-mono text-muted/50 mt-1 uppercase tracking-wider">Locked balance</p>
    </div>
  )
}
