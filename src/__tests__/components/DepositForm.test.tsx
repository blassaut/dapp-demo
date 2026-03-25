import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DepositForm } from '../../components/DepositForm'
import { AppState } from '../../lib/types'

const defaultProps = {
  appState: AppState.Idle,
  balance: '0',
  isConnected: true,
  isSupported: true,
  onDeposit: vi.fn(),
  onWithdraw: vi.fn(),
}

describe('DepositForm', () => {
  it('renders amount input and both buttons', () => {
    render(<DepositForm {...defaultProps} />)
    expect(screen.getByTestId('lockbox-input-amount')).toBeInTheDocument()
    expect(screen.getByTestId('lockbox-button-deposit')).toBeInTheDocument()
    expect(screen.getByTestId('lockbox-button-withdraw')).toBeInTheDocument()
  })

  it('disables deposit button when amount is empty', () => {
    render(<DepositForm {...defaultProps} />)
    expect(screen.getByTestId('lockbox-button-deposit')).toBeDisabled()
  })

  it('enables deposit button when amount is entered on supported network', () => {
    render(<DepositForm {...defaultProps} />)
    fireEvent.change(screen.getByTestId('lockbox-input-amount'), { target: { value: '0.1' } })
    expect(screen.getByTestId('lockbox-button-deposit')).toBeEnabled()
  })

  it('disables deposit button on unsupported network', () => {
    render(<DepositForm {...defaultProps} isSupported={false} appState={AppState.UnsupportedNetwork} />)
    fireEvent.change(screen.getByTestId('lockbox-input-amount'), { target: { value: '0.1' } })
    expect(screen.getByTestId('lockbox-button-deposit')).toBeDisabled()
  })

  it('disables deposit button when disconnected', () => {
    render(<DepositForm {...defaultProps} isConnected={false} appState={AppState.Disconnected} />)
    expect(screen.getByTestId('lockbox-button-deposit')).toBeDisabled()
  })

  it('disables withdraw button when balance is 0', () => {
    render(<DepositForm {...defaultProps} balance="0" />)
    expect(screen.getByTestId('lockbox-button-withdraw')).toBeDisabled()
  })

  it('enables withdraw button when balance > 0 on supported network', () => {
    render(<DepositForm {...defaultProps} balance="0.5" />)
    expect(screen.getByTestId('lockbox-button-withdraw')).toBeEnabled()
  })

  it('disables withdraw button on unsupported network even with balance', () => {
    render(
      <DepositForm {...defaultProps} balance="0.5" isSupported={false} appState={AppState.UnsupportedNetwork} />,
    )
    expect(screen.getByTestId('lockbox-button-withdraw')).toBeDisabled()
  })

  it('disables both buttons during pending state', () => {
    render(<DepositForm {...defaultProps} appState={AppState.Pending} balance="0.5" />)
    fireEvent.change(screen.getByTestId('lockbox-input-amount'), { target: { value: '0.1' } })
    expect(screen.getByTestId('lockbox-button-deposit')).toBeDisabled()
    expect(screen.getByTestId('lockbox-button-withdraw')).toBeDisabled()
  })

  it('calls onDeposit with amount when deposit button clicked', () => {
    const onDeposit = vi.fn()
    render(<DepositForm {...defaultProps} onDeposit={onDeposit} />)
    fireEvent.change(screen.getByTestId('lockbox-input-amount'), { target: { value: '0.5' } })
    fireEvent.click(screen.getByTestId('lockbox-button-deposit'))
    expect(onDeposit).toHaveBeenCalledWith('0.5')
  })

  it('calls onWithdraw when withdraw button clicked', () => {
    const onWithdraw = vi.fn()
    render(<DepositForm {...defaultProps} balance="0.5" onWithdraw={onWithdraw} />)
    fireEvent.click(screen.getByTestId('lockbox-button-withdraw'))
    expect(onWithdraw).toHaveBeenCalledOnce()
  })

  it('clears amount input after successful deposit (confirmed state)', () => {
    const { rerender } = render(<DepositForm {...defaultProps} appState={AppState.Idle} />)
    fireEvent.change(screen.getByTestId('lockbox-input-amount'), { target: { value: '0.5' } })
    expect(screen.getByTestId('lockbox-input-amount')).toHaveValue(0.5)

    rerender(<DepositForm {...defaultProps} appState={AppState.Confirmed} />)
    expect(screen.getByTestId('lockbox-input-amount')).toHaveValue(null)
  })

  it('preserves amount after rejection', () => {
    const { rerender } = render(<DepositForm {...defaultProps} appState={AppState.Idle} />)
    fireEvent.change(screen.getByTestId('lockbox-input-amount'), { target: { value: '0.5' } })

    rerender(<DepositForm {...defaultProps} appState={AppState.Rejected} />)
    expect(screen.getByTestId('lockbox-input-amount')).toHaveValue(0.5)
  })
})
