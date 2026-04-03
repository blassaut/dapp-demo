import { formatLeaderboardAmount } from '../hooks/useLeaderboard'
import type { LeaderboardEntry } from '../hooks/useLeaderboard'

interface LeaderboardProps {
  entries: LeaderboardEntry[]
  loading: boolean
  currentAddress?: string | null
  contractBalance?: string
}

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

const RANK_BADGES = ['🥇', '🥈', '🥉'] as const

export function Leaderboard({ entries, loading, currentAddress, contractBalance }: LeaderboardProps) {

  const hasBalance = contractBalance && contractBalance !== '0'
  const hasEntries = entries.length > 0

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-dark-800/30 backdrop-blur-sm p-4">
        <p className="text-[10px] font-mono text-muted/40 uppercase tracking-wider mb-2">Top depositors</p>
        <div className="flex justify-center py-4">
          <svg className="animate-spin h-5 w-5 text-teal-400/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>
    )
  }

  if (!hasBalance && !hasEntries) return null

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-dark-800/30 backdrop-blur-sm p-4">
      {hasBalance && (
        <div className={hasEntries ? 'mb-3 pb-3 border-b border-white/[0.06]' : ''}>
          <p className="text-[10px] font-mono text-muted/40 uppercase tracking-wider mb-1">Total in contract</p>
          <p data-testid="contract-balance" className="text-sm font-mono text-teal-400/80 font-medium">{contractBalance} ETH</p>
        </div>
      )}
      {hasEntries && (
        <>
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
                    <span
                      className={`text-[10px] font-mono text-muted/30 w-5 inline-block ${RANK_BADGES[i] && isYou ? 'animate-badge-bounce' : ''}`}
                      style={RANK_BADGES[i] && isYou ? { animationDelay: `${i * 120 + 300}ms` } : undefined}
                    >{isYou && RANK_BADGES[i] ? RANK_BADGES[i] : `${i + 1}.`}</span>
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
        </>
      )}
    </div>
  )
}
