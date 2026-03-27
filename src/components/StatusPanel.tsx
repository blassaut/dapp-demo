import { getTxUrl, truncateHash } from '../lib/explorer'

interface StatusPanelProps {
  statusMessage: string
  lastAction: string
  txHash: string | null
}

export function StatusPanel({ statusMessage, lastAction, txHash }: StatusPanelProps) {
  return (
    <div data-testid="tx-status" className="px-6 py-3.5">
      <p data-testid="status-current" className="font-mono text-[11px] text-muted/50 min-h-[1rem] leading-relaxed">
        {statusMessage}
      </p>
      {lastAction && (
        <div className="mt-0.5">
          <p data-testid="status-last-action" className="font-mono text-[11px] text-teal-400/70 min-h-[1rem] leading-relaxed">
            {lastAction}
          </p>
          {txHash && (
            <a
              data-testid="status-tx-link"
              href={getTxUrl(txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[10px] text-muted/40 hover:text-teal-400/60 transition-colors"
            >
              {truncateHash(txHash)} &rarr;
            </a>
          )}
        </div>
      )}
      {!lastAction && (
        <p data-testid="status-last-action" className="min-h-0" />
      )}
    </div>
  )
}
