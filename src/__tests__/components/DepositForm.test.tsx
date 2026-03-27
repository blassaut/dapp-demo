import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DepositForm } from '../../components/DepositForm'
import { AppState } from '../../lib/types'

const defaultProps = {
  appState: AppState.Idle,
  lkboxBalance: '100',
  onDeposit: vi.fn(),
}

describe('DepositForm', () => {
  it('renders amount input and deposit button', () => {
    render(<DepositForm {...defaultProps} />)
    expect(screen.getByTestId('deposit-input')).toBeInTheDocument()
    expect(screen.getByTestId('deposit-btn')).toBeInTheDocument()
  })

  it('disables deposit button when amount is empty', () => {
    render(<DepositForm {...defaultProps} />)
    expect(screen.getByTestId('deposit-btn')).toBeDisabled()
  })

  it('enables deposit button when amount is entered within balance', () => {
    render(<DepositForm {...defaultProps} />)
    fireEvent.change(screen.getByTestId('deposit-input'), { target: { value: '10' } })
    expect(screen.getByTestId('deposit-btn')).toBeEnabled()
  })

  it('disables deposit button when amount exceeds lkbox balance', () => {
    render(<DepositForm {...defaultProps} lkboxBalance="5" />)
    fireEvent.change(screen.getByTestId('deposit-input'), { target: { value: '10' } })
    expect(screen.getByTestId('deposit-btn')).toBeDisabled()
  })

  it('disables deposit button during approving state', () => {
    render(<DepositForm {...defaultProps} appState={AppState.Approving} lkboxBalance="100" />)
    expect(screen.getByTestId('deposit-btn')).toBeDisabled()
  })

  it('disables deposit button during depositing state', () => {
    render(<DepositForm {...defaultProps} appState={AppState.Depositing} lkboxBalance="100" />)
    expect(screen.getByTestId('deposit-btn')).toBeDisabled()
  })

  it('shows Approving... label during approving state', () => {
    render(<DepositForm {...defaultProps} appState={AppState.Approving} />)
    expect(screen.getByTestId('deposit-btn')).toHaveTextContent('Approving...')
  })

  it('shows Depositing... label during depositing state', () => {
    render(<DepositForm {...defaultProps} appState={AppState.Depositing} />)
    expect(screen.getByTestId('deposit-btn')).toHaveTextContent('Depositing...')
  })

  it('calls onDeposit with amount when deposit button clicked', () => {
    const onDeposit = vi.fn()
    render(<DepositForm {...defaultProps} onDeposit={onDeposit} />)
    fireEvent.change(screen.getByTestId('deposit-input'), { target: { value: '50' } })
    fireEvent.click(screen.getByTestId('deposit-btn'))
    expect(onDeposit).toHaveBeenCalledWith('50')
  })

  it('clears amount input after successful deposit (confirmed state)', () => {
    const { rerender } = render(<DepositForm {...defaultProps} appState={AppState.Idle} />)
    fireEvent.change(screen.getByTestId('deposit-input'), { target: { value: '50' } })
    expect(screen.getByTestId('deposit-input')).toHaveValue(50)

    rerender(<DepositForm {...defaultProps} appState={AppState.Confirmed} />)
    expect(screen.getByTestId('deposit-input')).toHaveValue(null)
  })

  it('preserves amount after rejection', () => {
    const { rerender } = render(<DepositForm {...defaultProps} appState={AppState.Idle} />)
    fireEvent.change(screen.getByTestId('deposit-input'), { target: { value: '50' } })

    rerender(<DepositForm {...defaultProps} appState={AppState.Rejected} />)
    expect(screen.getByTestId('deposit-input')).toHaveValue(50)
  })

  it('shows max balance hint when amount exceeds lkbox balance', () => {
    render(<DepositForm {...defaultProps} lkboxBalance="5" />)
    fireEvent.change(screen.getByTestId('deposit-input'), { target: { value: '10' } })
    expect(screen.getByText('Max: 5 LKBOX')).toBeInTheDocument()
  })
})
