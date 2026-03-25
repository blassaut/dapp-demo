interface ConnectWalletProps {
  address: string | null
  isNoWallet: boolean
  onConnect: () => void
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function ConnectWallet({ address, isNoWallet, onConnect }: ConnectWalletProps) {
  if (isNoWallet) {
    return (
      <p data-testid="wallet-not-detected" className="text-sm text-red-400/80 font-body">
        MetaMask not detected. Install MetaMask to continue.
      </p>
    )
  }

  if (address) {
    return (
      <span
        data-testid="wallet-address"
        className="font-mono text-xs text-teal-400/80 bg-teal-400/[0.06] border border-teal-400/10 px-2.5 py-1 rounded-lg"
      >
        {truncateAddress(address)}
      </span>
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
