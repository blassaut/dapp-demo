import { useState } from 'react'
import type { TxRecord } from '../lib/types'
import { getTxUrl, truncateHash } from '../lib/explorer'

const PAGE_SIZE = 5

interface TxHistoryProps {
  records: TxRecord[]
  loading?: boolean
}

export function TxHistory({ records, loading }: TxHistoryProps) {
  const [expanded, setExpanded] = useState(false)

  if (loading) {
    return (
      <div data-testid="tx-history" className="space-y-1.5">
        <p className="text-[10px] font-mono text-muted/40 uppercase tracking-wider">History</p>
        <div className="flex justify-center py-3">
          <svg className="animate-spin h-5 w-5 text-teal-400/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>
    )
  }

  if (records.length === 0) return null

  const visible = expanded ? records : records.slice(0, PAGE_SIZE)
  const hasMore = records.length > PAGE_SIZE

  return (
    <div data-testid="tx-history" className="space-y-1.5">
      <p className="text-[10px] font-mono text-muted/40 uppercase tracking-wider">History</p>
      <div className="space-y-1">
        {visible.map((record) => (
          <a
            key={record.txHash}
            data-testid="tx-history-item"
            href={getTxUrl(record.txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between py-1.5 px-2.5 rounded-lg hover:bg-white/[0.02] transition-colors group"
          >
            <span className={`text-[10px] font-mono font-medium ${
              record.type === 'deposit' ? 'text-teal-400/70' : 'text-amber-400/70'
            }`}>
              {record.type === 'deposit' ? '+' : '-'}{record.amount} ETH
            </span>
            <span className="text-[10px] font-mono text-muted/25 group-hover:text-muted/40 transition-colors">
              {truncateHash(record.txHash)}
            </span>
          </a>
        ))}
      </div>
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[10px] font-mono text-muted/30 hover:text-muted/50 transition-colors w-full text-center py-1"
        >
          {expanded ? 'Show less' : `Show all (${records.length})`}
        </button>
      )}
    </div>
  )
}
