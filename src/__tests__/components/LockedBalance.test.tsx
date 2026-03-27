import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LockedBalance } from '../../components/LockedBalance'

describe('LockedBalance', () => {
  it('renders locked balance with LKBOX suffix', () => {
    render(<LockedBalance lkboxBalance="100" lockedBalance="50" />)
    expect(screen.getByTestId('locked-balance')).toHaveTextContent('50 LKBOX')
  })

  it('renders wallet lkbox balance', () => {
    render(<LockedBalance lkboxBalance="100" lockedBalance="50" />)
    expect(screen.getByTestId('lkbox-balance')).toHaveTextContent('100 LKBOX')
  })

  it('renders zero balances', () => {
    render(<LockedBalance lkboxBalance="0" lockedBalance="0" />)
    expect(screen.getByTestId('locked-balance')).toHaveTextContent('0 LKBOX')
    expect(screen.getByTestId('lkbox-balance')).toHaveTextContent('0 LKBOX')
  })
})
