import { useState } from 'react'
import type { TxRecord } from '../lib/types'

const EXPLORER_URL = 'https://hoodi.etherscan.io'
const PAGE_SIZE = 5

function truncateHash(hash: string): string {
  return `${hash.slice(0, 10)}...${hash.slice(-6)}`
}

interface TxHistoryProps {
  records: TxRecord[]
}

export function TxHistory({ records }: TxHistoryProps) {
  const [expanded, setExpanded] = useState(false)

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
            href={`${EXPLORER_URL}/tx/${record.txHash}`}
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
