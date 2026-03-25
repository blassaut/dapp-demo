import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'

// Stub VITE_CONTRACT_ADDRESS before App module is loaded,
// otherwise hasAnyValidAddress (evaluated at module scope) is false
// and App renders ConfigError instead of the wallet UI.
vi.stubEnv('VITE_CONTRACT_ADDRESS', '0x' + '1'.repeat(40))

// Mock walletconnect module so it doesn't try to load real WC dependencies
vi.mock('../lib/walletconnect', () => ({
  connectWalletConnectProvider: vi.fn(),
  disconnectWalletConnect: vi.fn(),
  isWalletConnectConfigured: vi.fn(() => false),
}))

beforeAll(() => {
  global.IntersectionObserver = class {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
  } as unknown as typeof IntersectionObserver

  Object.defineProperty(window, 'ethereum', {
    value: undefined,
    writable: true,
    configurable: true,
  })
})

const { default: App } = await import('../App')

describe('App - disconnected state', () => {
  it('renders connect button when no injected wallet (WalletConnect fallback)', () => {
    render(<App />)
    expect(screen.getByTestId('wallet-connect-button')).toBeInTheDocument()
  })

  it('renders the app title', () => {
    render(<App />)
    expect(screen.getByText(/LockBox/)).toBeInTheDocument()
  })

  it('does not render form elements when disconnected', () => {
    render(<App />)
    expect(screen.queryByTestId('lockbox-balance')).not.toBeInTheDocument()
    expect(screen.queryByTestId('lockbox-input-amount')).not.toBeInTheDocument()
    expect(screen.queryByTestId('lockbox-button-deposit')).not.toBeInTheDocument()
    expect(screen.queryByTestId('lockbox-button-withdraw')).not.toBeInTheDocument()
  })


})
