import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusPanel } from '../../components/StatusPanel'

describe('StatusPanel', () => {
  it('renders current status message', () => {
    render(<StatusPanel statusMessage="Processing deposit..." lastAction="" txHash={null} />)
    expect(screen.getByTestId('status-current')).toHaveTextContent('Processing deposit...')
  })

  it('renders last action message', () => {
    render(<StatusPanel statusMessage="" lastAction="Deposit confirmed for 0.1 ETH" txHash={null} />)
    expect(screen.getByTestId('status-last-action')).toHaveTextContent('Deposit confirmed for 0.1 ETH')
  })

  it('renders both messages', () => {
    render(<StatusPanel statusMessage="Processing..." lastAction="Deposit confirmed for 0.1 ETH" txHash={null} />)
    expect(screen.getByTestId('status-current')).toHaveTextContent('Processing...')
    expect(screen.getByTestId('status-last-action')).toHaveTextContent('Deposit confirmed for 0.1 ETH')
  })

  it('renders empty state gracefully', () => {
    render(<StatusPanel statusMessage="" lastAction="" txHash={null} />)
    expect(screen.getByTestId('status-panel')).toBeInTheDocument()
  })

  it('renders tx hash as a link when provided', () => {
    render(<StatusPanel statusMessage="" lastAction="Deposit confirmed" txHash="0xabc123def456789012345678901234567890abcdef1234567890abcdef12345678" />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', expect.stringContaining('0xabc123de'))
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('does not render tx link when txHash is null', () => {
    render(<StatusPanel statusMessage="" lastAction="Transaction rejected" txHash={null} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
