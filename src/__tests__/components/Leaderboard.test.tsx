import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Leaderboard } from '../../components/Leaderboard'
import type { LeaderboardEntry } from '../../hooks/useLeaderboard'
import { parseEther } from 'ethers'

const makeEntry = (address: string, eth: string): LeaderboardEntry => ({
  address,
  lockedBalance: parseEther(eth),
})

describe('Leaderboard', () => {
  it('shows loading state', () => {
    render(<Leaderboard entries={[]} loading={true} />)
    expect(screen.getByText('loading...')).toBeInTheDocument()
  })

  it('shows empty state when no deposits', () => {
    render(<Leaderboard entries={[]} loading={false} />)
    expect(screen.getByText('No deposits yet. Be the first!')).toBeInTheDocument()
  })

  it('renders entries when provided', () => {
    const entries = [
      makeEntry('0xabc1230000000000000000000000000000000001', '100'),
      makeEntry('0xabc1230000000000000000000000000000000002', '50'),
    ]
    render(<Leaderboard entries={entries} loading={false} />)
    expect(screen.getByText(/0xabc1\.\.\.0001/)).toBeInTheDocument()
    expect(screen.getByText(/0xabc1\.\.\.0002/)).toBeInTheDocument()
  })

  it('highlights current user entry with (you) label', () => {
    const address = '0xabc1230000000000000000000000000000000001'
    const entries = [makeEntry(address, '100')]
    render(<Leaderboard entries={entries} loading={false} currentAddress={address} />)
    expect(screen.getByText('(you)')).toBeInTheDocument()
  })

  it('does not show (you) label when currentAddress does not match', () => {
    const entries = [makeEntry('0xabc1230000000000000000000000000000000001', '100')]
    render(<Leaderboard entries={entries} loading={false} currentAddress="0x0000000000000000000000000000000000000002" />)
    expect(screen.queryByText('(you)')).not.toBeInTheDocument()
  })

  it('shows Top lockers heading', () => {
    render(<Leaderboard entries={[]} loading={false} />)
    expect(screen.getByText(/top lockers/i)).toBeInTheDocument()
  })
})
