import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useWallet } from '../../hooks/useWallet'

// Mock walletconnect module so it doesn't try to load real WC dependencies
vi.mock('../../lib/walletconnect', () => ({
  connectWalletConnectProvider: vi.fn(),
  disconnectWalletConnect: vi.fn(),
  isWalletConnectConfigured: vi.fn(() => false),
}))

const mockRequest = vi.fn()
const mockOn = vi.fn()
const mockRemoveListener = vi.fn()

beforeEach(() => {
  vi.restoreAllMocks()
  mockRequest.mockReset()
  mockOn.mockReset()
  mockRemoveListener.mockReset()
  Object.defineProperty(window, 'ethereum', {
    value: {
      request: mockRequest,
      on: mockOn,
      removeListener: mockRemoveListener,
      isMetaMask: true,
    },
    writable: true,
    configurable: true,
  })
})

describe('useWallet', () => {
  it('starts disconnected', () => {
    const { result } = renderHook(() => useWallet())
    expect(result.current.address).toBeNull()
    expect(result.current.isConnected).toBe(false)
    expect(result.current.hasInjectedWallet).toBe(true)
  })

  it('detects no injected wallet when window.ethereum is undefined', () => {
    Object.defineProperty(window, 'ethereum', {
      value: undefined,
      writable: true,
      configurable: true,
    })
    const { result } = renderHook(() => useWallet())
    expect(result.current.hasInjectedWallet).toBe(false)
  })

  it('connects and returns address on successful eth_requestAccounts', async () => {
    mockRequest.mockResolvedValueOnce(['0x1234567890abcdef1234567890abcdef12345678'])
    const { result } = renderHook(() => useWallet())

    await act(async () => {
      await result.current.connect()
    })

    expect(result.current.address).toBe('0x1234567890abcdef1234567890abcdef12345678')
    expect(result.current.isConnected).toBe(true)
  })

  it('stays disconnected when user cancels connection', async () => {
    mockRequest.mockRejectedValueOnce(new Error('User rejected'))
    const { result } = renderHook(() => useWallet())

    await act(async () => {
      await result.current.connect()
    })

    expect(result.current.address).toBeNull()
    expect(result.current.isConnected).toBe(false)
  })

  it('does nothing when connect is called without injected wallet', async () => {
    Object.defineProperty(window, 'ethereum', {
      value: undefined,
      writable: true,
      configurable: true,
    })
    const { result } = renderHook(() => useWallet())

    await act(async () => {
      await result.current.connect()
    })

    expect(result.current.hasInjectedWallet).toBe(false)
    expect(result.current.isConnected).toBe(false)
  })
})
