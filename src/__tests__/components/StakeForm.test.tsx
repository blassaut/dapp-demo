import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StakeForm } from '../../components/StakeForm'
import { AppState } from '../../lib/types'

const defaultProps = {
  appState: AppState.Idle,
  balance: '0',
  isConnected: true,
  isSupported: true,
  onStake: vi.fn(),
  onUnstake: vi.fn(),
}

describe('StakeForm', () => {
  it('renders amount input and both buttons', () => {
    render(<StakeForm {...defaultProps} />)
    expect(screen.getByTestId('staking-input-amount')).toBeInTheDocument()
    expect(screen.getByTestId('staking-button-stake')).toBeInTheDocument()
    expect(screen.getByTestId('staking-button-unstake')).toBeInTheDocument()
  })

  it('disables stake button when amount is empty', () => {
    render(<StakeForm {...defaultProps} />)
    expect(screen.getByTestId('staking-button-stake')).toBeDisabled()
  })

  it('enables stake button when amount is entered on supported network', () => {
    render(<StakeForm {...defaultProps} />)
    fireEvent.change(screen.getByTestId('staking-input-amount'), { target: { value: '0.1' } })
    expect(screen.getByTestId('staking-button-stake')).toBeEnabled()
  })

  it('disables stake button on unsupported network', () => {
    render(<StakeForm {...defaultProps} isSupported={false} appState={AppState.UnsupportedNetwork} />)
    fireEvent.change(screen.getByTestId('staking-input-amount'), { target: { value: '0.1' } })
    expect(screen.getByTestId('staking-button-stake')).toBeDisabled()
  })

  it('disables stake button when disconnected', () => {
    render(<StakeForm {...defaultProps} isConnected={false} appState={AppState.Disconnected} />)
    expect(screen.getByTestId('staking-button-stake')).toBeDisabled()
  })

  it('disables unstake button when balance is 0', () => {
    render(<StakeForm {...defaultProps} balance="0" />)
    expect(screen.getByTestId('staking-button-unstake')).toBeDisabled()
  })

  it('enables unstake button when balance > 0 on supported network', () => {
    render(<StakeForm {...defaultProps} balance="0.5" />)
    expect(screen.getByTestId('staking-button-unstake')).toBeEnabled()
  })

  it('disables unstake button on unsupported network even with balance', () => {
    render(
      <StakeForm {...defaultProps} balance="0.5" isSupported={false} appState={AppState.UnsupportedNetwork} />,
    )
    expect(screen.getByTestId('staking-button-unstake')).toBeDisabled()
  })

  it('disables both buttons during pending state', () => {
    render(<StakeForm {...defaultProps} appState={AppState.Pending} balance="0.5" />)
    fireEvent.change(screen.getByTestId('staking-input-amount'), { target: { value: '0.1' } })
    expect(screen.getByTestId('staking-button-stake')).toBeDisabled()
    expect(screen.getByTestId('staking-button-unstake')).toBeDisabled()
  })

  it('calls onStake with amount when stake button clicked', () => {
    const onStake = vi.fn()
    render(<StakeForm {...defaultProps} onStake={onStake} />)
    fireEvent.change(screen.getByTestId('staking-input-amount'), { target: { value: '0.5' } })
    fireEvent.click(screen.getByTestId('staking-button-stake'))
    expect(onStake).toHaveBeenCalledWith('0.5')
  })

  it('calls onUnstake when unstake button clicked', () => {
    const onUnstake = vi.fn()
    render(<StakeForm {...defaultProps} balance="0.5" onUnstake={onUnstake} />)
    fireEvent.click(screen.getByTestId('staking-button-unstake'))
    expect(onUnstake).toHaveBeenCalledOnce()
  })

  it('clears amount input after successful stake (confirmed state)', () => {
    const { rerender } = render(<StakeForm {...defaultProps} appState={AppState.Idle} />)
    fireEvent.change(screen.getByTestId('staking-input-amount'), { target: { value: '0.5' } })
    expect(screen.getByTestId('staking-input-amount')).toHaveValue(0.5)

    rerender(<StakeForm {...defaultProps} appState={AppState.Confirmed} />)
    expect(screen.getByTestId('staking-input-amount')).toHaveValue(null)
  })

  it('preserves amount after rejection', () => {
    const { rerender } = render(<StakeForm {...defaultProps} appState={AppState.Idle} />)
    fireEvent.change(screen.getByTestId('staking-input-amount'), { target: { value: '0.5' } })

    rerender(<StakeForm {...defaultProps} appState={AppState.Rejected} />)
    expect(screen.getByTestId('staking-input-amount')).toHaveValue(0.5)
  })
})
