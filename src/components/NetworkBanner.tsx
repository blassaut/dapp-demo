import { useState } from 'react'
import { HOODI_CHAIN_ID, HOODI_NETWORK_NAME, HOODI_RPC_URL, HOODI_EXPLORER_URL } from '../lib/constants'
import type { Eip1193Provider } from '../lib/types'

const HOODI_CHAIN_HEX = `0x${HOODI_CHAIN_ID.toString(16)}`

interface NetworkBannerProps {
  networkName: string | null
  provider: Eip1193Provider | null
}

export function NetworkBanner({ networkName, provider }: NetworkBannerProps) {
  const [switching, setSwitching] = useState(false)

  if (!networkName) return null

  const handleSwitch = async () => {
    if (!provider) return
    setSwitching(true)
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: HOODI_CHAIN_HEX }],
      })
    } catch (err: unknown) {
      // Error code 4902 = chain not added yet — try adding it
      if ((err as { code?: number }).code === 4902) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: HOODI_CHAIN_HEX,
                chainName: HOODI_NETWORK_NAME,
                nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
                rpcUrls: [HOODI_RPC_URL],
                blockExplorerUrls: [HOODI_EXPLORER_URL],
              },
            ],
          })
        } catch {
          // User rejected adding the chain
        }
      }
    } finally {
      setSwitching(false)
    }
  }

  return (
    <div
      data-testid="network-banner-unsupported"
      className="w-full p-4 rounded-xl border border-amber-400/20 bg-amber-400/5 text-center"
    >
      <p className="text-amber-400 font-body text-sm font-medium">
        Unsupported network detected: {networkName}
      </p>
      <button
        onClick={handleSwitch}
        disabled={switching || !provider}
        className="mt-2 px-4 py-1.5 rounded-lg bg-amber-400/20 text-amber-400 font-body text-xs font-medium hover:bg-amber-400/30 transition-colors disabled:opacity-50"
      >
        {switching ? 'Switching…' : `Switch to ${HOODI_NETWORK_NAME}`}
      </button>
    </div>
  )
}
