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

describe('App', () => {
  it('renders wallet-not-detected when no wallet is available', () => {
    render(<App />)
    expect(screen.getByTestId('wallet-not-detected')).toBeInTheDocument()
  })

  it('renders the lockbox balance', () => {
    render(<App />)
    expect(screen.getByTestId('lockbox-balance')).toBeInTheDocument()
  })

  it('renders the status panel', () => {
    render(<App />)
    expect(screen.getByTestId('status-panel')).toBeInTheDocument()
  })

  it('renders deposit and withdraw buttons', () => {
    render(<App />)
    expect(screen.getByTestId('lockbox-button-deposit')).toBeInTheDocument()
    expect(screen.getByTestId('lockbox-button-withdraw')).toBeInTheDocument()
  })

  it('renders amount input', () => {
    render(<App />)
    expect(screen.getByTestId('lockbox-input-amount')).toBeInTheDocument()
  })
})
