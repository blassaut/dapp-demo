import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useLeaderboard, formatLeaderboardAmount } from '../../hooks/useLeaderboard'
import { parseEther, EventLog } from 'ethers'

vi.mock('ethers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('ethers')>()
  return {
    ...actual,
    JsonRpcProvider: vi.fn(),
    Contract: vi.fn(),
  }
})

import { JsonRpcProvider, Contract } from 'ethers'

function makeEventLog(user: string, amount: bigint): EventLog {
  // Create an object that passes instanceof EventLog by using Object.create
  const ev = Object.create(EventLog.prototype) as EventLog
  ;(ev as unknown as { args: unknown[] }).args = [user, amount]
  return ev
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useLeaderboard', () => {
  it('starts with loading=true', () => {
    const mockFilters = { Deposited: vi.fn(), Withdrawn: vi.fn() }
    const mockContract = {
      filters: mockFilters,
      queryFilter: vi.fn().mockReturnValue(new Promise(() => {})),
    }
    vi.mocked(Contract).mockReturnValue(mockContract as never)
    vi.mocked(JsonRpcProvider).mockReturnValue({
      getBlockNumber: vi.fn().mockResolvedValue(100),
    } as never)

    const { result } = renderHook(() =>
      useLeaderboard('0xcontract', 'http://localhost:8545'),
    )
    expect(result.current.loading).toBe(true)
    expect(result.current.entries).toEqual([])
  })

  it('sets loading=false and entries=[] when no events', async () => {
    const mockFilters = { Deposited: vi.fn(), Withdrawn: vi.fn() }
    const mockContract = {
      filters: mockFilters,
      queryFilter: vi.fn().mockResolvedValue([]),
    }
    vi.mocked(Contract).mockReturnValue(mockContract as never)
    vi.mocked(JsonRpcProvider).mockReturnValue({
      getBlockNumber: vi.fn().mockResolvedValue(100),
    } as never)

    const { result } = renderHook(() =>
      useLeaderboard('0xcontract', 'http://localhost:8545'),
    )

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.entries).toEqual([])
  })

  it('returns sorted entries from deposit events', async () => {
    const addr1 = '0x0000000000000000000000000000000000000001'
    const addr2 = '0x0000000000000000000000000000000000000002'
    const depositEvents = [
      makeEventLog(addr1, parseEther('100')),
      makeEventLog(addr2, parseEther('200')),
    ]

    const mockFilters = { Deposited: vi.fn(), Withdrawn: vi.fn() }
    const mockContract = {
      filters: mockFilters,
      queryFilter: vi.fn()
        .mockResolvedValueOnce(depositEvents)
        .mockResolvedValueOnce([]),
    }
    vi.mocked(Contract).mockReturnValue(mockContract as never)
    vi.mocked(JsonRpcProvider).mockReturnValue({
      getBlockNumber: vi.fn().mockResolvedValue(100),
    } as never)

    const { result } = renderHook(() =>
      useLeaderboard('0xcontract', 'http://localhost:8545'),
    )

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.entries).toHaveLength(2)
    expect(result.current.entries[0].address).toBe(addr2)
    expect(result.current.entries[1].address).toBe(addr1)
  })

  it('subtracts withdraw events from balance', async () => {
    const addr = '0x0000000000000000000000000000000000000001'
    const depositEvents = [makeEventLog(addr, parseEther('100'))]
    const withdrawEvents = [makeEventLog(addr, parseEther('100'))]

    const mockFilters = { Deposited: vi.fn(), Withdrawn: vi.fn() }
    const mockContract = {
      filters: mockFilters,
      queryFilter: vi.fn()
        .mockResolvedValueOnce(depositEvents)
        .mockResolvedValueOnce(withdrawEvents),
    }
    vi.mocked(Contract).mockReturnValue(mockContract as never)
    vi.mocked(JsonRpcProvider).mockReturnValue({
      getBlockNumber: vi.fn().mockResolvedValue(100),
    } as never)

    const { result } = renderHook(() =>
      useLeaderboard('0xcontract', 'http://localhost:8545'),
    )

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.entries).toHaveLength(0)
  })

  it('sets loading=false without fetching when lockboxAddress is empty', async () => {
    const { result } = renderHook(() =>
      useLeaderboard('', 'http://localhost:8545'),
    )
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.entries).toEqual([])
  })
})

describe('formatLeaderboardAmount', () => {
  it('formats bigint to ether string', () => {
    expect(formatLeaderboardAmount(parseEther('1.5'))).toBe('1.5')
  })

  it('formats zero', () => {
    expect(formatLeaderboardAmount(0n)).toBe('0.0')
  })
})
