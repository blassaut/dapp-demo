import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLockBox } from '../../hooks/useLockBox'
import { AppState } from '../../lib/types'
import type { LockBoxProvider } from '../../lib/types'

function mockProvider(overrides: Partial<LockBoxProvider> = {}): LockBoxProvider {
  return {
    deposit: vi.fn().mockResolvedValue('0xtxhash'),
    withdraw: vi.fn().mockResolvedValue('0xtxhash'),
    getBalance: vi.fn().mockResolvedValue('0'),
    getHistory: vi.fn().mockResolvedValue([]),
    ...overrides,
  }
}

beforeEach(() => {
  vi.useFakeTimers()
})

describe('useLockBox', () => {
  it('starts in disconnected state when not connected', () => {
    const { result } = renderHook(() =>
      useLockBox({ provider: null, isConnected: false, isSupported: false }),
    )
    expect(result.current.appState).toBe(AppState.Disconnected)
    expect(result.current.balance).toBe('0')
  })

  it('moves to unsupported-network when connected but not supported', () => {
    const { result } = renderHook(() =>
      useLockBox({ provider: mockProvider(), isConnected: true, isSupported: false }),
    )
    expect(result.current.appState).toBe(AppState.UnsupportedNetwork)
  })

  it('moves to idle when connected and supported', () => {
    const { result } = renderHook(() =>
      useLockBox({ provider: mockProvider(), isConnected: true, isSupported: true }),
    )
    expect(result.current.appState).toBe(AppState.Idle)
  })

  it('transitions to pending then confirmed on successful deposit', async () => {
    let resolveDeposit!: () => void
    const depositPromise = new Promise<void>((resolve) => { resolveDeposit = resolve })
    const provider = mockProvider({
      deposit: vi.fn().mockReturnValue(depositPromise),
      getBalance: vi.fn().mockResolvedValue('0.5'),
    })
    const { result } = renderHook(() =>
      useLockBox({ provider, isConnected: true, isSupported: true }),
    )

    // Start deposit but don't resolve yet
    let depositCallPromise!: Promise<void>
    act(() => {
      depositCallPromise = result.current.deposit('0.5')
    })
    expect(result.current.appState).toBe(AppState.Pending)

    // Now resolve the deposit
    await act(async () => {
      resolveDeposit()
      await depositCallPromise
    })

    expect(result.current.appState).toBe(AppState.Confirmed)
    expect(result.current.balance).toBe('0.5')

    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(result.current.appState).toBe(AppState.Idle)
  })

  it('transitions to rejected on deposit rejection', async () => {
    const provider = mockProvider({
      deposit: vi.fn().mockRejectedValue(new Error('user rejected')),
    })
    const { result } = renderHook(() =>
      useLockBox({ provider, isConnected: true, isSupported: true }),
    )

    await act(async () => {
      await result.current.deposit('0.5')
    })

    expect(result.current.appState).toBe(AppState.Rejected)

    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(result.current.appState).toBe(AppState.Idle)
  })

  it('updates status messages correctly through deposit lifecycle', async () => {
    let resolveDeposit!: () => void
    const depositPromise = new Promise<void>((resolve) => { resolveDeposit = resolve })
    const provider = mockProvider({
      deposit: vi.fn().mockReturnValue(depositPromise),
      getBalance: vi.fn().mockResolvedValue('0.1'),
    })
    const { result } = renderHook(() =>
      useLockBox({ provider, isConnected: true, isSupported: true }),
    )

    let depositCallPromise!: Promise<void>
    act(() => {
      depositCallPromise = result.current.deposit('0.1')
    })
    expect(result.current.statusMessage).toBe('Processing deposit...')

    await act(async () => {
      resolveDeposit()
      await depositCallPromise
    })

    expect(result.current.lastAction).toBe('Deposit confirmed for 0.1 ETH')
  })

  it('shows rejection message on rejection', async () => {
    const provider = mockProvider({
      deposit: vi.fn().mockRejectedValue(new Error('rejected')),
    })
    const { result } = renderHook(() =>
      useLockBox({ provider, isConnected: true, isSupported: true }),
    )

    await act(async () => {
      await result.current.deposit('0.5')
    })

    expect(result.current.lastAction).toBe('Transaction rejected')
  })

  it('transitions through withdraw lifecycle: pending -> confirmed -> idle', async () => {
    let resolveWithdraw!: () => void
    const withdrawPromise = new Promise<void>((resolve) => { resolveWithdraw = resolve })
    const provider = mockProvider({
      withdraw: vi.fn().mockReturnValue(withdrawPromise),
      getBalance: vi.fn().mockResolvedValue('0'),
    })
    const { result } = renderHook(() =>
      useLockBox({ provider, isConnected: true, isSupported: true }),
    )

    let withdrawCallPromise!: Promise<void>
    act(() => {
      withdrawCallPromise = result.current.withdraw('0.5')
    })
    expect(result.current.appState).toBe(AppState.Pending)
    expect(result.current.statusMessage).toBe('Processing withdrawal...')

    await act(async () => {
      resolveWithdraw()
      await withdrawCallPromise
    })

    expect(result.current.appState).toBe(AppState.Confirmed)
    expect(result.current.balance).toBe('0')
    expect(result.current.lastAction).toBe('Withdrawal confirmed for 0.5 ETH')

    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(result.current.appState).toBe(AppState.Idle)
  })

  it('transitions to rejected on withdraw rejection', async () => {
    const provider = mockProvider({
      withdraw: vi.fn().mockRejectedValue(new Error('user rejected')),
      getBalance: vi.fn().mockResolvedValue('0.5'),
    })
    const { result } = renderHook(() =>
      useLockBox({ provider, isConnected: true, isSupported: true }),
    )

    await act(async () => {
      await result.current.withdraw('0.5')
    })

    expect(result.current.appState).toBe(AppState.Rejected)
    expect(result.current.lastAction).toBe('Transaction rejected')
  })

  it('preserves balance after deposit rejection when balance > 0', async () => {
    let currentBalance = '0'
    const provider = mockProvider({
      deposit: vi.fn()
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('rejected')),
      getBalance: vi.fn().mockImplementation(() => Promise.resolve(currentBalance)),
    })
    const { result } = renderHook(() =>
      useLockBox({ provider, isConnected: true, isSupported: true }),
    )

    currentBalance = '0.5'
    await act(async () => {
      await result.current.deposit('0.5')
    })
    expect(result.current.balance).toBe('0.5')

    act(() => { vi.advanceTimersByTime(5000) })

    await act(async () => {
      await result.current.deposit('0.3')
    })
    expect(result.current.balance).toBe('0.5')
    expect(result.current.appState).toBe(AppState.Rejected)
  })
})
