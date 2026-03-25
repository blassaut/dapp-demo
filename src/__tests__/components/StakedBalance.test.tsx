import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StakedBalance } from '../../components/StakedBalance'

describe('StakedBalance', () => {
  it('renders balance with ETH suffix', () => {
    render(<StakedBalance balance="0.5" />)
    expect(screen.getByTestId('staking-balance')).toHaveTextContent('0.5 ETH')
  })

  it('renders zero balance', () => {
    render(<StakedBalance balance="0" />)
    expect(screen.getByTestId('staking-balance')).toHaveTextContent('0 ETH')
  })
})
