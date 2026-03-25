import { HOODI_NETWORK_NAME } from '../lib/constants'

interface NetworkBannerProps {
  networkName: string | null
}

export function NetworkBanner({ networkName }: NetworkBannerProps) {
  if (!networkName) return null

  return (
    <div
      data-testid="network-banner-unsupported"
      className="w-full p-4 rounded-xl border border-amber-400/20 bg-amber-400/5 text-center"
    >
      <p className="text-amber-400 font-body text-sm font-medium">
        Unsupported network detected: {networkName}
      </p>
      <p className="text-amber-400/60 font-body text-xs mt-1">
        Switch to {HOODI_NETWORK_NAME} to continue
      </p>
    </div>
  )
}
