interface ConnectWalletProps {
  address: string | null
  isNoWallet: boolean
  onConnect: () => void
  onDisconnect?: () => void
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function ConnectWallet({ address, isNoWallet, onConnect, onDisconnect }: ConnectWalletProps) {
  if (isNoWallet) {
    return (
      <p data-testid="wallet-not-detected" className="text-sm text-red-400/80 font-body">
        MetaMask not detected. Install MetaMask to continue.
      </p>
    )
  }

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

  return (
    <button
      data-testid="wallet-connect-button"
      onClick={onConnect}
      className="w-full px-5 py-3 bg-teal-400 text-dark-900 font-body font-semibold text-sm rounded-xl hover:bg-teal-400/90 hover:shadow-[0_0_24px_rgba(20,184,166,0.2)] transition-all"
    >
      Connect Wallet
    </button>
  )
}
