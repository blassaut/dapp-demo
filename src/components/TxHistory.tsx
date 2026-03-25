import type { TxRecord } from '../lib/types'

const EXPLORER_URL = 'https://hoodi.etherscan.io'

function truncateHash(hash: string): string {
  return `${hash.slice(0, 10)}...${hash.slice(-6)}`
}

interface TxHistoryProps {
  records: TxRecord[]
}

export function TxHistory({ records }: TxHistoryProps) {
  if (records.length === 0) return null

  return (
    <div data-testid="tx-history" className="space-y-1.5">
      <p className="text-[10px] font-mono text-muted/40 uppercase tracking-wider">History</p>
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {records.map((record) => (
          <a
            key={record.txHash}
            data-testid="tx-history-item"
            href={`${EXPLORER_URL}/tx/${record.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between py-1.5 px-2.5 rounded-lg hover:bg-white/[0.02] transition-colors group"
          >
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono font-medium ${
                record.type === 'deposit' ? 'text-teal-400/70' : 'text-amber-400/70'
              }`}>
                {record.type === 'deposit' ? '+' : '-'}{record.amount} ETH
              </span>
            </div>
            <span className="text-[10px] font-mono text-muted/25 group-hover:text-muted/40 transition-colors">
              {truncateHash(record.txHash)}
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}
