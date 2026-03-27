import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLockBox } from '../../hooks/useLockBox'
import { AppState } from '../../lib/types'
import type { LockBoxProvider } from '../../lib/types'

function mockProvider(overrides: Partial<LockBoxProvider> = {}): LockBoxProvider {
  return {
    mintLKBOX: vi.fn().mockResolvedValue('0xtxhash'),
    approveLKBOX: vi.fn().mockResolvedValue('0xtxhash'),
    depositLKBOX: vi.fn().mockResolvedValue('0xtxhash'),
    withdrawLKBOX: vi.fn().mockResolvedValue('0xtxhash'),
    getLKBOXBalance: vi.fn().mockResolvedValue('0'),
    getLockedBalance: vi.fn().mockResolvedValue('0'),
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
    expect(result.current.lkboxBalance).toBe('0')
    expect(result.current.lockedBalance).toBe('0')
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

  it('transitions through mint lifecycle: pending -> confirmed -> idle', async () => {
    let resolveMint!: (hash: string) => void
    const mintPromise = new Promise<string>((resolve) => { resolveMint = resolve })
    const provider = mockProvider({
      mintLKBOX: vi.fn().mockReturnValue(mintPromise),
      getLKBOXBalance: vi.fn().mockResolvedValue('1000'),
    })
    const { result } = renderHook(() =>
      useLockBox({ provider, isConnected: true, isSupported: true }),
    )

    let mintCallPromise!: Promise<void>
    act(() => {
      mintCallPromise = result.current.mint('1')
    })
    expect(result.current.appState).toBe(AppState.Pending)

    await act(async () => {
      resolveMint('0xtxhash')
      await mintCallPromise
    })

    expect(result.current.appState).toBe(AppState.Confirmed)
    expect(result.current.lastAction).toContain('1000 LKBOX')

    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(result.current.appState).toBe(AppState.Idle)
  })

  it('transitions to approving then depositing then confirmed on successful deposit', async () => {
    const provider = mockProvider({
      approveLKBOX: vi.fn().mockResolvedValue('0xapprovehash'),
      depositLKBOX: vi.fn().mockResolvedValue('0xdeposithash'),
      getLKBOXBalance: vi.fn().mockResolvedValue('50'),
      getLockedBalance: vi.fn().mockResolvedValue('50'),
    })
    const { result } = renderHook(() =>
      useLockBox({ provider, isConnected: true, isSupported: true }),
    )

    await act(async () => {
      await result.current.deposit('50')
    })

    expect(result.current.appState).toBe(AppState.Confirmed)
    expect(result.current.lastAction).toBe('Deposited 50 LKBOX')

    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(result.current.appState).toBe(AppState.Idle)
  })

  it('transitions to rejected on approve rejection', async () => {
    const provider = mockProvider({
      approveLKBOX: vi.fn().mockRejectedValue(new Error('user rejected')),
    })
    const { result } = renderHook(() =>
      useLockBox({ provider, isConnected: true, isSupported: true }),
    )

    await act(async () => {
      await result.current.deposit('50')
    })

    expect(result.current.appState).toBe(AppState.Rejected)
    expect(result.current.lastAction).toBe('Approval rejected')

    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(result.current.appState).toBe(AppState.Idle)
  })

  it('transitions to rejected on deposit rejection after approval', async () => {
    const provider = mockProvider({
      approveLKBOX: vi.fn().mockResolvedValue('0xapprovehash'),
      depositLKBOX: vi.fn().mockRejectedValue(new Error('user rejected')),
    })
    const { result } = renderHook(() =>
      useLockBox({ provider, isConnected: true, isSupported: true }),
    )

    await act(async () => {
      await result.current.deposit('50')
    })

    expect(result.current.appState).toBe(AppState.Rejected)
    expect(result.current.lastAction).toBe('Deposit rejected')
  })

  it('transitions through withdraw lifecycle: pending -> confirmed -> idle', async () => {
    let resolveWithdraw!: (hash: string) => void
    const withdrawPromise = new Promise<string>((resolve) => { resolveWithdraw = resolve })
    const provider = mockProvider({
      withdrawLKBOX: vi.fn().mockReturnValue(withdrawPromise),
      getLockedBalance: vi.fn().mockResolvedValue('0'),
    })
    const { result } = renderHook(() =>
      useLockBox({ provider, isConnected: true, isSupported: true }),
    )

    let withdrawCallPromise!: Promise<void>
    act(() => {
      withdrawCallPromise = result.current.withdraw('50')
    })
    expect(result.current.appState).toBe(AppState.Pending)
    expect(result.current.statusMessage).toBe('Withdrawing LKBOX...')

    await act(async () => {
      resolveWithdraw('0xtxhash')
      await withdrawCallPromise
    })

    expect(result.current.appState).toBe(AppState.Confirmed)
    expect(result.current.lastAction).toBe('Withdrew 50 LKBOX')

    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(result.current.appState).toBe(AppState.Idle)
  })

  it('transitions to rejected on withdraw rejection', async () => {
    const provider = mockProvider({
      withdrawLKBOX: vi.fn().mockRejectedValue(new Error('user rejected')),
    })
    const { result } = renderHook(() =>
      useLockBox({ provider, isConnected: true, isSupported: true }),
    )

    await act(async () => {
      await result.current.withdraw('50')
    })

    expect(result.current.appState).toBe(AppState.Rejected)
    expect(result.current.lastAction).toBe('Transaction rejected')
  })
})
