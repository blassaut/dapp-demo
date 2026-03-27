import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WithdrawForm } from '../../components/WithdrawForm'
import { AppState } from '../../lib/types'

const defaultProps = {
  appState: AppState.Idle,
  lockedBalance: '100',
  onWithdraw: vi.fn(),
}

describe('WithdrawForm', () => {
  it('renders amount input and withdraw button', () => {
    render(<WithdrawForm {...defaultProps} />)
    expect(screen.getByTestId('withdraw-input')).toBeInTheDocument()
    expect(screen.getByTestId('withdraw-btn')).toBeInTheDocument()
  })

  it('disables withdraw button when amount is empty', () => {
    render(<WithdrawForm {...defaultProps} />)
    expect(screen.getByTestId('withdraw-btn')).toBeDisabled()
  })

  it('enables withdraw button when amount is entered within locked balance', () => {
    render(<WithdrawForm {...defaultProps} />)
    fireEvent.change(screen.getByTestId('withdraw-input'), { target: { value: '10' } })
    expect(screen.getByTestId('withdraw-btn')).toBeEnabled()
  })

  it('disables withdraw button when amount exceeds locked balance', () => {
    render(<WithdrawForm {...defaultProps} lockedBalance="5" />)
    fireEvent.change(screen.getByTestId('withdraw-input'), { target: { value: '10' } })
    expect(screen.getByTestId('withdraw-btn')).toBeDisabled()
  })

  it('shows Withdrawing... label during pending state', () => {
    render(<WithdrawForm {...defaultProps} appState={AppState.Pending} />)
    expect(screen.getByTestId('withdraw-btn')).toHaveTextContent('Withdrawing...')
  })

  it('calls onWithdraw with amount when withdraw button clicked', () => {
    const onWithdraw = vi.fn()
    render(<WithdrawForm {...defaultProps} onWithdraw={onWithdraw} />)
    fireEvent.change(screen.getByTestId('withdraw-input'), { target: { value: '50' } })
    fireEvent.click(screen.getByTestId('withdraw-btn'))
    expect(onWithdraw).toHaveBeenCalledWith('50')
  })

  it('clears amount input after successful withdrawal (confirmed state)', () => {
    const { rerender } = render(<WithdrawForm {...defaultProps} appState={AppState.Idle} />)
    fireEvent.change(screen.getByTestId('withdraw-input'), { target: { value: '50' } })
    expect(screen.getByTestId('withdraw-input')).toHaveValue(50)

    rerender(<WithdrawForm {...defaultProps} appState={AppState.Confirmed} />)
    expect(screen.getByTestId('withdraw-input')).toHaveValue(null)
  })

  it('shows max balance hint when amount exceeds locked balance', () => {
    render(<WithdrawForm {...defaultProps} lockedBalance="5" />)
    fireEvent.change(screen.getByTestId('withdraw-input'), { target: { value: '10' } })
    expect(screen.getByText('Max: 5 LKBOX')).toBeInTheDocument()
  })

  it('renders MAX button', () => {
    render(<WithdrawForm {...defaultProps} />)
    expect(screen.getByTestId('withdraw-max-btn')).toBeInTheDocument()
  })

  it('MAX button fills input with lockedBalance', () => {
    render(<WithdrawForm {...defaultProps} lockedBalance="100" />)
    fireEvent.click(screen.getByTestId('withdraw-max-btn'))
    expect(screen.getByTestId('withdraw-input')).toHaveValue(100)
  })

  it('MAX button is disabled when lockedBalance is 0', () => {
    render(<WithdrawForm {...defaultProps} lockedBalance="0" />)
    expect(screen.getByTestId('withdraw-max-btn')).toBeDisabled()
  })

  it('MAX button is disabled when busy', () => {
    render(<WithdrawForm {...defaultProps} appState={AppState.Pending} lockedBalance="100" />)
    expect(screen.getByTestId('withdraw-max-btn')).toBeDisabled()
  })
})
