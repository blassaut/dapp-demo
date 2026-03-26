import { useLeaderboard, formatLeaderboardAmount } from '../hooks/useLeaderboard'

interface LeaderboardProps {
  contractAddress: string
  rpcUrl: string
  currentAddress?: string | null
  contractBalance?: string
}

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export function Leaderboard({ contractAddress, rpcUrl, currentAddress, contractBalance }: LeaderboardProps) {
  const { entries, loading } = useLeaderboard(contractAddress, rpcUrl)

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-dark-800/30 backdrop-blur-sm p-4">
        <p className="text-[10px] font-mono text-muted/40 uppercase tracking-wider mb-2">Top depositors</p>
        <p className="text-[10px] font-mono text-muted/20 animate-pulse text-center py-3">loading...</p>
      </div>
    )
  }

  if (entries.length === 0) return null

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-dark-800/30 backdrop-blur-sm p-4">
      {contractBalance && contractBalance !== '0' && (
        <div className="mb-3 pb-3 border-b border-white/[0.06]">
          <p className="text-[10px] font-mono text-muted/40 uppercase tracking-wider mb-1">Total in contract</p>
          <p data-testid="contract-balance" className="text-sm font-mono text-teal-400/80 font-medium">{contractBalance} ETH</p>
        </div>
      )}
      <p className="text-[10px] font-mono text-muted/40 uppercase tracking-wider mb-2">Top depositors</p>
      <div className="space-y-1">
        {entries.map((entry, i) => {
          const isYou = currentAddress?.toLowerCase() === entry.address.toLowerCase()
          return (
            <div
              key={entry.address}
              className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg ${
                isYou ? 'bg-teal-400/[0.06]' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-muted/30 w-4">{i + 1}.</span>
                <span className={`text-[10px] font-mono ${isYou ? 'text-teal-400/70' : 'text-muted/40'}`}>
                  {truncateAddress(entry.address)}
                  {isYou && <span className="ml-1 text-teal-400/50">(you)</span>}
                </span>
              </div>
              <span className="text-[10px] font-mono text-teal-400/60 whitespace-nowrap">
                {formatLeaderboardAmount(entry.totalDeposited)} ETH
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
