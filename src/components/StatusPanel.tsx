interface StatusPanelProps {
  statusMessage: string
  lastAction: string
}

export function StatusPanel({ statusMessage, lastAction }: StatusPanelProps) {
  return (
    <div data-testid="status-panel" className="w-full rounded-xl border border-white/5 bg-dark-800/30 px-5 py-4">
      <p data-testid="status-current" className="font-mono text-xs text-muted/60 min-h-[1.25rem]">
        {statusMessage}
      </p>
      <p data-testid="status-last-action" className="font-mono text-xs text-light/80 mt-1 min-h-[1.25rem]">
        {lastAction}
      </p>
    </div>
  )
}
