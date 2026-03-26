import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Leaderboard } from '../../components/Leaderboard'

const mockEntries = [
  { address: '0x1234567890abcdef1234567890abcdef12345678', totalDeposited: 5000000000000000000n },
  { address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', totalDeposited: 3000000000000000000n },
]

vi.mock('../../hooks/useLeaderboard', () => ({
  useLeaderboard: vi.fn(),
  formatLeaderboardAmount: (amount: bigint) => {
    return (Number(amount) / 1e18).toString()
  },
}))

import { useLeaderboard } from '../../hooks/useLeaderboard'
const mockUseLeaderboard = vi.mocked(useLeaderboard)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Leaderboard', () => {
  it('shows loading state', () => {
    mockUseLeaderboard.mockReturnValue({ entries: [], loading: true })
    render(<Leaderboard contractAddress="0x123" rpcUrl="http://localhost:8545" />)
    expect(screen.getByText('loading...')).toBeInTheDocument()
  })

  it('renders nothing when no entries', () => {
    mockUseLeaderboard.mockReturnValue({ entries: [], loading: false })
    const { container } = render(<Leaderboard contractAddress="0x123" rpcUrl="http://localhost:8545" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders entries with truncated addresses', () => {
    mockUseLeaderboard.mockReturnValue({ entries: mockEntries, loading: false })
    render(<Leaderboard contractAddress="0x123" rpcUrl="http://localhost:8545" />)
    expect(screen.getByText('Top depositors')).toBeInTheDocument()
    expect(screen.getByText('0x1234...5678')).toBeInTheDocument()
    expect(screen.getByText('5 ETH')).toBeInTheDocument()
    expect(screen.getByText('0xabcd...abcd')).toBeInTheDocument()
    expect(screen.getByText('3 ETH')).toBeInTheDocument()
  })

  it('highlights current user with (you) label', () => {
    mockUseLeaderboard.mockReturnValue({ entries: mockEntries, loading: false })
    render(
      <Leaderboard
        contractAddress="0x123"
        rpcUrl="http://localhost:8545"
        currentAddress="0x1234567890abcdef1234567890abcdef12345678"
      />,
    )
    expect(screen.getByText('(you)')).toBeInTheDocument()
  })

  it('does not show (you) for other addresses', () => {
    mockUseLeaderboard.mockReturnValue({ entries: mockEntries, loading: false })
    render(
      <Leaderboard
        contractAddress="0x123"
        rpcUrl="http://localhost:8545"
        currentAddress="0x0000000000000000000000000000000000000000"
      />,
    )
    expect(screen.queryByText('(you)')).not.toBeInTheDocument()
  })

  it('shows contract balance when provided', () => {
    mockUseLeaderboard.mockReturnValue({ entries: mockEntries, loading: false })
    render(
      <Leaderboard contractAddress="0x123" rpcUrl="http://localhost:8545" contractBalance="6.17" />,
    )
    expect(screen.getByText('Total in contract')).toBeInTheDocument()
    expect(screen.getByText('6.17 ETH')).toBeInTheDocument()
  })

  it('hides contract balance when zero', () => {
    mockUseLeaderboard.mockReturnValue({ entries: mockEntries, loading: false })
    render(
      <Leaderboard contractAddress="0x123" rpcUrl="http://localhost:8545" contractBalance="0" />,
    )
    expect(screen.queryByText('Total in contract')).not.toBeInTheDocument()
  })
})
