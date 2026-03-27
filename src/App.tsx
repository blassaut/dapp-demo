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
import { MintForm } from './components/MintForm'
import { DepositForm } from './components/DepositForm'
import { WithdrawForm } from './components/WithdrawForm'
import { StatusPanel } from './components/StatusPanel'
import { TxHistory } from './components/TxHistory'

import { HARDHAT_CHAIN_ID, HARDHAT_RPC_URL, HOODI_RPC_URL } from './lib/constants'

const HOODI_TOKEN_ADDRESS = import.meta.env.VITE_TOKEN_ADDRESS ?? ''
const HOODI_CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS ?? ''
const HARDHAT_TOKEN_ADDRESS = import.meta.env.VITE_HARDHAT_TOKEN_ADDRESS ?? ''
const HARDHAT_CONTRACT_ADDRESS = import.meta.env.VITE_HARDHAT_CONTRACT_ADDRESS ?? ''

function getAddresses(chainId: number | null): { tokenAddress: string; lockboxAddress: string } {
  if (chainId === HARDHAT_CHAIN_ID && HARDHAT_CONTRACT_ADDRESS) {
    return { tokenAddress: HARDHAT_TOKEN_ADDRESS, lockboxAddress: HARDHAT_CONTRACT_ADDRESS }
  }
  return { tokenAddress: HOODI_TOKEN_ADDRESS, lockboxAddress: HOODI_CONTRACT_ADDRESS }
}

const isValidAddress = (addr: string) => /^0x[a-fA-F0-9]{40}$/.test(addr)
const hasAnyValidAddress =
  (isValidAddress(HOODI_TOKEN_ADDRESS) && isValidAddress(HOODI_CONTRACT_ADDRESS)) ||
  (isValidAddress(HARDHAT_TOKEN_ADDRESS) && isValidAddress(HARDHAT_CONTRACT_ADDRESS))

function ConfigError() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-red-500/30 bg-red-950/20 backdrop-blur-sm overflow-hidden p-6 text-center">
          <h1 className="text-lg font-heading font-bold text-red-400 mb-2">Configuration Error</h1>
          <p className="text-sm font-mono text-red-300/70">
            Missing or invalid contract addresses. Set <code className="text-red-300">VITE_TOKEN_ADDRESS</code> and <code className="text-red-300">VITE_CONTRACT_ADDRESS</code> to valid Ethereum addresses.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const { address, walletBalance, isConnected, hasInjectedWallet, provider, connect, connectWalletConnect, disconnect } = useWallet()
  const { chainId, networkName, isSupported } = useNetwork(isConnected, provider)

  const { tokenAddress, lockboxAddress } = getAddresses(chainId)
  const rpcUrl = chainId === HARDHAT_CHAIN_ID ? HARDHAT_RPC_URL : HOODI_RPC_URL

  const contractProvider = useMemo(() => {
    if (!isConnected || !provider || !isValidAddress(tokenAddress) || !isValidAddress(lockboxAddress)) return null
    return new ContractProvider(tokenAddress, lockboxAddress, provider, rpcUrl)
  }, [isConnected, provider, tokenAddress, lockboxAddress, rpcUrl, address])

  const { lkboxBalance, lockedBalance, appState, statusMessage, lastAction, lastTxHash, history, mint, deposit, withdraw } = useLockBox({
    provider: contractProvider,
    isConnected,
    isSupported,
  })

  if (!hasAnyValidAddress) return <ConfigError />

  const currentStatus = statusMessage || ''

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
      {isConnected && (
        <div className="fixed top-4 right-4 z-10">
          <NetworkChip networkName={networkName} isSupported={isSupported} />
        </div>
      )}

      <div className="w-full max-w-sm">
        <div className="text-center mb-3">
          <h1 className="text-lg font-heading font-bold text-light mb-0.5">LockBox - mint, deposit & withdraw LKBOX</h1>
          <p className="text-[11px] font-mono text-teal-400/50">Live transactions on Hoodi testnet - end-to-end tested</p>
        </div>

        <div className="rounded-2xl border border-white/[0.10] bg-dark-800/50 backdrop-blur-sm overflow-hidden shadow-[0_0_50px_rgba(20,184,166,0.06)] hover:shadow-[0_0_70px_rgba(20,184,166,0.12)] hover:border-white/[0.15] hover:-translate-y-0.5 transition-all duration-300">
          <div className="px-6 py-5 space-y-5">
            {appState === AppState.UnsupportedNetwork && (
              <NetworkBanner networkName={networkName} provider={provider} />
            )}

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

            {isConnected && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-muted/40 uppercase tracking-wider block">Wallet</span>
                    {walletBalance ? (
                      <span className="text-xs font-mono text-muted/50">{walletBalance} ETH</span>
                    ) : (
                      <span className="text-xs font-mono text-muted/30 animate-pulse">loading...</span>
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

                {isSupported && (
                  <>
                    <LockedBalance lkboxBalance={lkboxBalance} lockedBalance={lockedBalance} />

                    <div className="h-px bg-white/[0.04]" />
                    <MintForm appState={appState} walletBalance={walletBalance} onMint={mint} />

                    <div className="h-px bg-white/[0.04]" />
                    <DepositForm appState={appState} lkboxBalance={lkboxBalance} onDeposit={deposit} />

                    <div className="h-px bg-white/[0.04]" />
                    <WithdrawForm appState={appState} lockedBalance={lockedBalance} onWithdraw={withdraw} />

                    {history.length > 0 && (
                      <>
                        <div className="h-px bg-white/[0.04]" />
                        <TxHistory records={history} />
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </div>

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
