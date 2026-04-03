import { useState, useEffect } from 'react'
import { JsonRpcProvider, Contract, formatEther } from 'ethers'
import { queryAllEvents } from '../lib/query-events'

const LOCKBOX_ABI = [
  'event Deposited(address indexed user, uint256 amount)',
  'event Withdrawn(address indexed user, uint256 amount)',
]

export interface LeaderboardEntry {
  address: string
  totalDeposited: bigint
}

export function useLeaderboard(contractAddress: string, rpcUrl: string) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!contractAddress || !rpcUrl) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function fetchLeaderboard() {
      try {
        const provider = new JsonRpcProvider(rpcUrl)
        const contract = new Contract(contractAddress, LOCKBOX_ABI, provider)

        const currentBlock = await provider.getBlockNumber()

        const [depositEvents, withdrawEvents] = await Promise.all([
          queryAllEvents(contract, contract.filters.Deposited(), currentBlock),
          queryAllEvents(contract, contract.filters.Withdrawn(), currentBlock),
        ])

        const balances = new Map<string, bigint>()

        for (const event of depositEvents) {
          const user = event.args[0] as string
          const amount = event.args[1] as bigint
          balances.set(user, (balances.get(user) ?? 0n) + amount)
        }

        for (const event of withdrawEvents) {
          const user = event.args[0] as string
          const amount = event.args[1] as bigint
          balances.set(user, (balances.get(user) ?? 0n) - amount)
        }

        if (cancelled) return

        const sorted = Array.from(balances.entries())
          .filter(([, total]) => total > 0n)
          .sort((a, b) => (b[1] > a[1] ? 1 : b[1] < a[1] ? -1 : 0))
          .slice(0, 5)
          .map(([address, totalDeposited]) => ({ address, totalDeposited }))

        setEntries(sorted)
      } catch {
        // silently fail — leaderboard is non-critical
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchLeaderboard()
    return () => { cancelled = true }
  }, [contractAddress, rpcUrl])

  return { entries, loading }
}

export function formatLeaderboardAmount(amount: bigint): string {
  return formatEther(amount)
}
