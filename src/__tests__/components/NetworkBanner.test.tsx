import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NetworkBanner } from '../../components/NetworkBanner'

describe('NetworkBanner', () => {
  it('renders banner with network name and switch guidance', () => {
    render(<NetworkBanner networkName="Ethereum Mainnet" />)
    const banner = screen.getByTestId('network-banner-unsupported')
    expect(banner).toHaveTextContent('Unsupported network detected: Ethereum Mainnet')
    expect(banner).toHaveTextContent('Switch to Ethereum Hoodi or Hardhat to continue')
  })

  it('renders nothing when networkName is null', () => {
    const { container } = render(<NetworkBanner networkName={null} />)
    expect(container.firstChild).toBeNull()
  })
})
