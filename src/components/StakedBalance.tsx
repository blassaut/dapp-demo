interface StakedBalanceProps {
  balance: string
}

export function StakedBalance({ balance }: StakedBalanceProps) {
  return (
    <div data-testid="staking-balance" className="text-center">
      <p className="text-3xl font-heading font-bold text-teal-400">{balance} ETH</p>
      <p className="text-[10px] font-mono text-muted/50 mt-1 uppercase tracking-wider">Staked balance</p>
    </div>
  )
}
