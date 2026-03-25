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

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS ?? ''

export default function App() {
  const { address, walletBalance, isConnected, isNoWallet, connect } = useWallet()
  const { networkName, isSupported } = useNetwork(isConnected)

  const provider = useMemo(() => {
    if (!isConnected || !CONTRACT_ADDRESS) return null
    return new ContractProvider(CONTRACT_ADDRESS)
  }, [isConnected])

  const { balance, appState, statusMessage, lastAction, deposit, withdraw } = useLockBox({
    provider,
    isConnected,
    isSupported,
  })

  const currentStatus = statusMessage || ''

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Main card */}
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-white/[0.06] bg-dark-800/40 backdrop-blur-sm overflow-hidden">
          {/* Card header */}
          <div className="px-6 pt-6 pb-4 border-b border-white/[0.04]">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-heading font-bold text-light">LockBox</h1>
              {isConnected && <NetworkChip networkName={networkName} isSupported={isSupported} />}
            </div>
            {!isConnected && (
              <p className="text-xs font-mono text-muted/40 mt-1">Connect your wallet to begin</p>
            )}
          </div>

          {/* Card body */}
          <div className="px-6 py-5 space-y-5">
            {/* Wrong network banner */}
            {appState === AppState.UnsupportedNetwork && (
              <NetworkBanner networkName={networkName} />
            )}

            {/* Wallet connection */}
            {!isConnected && (
              <div className="py-6 text-center">
                <ConnectWallet address={null} isNoWallet={isNoWallet} onConnect={connect} />
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
                  <ConnectWallet address={address} isNoWallet={isNoWallet} onConnect={connect} />
                </div>

                {/* Locked balance */}
                <LockedBalance balance={balance} />

                {/* Divider */}
                <div className="h-px bg-white/[0.04]" />

                {/* Form */}
                <DepositForm
                  appState={appState}
                  balance={balance}
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
              <StatusPanel statusMessage={currentStatus} lastAction={lastAction} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
