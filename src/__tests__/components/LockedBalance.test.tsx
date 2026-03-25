import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LockedBalance } from '../../components/LockedBalance'

describe('LockedBalance', () => {
  it('renders balance with ETH suffix', () => {
    render(<LockedBalance balance="0.5" contractBalance="2.0" />)
    expect(screen.getByTestId('lockbox-balance')).toHaveTextContent('0.5 ETH')
  })

  it('renders zero balance', () => {
    render(<LockedBalance balance="0" contractBalance="0" />)
    expect(screen.getByTestId('lockbox-balance')).toHaveTextContent('0 ETH')
  })

  it('renders contract balance', () => {
    render(<LockedBalance balance="0.5" contractBalance="3.0" />)
    expect(screen.getByTestId('contract-balance')).toHaveTextContent('Total in contract: 3.0 ETH')
  })
})
