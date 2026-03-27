import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LockedBalance } from '../../components/LockedBalance'

describe('LockedBalance', () => {
  it('renders locked balance with LKBOX suffix', () => {
    render(<LockedBalance lockedBalance="50" />)
    expect(screen.getByTestId('locked-balance')).toHaveTextContent('50 LKBOX')
  })

  it('renders zero balance', () => {
    render(<LockedBalance lockedBalance="0" />)
    expect(screen.getByTestId('locked-balance')).toHaveTextContent('0 LKBOX')
  })
})
