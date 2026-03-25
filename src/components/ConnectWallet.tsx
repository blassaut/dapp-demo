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
      <p data-testid="wallet-not-detected" className="text-sm text-red-400 font-body">
        MetaMask not detected. Install MetaMask to continue.
      </p>
    )
  }

  if (address) {
    return (
      <span
        data-testid="wallet-address"
        className="font-mono text-sm text-teal-400 bg-teal-400/10 border border-teal-400/20 px-3 py-1.5 rounded-lg"
      >
        {truncateAddress(address)}
      </span>
    )
  }

  return (
    <button
      data-testid="wallet-connect-button"
      onClick={onConnect}
      className="px-5 py-2.5 bg-teal-400 text-dark-900 font-body font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all"
    >
      Connect Wallet
    </button>
  )
}
