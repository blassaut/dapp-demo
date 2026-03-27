import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TxHistory } from '../../components/TxHistory'
import type { TxRecord } from '../../lib/types'

function makeRecord(i: number): TxRecord {
  return {
    type: 'deposit',
    amount: `${i}`,
    txHash: `0x${String(i).padStart(64, '0')}`,
    blockNumber: i,
  }
}

describe('TxHistory', () => {
  it('renders nothing when records are empty', () => {
    const { container } = render(<TxHistory records={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders tx-history wrapper when records are present', () => {
    render(<TxHistory records={[makeRecord(1)]} />)
    expect(screen.getByTestId('tx-history')).toBeInTheDocument()
  })

  it('renders up to 5 items on first page', () => {
    const records = Array.from({ length: 7 }, (_, i) => makeRecord(i + 1))
    render(<TxHistory records={records} />)
    expect(screen.getAllByTestId('tx-history-item')).toHaveLength(5)
  })

  it('does not show pagination controls for 5 or fewer records', () => {
    const records = Array.from({ length: 5 }, (_, i) => makeRecord(i + 1))
    render(<TxHistory records={records} />)
    expect(screen.queryByText('Prev')).not.toBeInTheDocument()
    expect(screen.queryByText('Next')).not.toBeInTheDocument()
  })

  it('shows Prev and Next buttons when records exceed one page', () => {
    const records = Array.from({ length: 6 }, (_, i) => makeRecord(i + 1))
    render(<TxHistory records={records} />)
    expect(screen.getByText('Prev')).toBeInTheDocument()
    expect(screen.getByText('Next')).toBeInTheDocument()
  })

  it('shows page counter "1/2" for 6 records', () => {
    const records = Array.from({ length: 6 }, (_, i) => makeRecord(i + 1))
    render(<TxHistory records={records} />)
    expect(screen.getByText('1/2')).toBeInTheDocument()
  })

  it('Prev button is disabled on first page', () => {
    const records = Array.from({ length: 6 }, (_, i) => makeRecord(i + 1))
    render(<TxHistory records={records} />)
    expect(screen.getByText('Prev')).toBeDisabled()
  })

  it('Next button is disabled on last page', () => {
    const records = Array.from({ length: 6 }, (_, i) => makeRecord(i + 1))
    render(<TxHistory records={records} />)
    fireEvent.click(screen.getByText('Next'))
    expect(screen.getByText('Next')).toBeDisabled()
  })

  it('navigates to next page and updates counter', () => {
    const records = Array.from({ length: 6 }, (_, i) => makeRecord(i + 1))
    render(<TxHistory records={records} />)
    fireEvent.click(screen.getByText('Next'))
    expect(screen.getByText('2/2')).toBeInTheDocument()
  })

  it('shows remaining items on last page', () => {
    const records = Array.from({ length: 6 }, (_, i) => makeRecord(i + 1))
    render(<TxHistory records={records} />)
    fireEvent.click(screen.getByText('Next'))
    expect(screen.getAllByTestId('tx-history-item')).toHaveLength(1)
  })

  it('navigates back to first page with Prev button', () => {
    const records = Array.from({ length: 6 }, (_, i) => makeRecord(i + 1))
    render(<TxHistory records={records} />)
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Prev'))
    expect(screen.getByText('1/2')).toBeInTheDocument()
    expect(screen.getAllByTestId('tx-history-item')).toHaveLength(5)
  })
})
