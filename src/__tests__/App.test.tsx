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

  it('renders the staking balance', () => {
    render(<App />)
    expect(screen.getByTestId('staking-balance')).toBeInTheDocument()
  })

  it('renders the status panel', () => {
    render(<App />)
    expect(screen.getByTestId('status-panel')).toBeInTheDocument()
  })

  it('renders stake and unstake buttons', () => {
    render(<App />)
    expect(screen.getByTestId('staking-button-stake')).toBeInTheDocument()
    expect(screen.getByTestId('staking-button-unstake')).toBeInTheDocument()
  })

  it('renders amount input', () => {
    render(<App />)
    expect(screen.getByTestId('staking-input-amount')).toBeInTheDocument()
  })
})
