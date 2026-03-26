interface LockedBalanceProps {
  balance: string
  contractBalance: string
}

export function LockedBalance({ balance, contractBalance }: LockedBalanceProps) {
  return (
    <div data-testid="lockbox-balance" className="text-center py-4">
      <p className="text-4xl font-heading font-bold text-teal-400 tracking-tight">{balance} ETH</p>
      <p className="text-[10px] font-mono text-muted/40 mt-2 uppercase tracking-wider">Locked balance</p>
      <p data-testid="contract-balance" className="text-xs font-mono text-muted/70 mt-3">
        Total in contract: {contractBalance} ETH
      </p>
    </div>
  )
}
