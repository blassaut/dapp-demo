import { useMemo } from 'react'
import { useWallet } from './hooks/useWallet'
import { useNetwork } from './hooks/useNetwork'
import { useLockBox } from './hooks/useLockBox'
import { ControlledProvider } from './lib/controlled-provider'
import { AppState } from './lib/types'

import { ConnectWallet } from './components/ConnectWallet'
import { NetworkChip } from './components/NetworkChip'
import { NetworkBanner } from './components/NetworkBanner'
import { LockedBalance } from './components/LockedBalance'
import { DepositForm } from './components/DepositForm'
import { StatusPanel } from './components/StatusPanel'

export default function App() {
  const { address, isConnected, isNoWallet, connect } = useWallet()
  const { networkName, isSupported } = useNetwork(isConnected)

  // VITE_MODE selects provider: 'demo' uses personal_sign + local state,
  // 'test' will use contract-provider (added in contract-provider plan)
  const provider = useMemo(() => {
    if (!isConnected) return null
    return new ControlledProvider()
  }, [isConnected])

  const { balance, appState, statusMessage, lastAction, deposit, withdraw } = useLockBox({
    provider,
    isConnected,
    isSupported,
  })

  const currentStatus =
    statusMessage ||
    (appState === AppState.Idle && isConnected
      ? `Connected on ${networkName ?? 'unknown'}`
      : appState === AppState.UnsupportedNetwork
        ? `Connected on ${networkName ?? 'unknown'}`
        : '')

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-heading font-bold text-light">LockBox Demo</h1>
          <p className="text-xs font-mono text-muted/40">
            {isConnected ? `Connected on ${networkName ?? 'unknown'}` : 'Connect your wallet to begin'}
          </p>
        </div>

        {/* Wallet + Network */}
        <div className="flex items-center justify-between">
          <ConnectWallet address={address} isNoWallet={isNoWallet} onConnect={connect} />
          {isConnected && <NetworkChip networkName={networkName} isSupported={isSupported} />}
        </div>

        {/* Wrong network banner */}
        {appState === AppState.UnsupportedNetwork && (
          <NetworkBanner networkName={networkName} />
        )}

        {/* Balance */}
        <LockedBalance balance={balance} />

        {/* Form */}
        <DepositForm
          appState={appState}
          balance={balance}
          isConnected={isConnected}
          isSupported={isSupported}
          onDeposit={deposit}
          onWithdraw={withdraw}
        />

        {/* Status */}
        <StatusPanel statusMessage={currentStatus} lastAction={lastAction} />
      </div>
    </div>
  )
}
