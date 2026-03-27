import { useState } from 'react'
import type { TxRecord } from '../lib/types'
import { getTxUrl, truncateHash } from '../lib/explorer'

const PAGE_SIZE = 5

interface TxHistoryProps {
  records: TxRecord[]
}

function txColor(type: TxRecord['type']): string {
  switch (type) {
    case 'mint': return 'text-blue-400/70'
    case 'deposit': return 'text-teal-400/70'
    case 'withdrawal': return 'text-amber-400/70'
  }
}

function txLabel(type: TxRecord['type']): string {
  switch (type) {
    case 'mint': return 'Mint'
    case 'deposit': return 'Deposit'
    case 'withdrawal': return 'Withdraw'
  }
}

export function TxHistory({ records }: TxHistoryProps) {
  const [page, setPage] = useState(0)

  if (records.length === 0) return null

  const totalPages = Math.ceil(records.length / PAGE_SIZE)
  const visible = records.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div data-testid="tx-history" className="space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-mono text-muted/40 uppercase tracking-wider">History</p>
        {totalPages > 1 && (
          <p className="text-[10px] font-mono text-muted/25">{page + 1}/{totalPages}</p>
        )}
      </div>
      <div className="space-y-1" style={{ minHeight: `${PAGE_SIZE * 32}px` }}>
        {visible.map((record) => (
          <a
            key={record.txHash}
            data-testid="tx-history-item"
            href={getTxUrl(record.txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between py-1.5 px-2.5 rounded-lg hover:bg-white/[0.02] transition-colors group"
          >
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono font-medium ${txColor(record.type)}`}>
                {txLabel(record.type)}
              </span>
              <span className={`text-[10px] font-mono font-medium ${txColor(record.type)}`}>
                {record.amount} LKBOX
              </span>
            </div>
            <span className="text-[10px] font-mono text-muted/25 group-hover:text-muted/40 transition-colors">
              {truncateHash(record.txHash)}
            </span>
          </a>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
            className="flex-1 text-[10px] font-mono text-teal-400/40 hover:text-teal-400/70 border border-teal-400/15 hover:border-teal-400/30 rounded-lg transition-colors py-1.5 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:text-teal-400/40 disabled:hover:border-teal-400/15"
          >
            Prev
          </button>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages - 1}
            className="flex-1 text-[10px] font-mono text-teal-400/40 hover:text-teal-400/70 border border-teal-400/15 hover:border-teal-400/30 rounded-lg transition-colors py-1.5 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:text-teal-400/40 disabled:hover:border-teal-400/15"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
