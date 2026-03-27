import { useState, useEffect, useCallback } from 'react'
import { JsonRpcProvider, Contract, formatEther, EventLog } from 'ethers'
import { BLOCK_RANGE } from '../lib/constants'

const LOCKBOX_ABI = [
  'event Deposited(address indexed user, uint256 amount)',
  'event Withdrawn(address indexed user, uint256 amount)',
]

export interface LeaderboardEntry {
  address: string
  lockedBalance: bigint
}

export function useLeaderboard(lockboxAddress: string, rpcUrl: string) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  useEffect(() => {
    if (!lockboxAddress || !rpcUrl) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function fetchLeaderboard() {
      try {
        const provider = new JsonRpcProvider(rpcUrl)
        const contract = new Contract(lockboxAddress, LOCKBOX_ABI, provider)

        const currentBlock = await provider.getBlockNumber()
        const fromBlock = Math.max(0, currentBlock - BLOCK_RANGE)

        const [depositEvents, withdrawEvents] = await Promise.all([
          contract.queryFilter(contract.filters.Deposited(), fromBlock, currentBlock),
          contract.queryFilter(contract.filters.Withdrawn(), fromBlock, currentBlock),
        ])

        const balances = new Map<string, bigint>()

        for (const event of depositEvents) {
          if (event instanceof EventLog) {
            const user = event.args[0] as string
            const amount = event.args[1] as bigint
            balances.set(user, (balances.get(user) ?? 0n) + amount)
          }
        }

        for (const event of withdrawEvents) {
          if (event instanceof EventLog) {
            const user = event.args[0] as string
            const amount = event.args[1] as bigint
            balances.set(user, (balances.get(user) ?? 0n) - amount)
          }
        }

        if (cancelled) return

        const sorted = Array.from(balances.entries())
          .filter(([, total]) => total > 0n)
          .sort((a, b) => (b[1] > a[1] ? 1 : b[1] < a[1] ? -1 : 0))
          .slice(0, 5)
          .map(([address, lockedBalance]) => ({ address, lockedBalance }))

        setEntries(sorted)
      } catch (err) {
        console.warn('[leaderboard] fetch failed:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchLeaderboard()
    return () => { cancelled = true }
  }, [lockboxAddress, rpcUrl, refreshKey])

  return { entries, loading, refresh }
}

export function formatLeaderboardAmount(amount: bigint): string {
  return formatEther(amount)
}
