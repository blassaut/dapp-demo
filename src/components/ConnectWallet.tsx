interface ConnectWalletProps {
  address: string | null
  hasInjectedWallet: boolean
  onConnect: () => void
  onConnectWalletConnect: () => void
  onDisconnect?: () => void
}

const primaryButtonClass =
  'w-full px-5 py-3.5 bg-teal-400 text-dark-900 font-body font-semibold text-sm rounded-xl shadow-[0_0_20px_rgba(20,184,166,0.15)] hover:bg-teal-300 hover:shadow-[0_0_40px_rgba(20,184,166,0.4)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200'

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function ConnectWallet({ address, hasInjectedWallet, onConnect, onConnectWalletConnect, onDisconnect }: ConnectWalletProps) {
  if (address) {
    return (
      <div className="flex items-center gap-2">
        <span
          data-testid="wallet-address"
          className="font-mono text-xs text-teal-400/80 bg-teal-400/[0.06] border border-teal-400/10 px-2.5 py-1 rounded-lg"
        >
          {truncateAddress(address)}
        </span>
        {onDisconnect && (
          <button
            data-testid="wallet-disconnect-button"
            onClick={onDisconnect}
            className="text-muted/30 hover:text-muted/60 transition-colors text-xs"
            title="Disconnect"
          >
            &times;
          </button>
        )}
      </div>
    )
  }

  if (hasInjectedWallet) {
    return (
      <div className="space-y-1.5">
        <button
          data-testid="wallet-connect-button"
          onClick={onConnect}
          className={primaryButtonClass}
        >
          Connect Wallet
        </button>
        <button
          data-testid="walletconnect-button"
          onClick={onConnectWalletConnect}
          className="w-full px-4 py-1.5 text-xs font-mono text-muted/60 hover:text-muted/90 transition-colors"
        >
          or use WalletConnect
        </button>
      </div>
    )
  }

  // No injected wallet (mobile browser, etc.) — WalletConnect is the primary option
  return (
    <button
      data-testid="wallet-connect-button"
      onClick={onConnectWalletConnect}
      className={primaryButtonClass}
    >
      Connect Wallet
    </button>
  )
}
