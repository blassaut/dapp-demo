interface StatusPanelProps {
  statusMessage: string
  lastAction: string
}

export function StatusPanel({ statusMessage, lastAction }: StatusPanelProps) {
  return (
    <div data-testid="status-panel" className="px-6 py-3.5">
      <p data-testid="status-current" className="font-mono text-[11px] text-muted/50 min-h-[1rem] leading-relaxed">
        {statusMessage}
      </p>
      {lastAction && (
        <p data-testid="status-last-action" className="font-mono text-[11px] text-teal-400/70 mt-0.5 min-h-[1rem] leading-relaxed">
          {lastAction}
        </p>
      )}
      {!lastAction && (
        <p data-testid="status-last-action" className="min-h-0" />
      )}
    </div>
  )
}
