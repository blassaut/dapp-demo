import { formatLeaderboardAmount, type LeaderboardEntry } from '../hooks/useLeaderboard'

interface LeaderboardProps {
  entries: LeaderboardEntry[]
  loading: boolean
  currentAddress?: string | null
}

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

const RANK_BADGES = ['\u{1F947}', '\u{1F948}', '\u{1F949}'] as const

export function Leaderboard({ entries, loading, currentAddress }: LeaderboardProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-dark-800/30 backdrop-blur-sm p-4">
        <p className="text-[10px] font-mono text-muted/40 uppercase tracking-wider mb-2">Top lockers</p>
        <p className="text-[10px] font-mono text-muted/20 animate-pulse text-center py-3">loading...</p>
      </div>
    )
  }

  if (entries.length === 0) return null

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-dark-800/30 backdrop-blur-sm p-4">
      <p className="text-[10px] font-mono text-muted/40 uppercase tracking-wider mb-2">Top lockers</p>
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
                {formatLeaderboardAmount(entry.lockedBalance)} LKBOX
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
