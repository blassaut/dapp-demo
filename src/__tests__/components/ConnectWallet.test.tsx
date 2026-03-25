import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ConnectWallet } from '../../components/ConnectWallet'

describe('ConnectWallet', () => {
  it('renders connect button when disconnected with injected wallet', () => {
    render(<ConnectWallet address={null} hasInjectedWallet={true} onConnect={vi.fn()} onConnectWalletConnect={vi.fn()} />)
    expect(screen.getByTestId('wallet-connect-button')).toBeInTheDocument()
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument()
  })

  it('renders connect button via WalletConnect when no injected wallet', () => {
    render(<ConnectWallet address={null} hasInjectedWallet={false} onConnect={vi.fn()} onConnectWalletConnect={vi.fn()} />)
    expect(screen.getByTestId('wallet-connect-button')).toBeInTheDocument()
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument()
  })

  it('renders truncated address when connected', () => {
    render(
      <ConnectWallet address="0x1234567890abcdef1234567890abcdef12345678" hasInjectedWallet={true} onConnect={vi.fn()} onConnectWalletConnect={vi.fn()} />,
    )
    expect(screen.getByTestId('wallet-address')).toHaveTextContent('0x1234...5678')
    expect(screen.queryByTestId('wallet-connect-button')).not.toBeInTheDocument()
  })

  it('calls onConnect when button is clicked with injected wallet', () => {
    const onConnect = vi.fn()
    render(<ConnectWallet address={null} hasInjectedWallet={true} onConnect={onConnect} onConnectWalletConnect={vi.fn()} />)
    fireEvent.click(screen.getByTestId('wallet-connect-button'))
    expect(onConnect).toHaveBeenCalledOnce()
  })

  it('calls onConnectWalletConnect when button is clicked without injected wallet', () => {
    const onConnectWC = vi.fn()
    render(<ConnectWallet address={null} hasInjectedWallet={false} onConnect={vi.fn()} onConnectWalletConnect={onConnectWC} />)
    fireEvent.click(screen.getByTestId('wallet-connect-button'))
    expect(onConnectWC).toHaveBeenCalledOnce()
  })

  it('shows WalletConnect alternative when injected wallet is available', () => {
    render(<ConnectWallet address={null} hasInjectedWallet={true} onConnect={vi.fn()} onConnectWalletConnect={vi.fn()} />)
    expect(screen.getByTestId('walletconnect-button')).toBeInTheDocument()
  })
})
