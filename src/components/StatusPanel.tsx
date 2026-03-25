const EXPLORER_URL = 'https://hoodi.etherscan.io'

function getTxUrl(txHash: string): string {
  return `${EXPLORER_URL}/tx/${txHash}`
}

function truncateHash(hash: string): string {
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`
}

interface StatusPanelProps {
  statusMessage: string
  lastAction: string
  txHash: string | null
}

export function StatusPanel({ statusMessage, lastAction, txHash }: StatusPanelProps) {
  return (
    <div data-testid="status-panel" className="px-6 py-3.5">
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
