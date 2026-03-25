import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusPanel } from '../../components/StatusPanel'

describe('StatusPanel', () => {
  it('renders current status message', () => {
    render(<StatusPanel statusMessage="Processing stake..." lastAction="" />)
    expect(screen.getByTestId('status-current')).toHaveTextContent('Processing stake...')
  })

  it('renders last action message', () => {
    render(<StatusPanel statusMessage="" lastAction="Stake confirmed for 0.1 ETH" />)
    expect(screen.getByTestId('status-last-action')).toHaveTextContent('Stake confirmed for 0.1 ETH')
  })

  it('renders both messages', () => {
    render(<StatusPanel statusMessage="Connected on Ethereum Hoodi" lastAction="Stake confirmed for 0.1 ETH" />)
    expect(screen.getByTestId('status-current')).toHaveTextContent('Connected on Ethereum Hoodi')
    expect(screen.getByTestId('status-last-action')).toHaveTextContent('Stake confirmed for 0.1 ETH')
  })

  it('renders empty state gracefully', () => {
    render(<StatusPanel statusMessage="" lastAction="" />)
    expect(screen.getByTestId('status-panel')).toBeInTheDocument()
  })
})
