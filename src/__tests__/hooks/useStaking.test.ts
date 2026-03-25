import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useStaking } from '../../hooks/useStaking'
import { AppState } from '../../lib/types'
import type { StakingProvider } from '../../lib/types'

function mockProvider(overrides: Partial<StakingProvider> = {}): StakingProvider {
  return {
    stake: vi.fn().mockResolvedValue(undefined),
    unstake: vi.fn().mockResolvedValue(undefined),
    getBalance: vi.fn().mockResolvedValue('0'),
    ...overrides,
  }
}

beforeEach(() => {
  vi.useFakeTimers()
})

describe('useStaking', () => {
  it('starts in disconnected state when not connected', () => {
    const { result } = renderHook(() =>
      useStaking({ provider: null, isConnected: false, isSupported: false }),
    )
    expect(result.current.appState).toBe(AppState.Disconnected)
    expect(result.current.balance).toBe('0')
  })

  it('moves to unsupported-network when connected but not supported', () => {
    const { result } = renderHook(() =>
      useStaking({ provider: mockProvider(), isConnected: true, isSupported: false }),
    )
    expect(result.current.appState).toBe(AppState.UnsupportedNetwork)
  })

  it('moves to idle when connected and supported', () => {
    const { result } = renderHook(() =>
      useStaking({ provider: mockProvider(), isConnected: true, isSupported: true }),
    )
    expect(result.current.appState).toBe(AppState.Idle)
  })

  it('transitions to pending then confirmed on successful stake', async () => {
    let resolveStake!: () => void
    const stakePromise = new Promise<void>((resolve) => { resolveStake = resolve })
    const provider = mockProvider({
      stake: vi.fn().mockReturnValue(stakePromise),
      getBalance: vi.fn().mockResolvedValue('0.5'),
    })
    const { result } = renderHook(() =>
      useStaking({ provider, isConnected: true, isSupported: true }),
    )

    // Start stake but don't resolve yet
    let stakeCallPromise!: Promise<void>
    act(() => {
      stakeCallPromise = result.current.stake('0.5')
    })
    expect(result.current.appState).toBe(AppState.Pending)

    // Now resolve the stake
    await act(async () => {
      resolveStake()
      await stakeCallPromise
    })

    expect(result.current.appState).toBe(AppState.Confirmed)
    expect(result.current.balance).toBe('0.5')

    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(result.current.appState).toBe(AppState.Idle)
  })

  it('transitions to rejected on stake rejection', async () => {
    const provider = mockProvider({
      stake: vi.fn().mockRejectedValue(new Error('user rejected')),
    })
    const { result } = renderHook(() =>
      useStaking({ provider, isConnected: true, isSupported: true }),
    )

    await act(async () => {
      await result.current.stake('0.5')
    })

    expect(result.current.appState).toBe(AppState.Rejected)

    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(result.current.appState).toBe(AppState.Idle)
  })

  it('updates status messages correctly through stake lifecycle', async () => {
    let resolveStake!: () => void
    const stakePromise = new Promise<void>((resolve) => { resolveStake = resolve })
    const provider = mockProvider({
      stake: vi.fn().mockReturnValue(stakePromise),
      getBalance: vi.fn().mockResolvedValue('0.1'),
    })
    const { result } = renderHook(() =>
      useStaking({ provider, isConnected: true, isSupported: true }),
    )

    let stakeCallPromise!: Promise<void>
    act(() => {
      stakeCallPromise = result.current.stake('0.1')
    })
    expect(result.current.statusMessage).toBe('Processing stake...')

    await act(async () => {
      resolveStake()
      await stakeCallPromise
    })

    expect(result.current.lastAction).toBe('Stake confirmed for 0.1 ETH')
  })

  it('shows rejection message on rejection', async () => {
    const provider = mockProvider({
      stake: vi.fn().mockRejectedValue(new Error('rejected')),
    })
    const { result } = renderHook(() =>
      useStaking({ provider, isConnected: true, isSupported: true }),
    )

    await act(async () => {
      await result.current.stake('0.5')
    })

    expect(result.current.lastAction).toBe('Transaction rejected')
  })

  it('transitions through unstake lifecycle: pending -> confirmed -> idle', async () => {
    let resolveUnstake!: () => void
    const unstakePromise = new Promise<void>((resolve) => { resolveUnstake = resolve })
    const provider = mockProvider({
      unstake: vi.fn().mockReturnValue(unstakePromise),
      getBalance: vi.fn().mockResolvedValue('0'),
    })
    const { result } = renderHook(() =>
      useStaking({ provider, isConnected: true, isSupported: true }),
    )

    let unstakeCallPromise!: Promise<void>
    act(() => {
      unstakeCallPromise = result.current.unstake()
    })
    expect(result.current.appState).toBe(AppState.Pending)
    expect(result.current.statusMessage).toBe('Processing unstake...')

    await act(async () => {
      resolveUnstake()
      await unstakeCallPromise
    })

    expect(result.current.appState).toBe(AppState.Confirmed)
    expect(result.current.balance).toBe('0')
    expect(result.current.lastAction).toBe('Unstake confirmed')

    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(result.current.appState).toBe(AppState.Idle)
  })

  it('transitions to rejected on unstake rejection', async () => {
    const provider = mockProvider({
      unstake: vi.fn().mockRejectedValue(new Error('user rejected')),
      getBalance: vi.fn().mockResolvedValue('0.5'),
    })
    const { result } = renderHook(() =>
      useStaking({ provider, isConnected: true, isSupported: true }),
    )

    await act(async () => {
      await result.current.unstake()
    })

    expect(result.current.appState).toBe(AppState.Rejected)
    expect(result.current.lastAction).toBe('Transaction rejected')
  })

  it('preserves balance after stake rejection when balance > 0', async () => {
    let currentBalance = '0'
    const provider = mockProvider({
      stake: vi.fn()
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('rejected')),
      getBalance: vi.fn().mockImplementation(() => Promise.resolve(currentBalance)),
    })
    const { result } = renderHook(() =>
      useStaking({ provider, isConnected: true, isSupported: true }),
    )

    currentBalance = '0.5'
    await act(async () => {
      await result.current.stake('0.5')
    })
    expect(result.current.balance).toBe('0.5')

    act(() => { vi.advanceTimersByTime(5000) })

    await act(async () => {
      await result.current.stake('0.3')
    })
    expect(result.current.balance).toBe('0.5')
    expect(result.current.appState).toBe(AppState.Rejected)
  })
})
