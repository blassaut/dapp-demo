import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ConnectWallet } from '../../components/ConnectWallet'

describe('ConnectWallet', () => {
  it('renders connect button when disconnected', () => {
    render(<ConnectWallet address={null} isNoWallet={false} onConnect={vi.fn()} />)
    expect(screen.getByTestId('wallet-connect-button')).toBeInTheDocument()
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument()
  })

  it('renders truncated address when connected', () => {
    render(
      <ConnectWallet address="0x1234567890abcdef1234567890abcdef12345678" isNoWallet={false} onConnect={vi.fn()} />,
    )
    expect(screen.getByTestId('wallet-address')).toHaveTextContent('0x1234...5678')
    expect(screen.queryByTestId('wallet-connect-button')).not.toBeInTheDocument()
  })

  it('calls onConnect when button is clicked', () => {
    const onConnect = vi.fn()
    render(<ConnectWallet address={null} isNoWallet={false} onConnect={onConnect} />)
    fireEvent.click(screen.getByTestId('wallet-connect-button'))
    expect(onConnect).toHaveBeenCalledOnce()
  })

  it('shows no-wallet message when isNoWallet is true', () => {
    render(<ConnectWallet address={null} isNoWallet={true} onConnect={vi.fn()} />)
    expect(screen.getByTestId('wallet-not-detected')).toHaveTextContent(
      'MetaMask not detected. Install MetaMask to continue.',
    )
  })
})
