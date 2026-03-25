interface NetworkChipProps {
  networkName: string | null
  isSupported: boolean
}

export function NetworkChip({ networkName, isSupported }: NetworkChipProps) {
  if (!networkName) return null

  return (
    <span
      data-testid="network-chip"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border ${
        isSupported
          ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10'
          : 'text-amber-400 border-amber-400/20 bg-amber-400/10'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isSupported ? 'bg-emerald-400' : 'bg-amber-400'}`} />
      {networkName}
    </span>
  )
}
