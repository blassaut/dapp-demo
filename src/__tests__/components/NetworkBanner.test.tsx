import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NetworkBanner } from '../../components/NetworkBanner'
import type { Eip1193Provider } from '../../lib/types'

function mockProvider(requestFn?: (args: { method: string; params?: unknown[] }) => Promise<unknown>): Eip1193Provider {
  return {
    request: requestFn ?? vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
  }
}

describe('NetworkBanner', () => {
  it('renders banner with network name and switch button', () => {
    render(<NetworkBanner networkName="Ethereum Mainnet" provider={null} />)
    const banner = screen.getByTestId('network-banner-unsupported')
    expect(banner).toHaveTextContent('Unsupported network detected: Ethereum Mainnet')
    expect(screen.getByRole('button', { name: /Switch to Ethereum Hoodi/i })).toBeInTheDocument()
  })

  it('renders nothing when networkName is null', () => {
    const { container } = render(<NetworkBanner networkName={null} provider={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('disables switch button when provider is null', () => {
    render(<NetworkBanner networkName="Ethereum Mainnet" provider={null} />)
    expect(screen.getByRole('button', { name: /Switch to Ethereum Hoodi/i })).toBeDisabled()
  })

  it('calls wallet_switchEthereumChain on click', async () => {
    const request = vi.fn().mockResolvedValue(null)
    const provider = mockProvider(request)

    render(<NetworkBanner networkName="Arbitrum One" provider={provider} />)
    await userEvent.click(screen.getByRole('button', { name: /Switch to Ethereum Hoodi/i }))

    expect(request).toHaveBeenCalledWith({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: expect.stringMatching(/^0x/) }],
    })
  })

  it('falls back to wallet_addEthereumChain on error 4902', async () => {
    const request = vi.fn()
      .mockRejectedValueOnce({ code: 4902 })
      .mockResolvedValueOnce(null)
    const provider = mockProvider(request)

    render(<NetworkBanner networkName="Arbitrum One" provider={provider} />)
    await userEvent.click(screen.getByRole('button', { name: /Switch to Ethereum Hoodi/i }))

    expect(request).toHaveBeenCalledTimes(2)
    expect(request).toHaveBeenLastCalledWith({
      method: 'wallet_addEthereumChain',
      params: [expect.objectContaining({ chainName: 'Ethereum Hoodi' })],
    })
  })
})
