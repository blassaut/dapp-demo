import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'

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

import App from '../App'

describe('App - disconnected state', () => {
  it('renders wallet-not-detected when no wallet is available', () => {
    render(<App />)
    expect(screen.getByTestId('wallet-not-detected')).toBeInTheDocument()
  })

  it('renders the app title', () => {
    render(<App />)
    expect(screen.getByText('LockBox')).toBeInTheDocument()
  })

  it('does not render form elements when disconnected', () => {
    render(<App />)
    expect(screen.queryByTestId('lockbox-balance')).not.toBeInTheDocument()
    expect(screen.queryByTestId('lockbox-input-amount')).not.toBeInTheDocument()
    expect(screen.queryByTestId('lockbox-button-deposit')).not.toBeInTheDocument()
    expect(screen.queryByTestId('lockbox-button-withdraw')).not.toBeInTheDocument()
  })

  it('shows connect prompt text', () => {
    render(<App />)
    expect(screen.getByText('Connect your wallet to begin')).toBeInTheDocument()
  })
})
