import { useMemo } from 'react'
import { useWallet } from './hooks/useWallet'
import { useNetwork } from './hooks/useNetwork'
import { useLockBox } from './hooks/useLockBox'
import { ContractProvider } from './lib/contract-provider'
import { AppState } from './lib/types'

import { ConnectWallet } from './components/ConnectWallet'
import { NetworkChip } from './components/NetworkChip'
import { NetworkBanner } from './components/NetworkBanner'
import { LockedBalance } from './components/LockedBalance'
import { DepositForm } from './components/DepositForm'
import { StatusPanel } from './components/StatusPanel'
import { TxHistory } from './components/TxHistory'

import { HARDHAT_CHAIN_ID, HARDHAT_RPC_URL, HOODI_RPC_URL } from './lib/constants'

const HOODI_CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS ?? ''
const HARDHAT_CONTRACT_ADDRESS = import.meta.env.VITE_HARDHAT_CONTRACT_ADDRESS ?? ''

function getContractAddress(chainId: number | null): string {
  if (chainId === HARDHAT_CHAIN_ID && HARDHAT_CONTRACT_ADDRESS) return HARDHAT_CONTRACT_ADDRESS
  return HOODI_CONTRACT_ADDRESS
}

const isValidAddress = (addr: string) => /^0x[a-fA-F0-9]{40}$/.test(addr)
const hasAnyValidAddress = isValidAddress(HOODI_CONTRACT_ADDRESS) || isValidAddress(HARDHAT_CONTRACT_ADDRESS)

function ConfigError() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-red-500/30 bg-red-950/20 backdrop-blur-sm overflow-hidden p-6 text-center">
          <h1 className="text-lg font-heading font-bold text-red-400 mb-2">Configuration Error</h1>
          <p className="text-sm font-mono text-red-300/70">
            Missing or invalid contract address. Set <code className="text-red-300">VITE_CONTRACT_ADDRESS</code> to a valid Ethereum address.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const { address, walletBalance, isConnected, hasInjectedWallet, provider, connect, connectWalletConnect, disconnect } = useWallet()
  const { chainId, networkName, isSupported } = useNetwork(isConnected, provider)

  const contractAddress = getContractAddress(chainId)

  const rpcUrl = chainId === HARDHAT_CHAIN_ID ? HARDHAT_RPC_URL : HOODI_RPC_URL

  const contractProvider = useMemo(() => {
    if (!isConnected || !provider || !isValidAddress(contractAddress)) return null
    return new ContractProvider(contractAddress, provider, rpcUrl)
  }, [isConnected, provider, contractAddress, rpcUrl])

  const { balance, contractBalance, appState, statusMessage, lastAction, lastTxHash, history, deposit, withdraw } = useLockBox({
    provider: contractProvider,
    isConnected,
    isSupported,
  })

  if (!hasAnyValidAddress) return <ConfigError />

  const currentStatus = statusMessage || ''

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Main card */}
      <div className="w-full max-w-sm">
        {/* Billboard */}
        <div className="text-center mb-3">
          <h1 className="text-lg font-heading font-bold text-light mb-0.5">LockBox - deposit & withdraw ETH</h1>
          <p className="text-[11px] font-mono text-teal-400/50">Live transactions on Hoodi testnet · end-to-end tested</p>
        </div>

        <div className="rounded-2xl border border-white/[0.10] bg-dark-800/50 backdrop-blur-sm overflow-hidden shadow-[0_0_50px_rgba(20,184,166,0.06)] hover:shadow-[0_0_70px_rgba(20,184,166,0.12)] hover:border-white/[0.15] hover:-translate-y-0.5 transition-all duration-300">
          {/* Card header */}
          {isConnected && (
            <div className="px-6 pt-6 pb-4 border-b border-white/[0.04]">
              <div className="flex items-center justify-between">
                <h1 className="text-lg font-heading font-bold text-light">LockBox</h1>
                <NetworkChip networkName={networkName} isSupported={isSupported} />
              </div>
            </div>
          )}

          {/* Card body */}
          <div className="px-6 py-5 space-y-5">
            {/* Wrong network banner */}
            {appState === AppState.UnsupportedNetwork && (
              <NetworkBanner networkName={networkName} provider={provider} />
            )}

            {/* Wallet connection */}
            {!isConnected && (
              <div className="py-6 text-center">
                <ConnectWallet
                  address={null}
                  hasInjectedWallet={hasInjectedWallet}
                  onConnect={connect}
                  onConnectWalletConnect={connectWalletConnect}
                />
              </div>
            )}

            {/* Connected state */}
            {isConnected && (
              <>
                {/* Address + wallet balance */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-muted/40 uppercase tracking-wider block">Wallet</span>
                    {walletBalance && (
                      <span className="text-xs font-mono text-muted/50">{walletBalance} ETH</span>
                    )}
                  </div>
                  <ConnectWallet
                    address={address}
                    hasInjectedWallet={hasInjectedWallet}
                    onConnect={connect}
                    onConnectWalletConnect={connectWalletConnect}
                    onDisconnect={disconnect}
                  />
                </div>

                {/* Locked balance */}
                <LockedBalance balance={balance} contractBalance={contractBalance} />

                {/* Transaction history */}
                {history.length > 0 && (
                  <>
                    <div className="h-px bg-white/[0.04]" />
                    <TxHistory records={history} />
                  </>
                )}

                {/* Divider */}
                <div className="h-px bg-white/[0.04]" />

                {/* Form */}
                <DepositForm
                  appState={appState}
                  balance={balance}
                  walletBalance={walletBalance}
                  isConnected={isConnected}
                  isSupported={isSupported}
                  onDeposit={deposit}
                  onWithdraw={withdraw}
                />
              </>
            )}
          </div>

          {/* Status footer */}
          {(currentStatus || lastAction) && (
            <div className="border-t border-white/[0.04]">
              <StatusPanel statusMessage={currentStatus} lastAction={lastAction} txHash={lastTxHash} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
