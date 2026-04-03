import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TxHistory } from '../../components/TxHistory'
import type { TxRecord } from '../../lib/types'

vi.mock('../../lib/explorer', () => ({
  getTxUrl: (hash: string) => `https://etherscan.io/tx/${hash}`,
  truncateHash: (hash: string) => `${hash.slice(0, 10)}...${hash.slice(-4)}`,
}))

const mockRecords: TxRecord[] = [
  { type: 'deposit', amount: '1.0', txHash: '0xabc123def456', blockNumber: 100 },
  { type: 'withdrawal', amount: '0.5', txHash: '0xdef789abc012', blockNumber: 101 },
]

describe('TxHistory', () => {
  it('shows spinner when loading', () => {
    render(<TxHistory records={[]} loading={true} />)
    expect(screen.getByText('History')).toBeInTheDocument()
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('renders nothing when no records and not loading', () => {
    const { container } = render(<TxHistory records={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders records when loaded', () => {
    render(<TxHistory records={mockRecords} />)
    expect(screen.getByText('History')).toBeInTheDocument()
    expect(screen.getByText('+1.0 ETH')).toBeInTheDocument()
    expect(screen.getByText('-0.5 ETH')).toBeInTheDocument()
  })
})
