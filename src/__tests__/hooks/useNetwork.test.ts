import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useNetwork } from '../../hooks/useNetwork'
import type { Eip1193Provider } from '../../lib/types'

const mockRequest = vi.fn()
const mockOn = vi.fn()
const mockRemoveListener = vi.fn()

let mockProvider: Eip1193Provider

beforeEach(() => {
  vi.restoreAllMocks()
  mockRequest.mockReset()
  mockOn.mockReset()
  mockRemoveListener.mockReset()
  mockProvider = {
    request: mockRequest,
    on: mockOn,
    removeListener: mockRemoveListener,
  }
})

describe('useNetwork', () => {
  it('returns null chainId when not connected', () => {
    const { result } = renderHook(() => useNetwork(false, null))
    expect(result.current.chainId).toBeNull()
    expect(result.current.isSupported).toBe(false)
  })

  it('fetches chain ID when connected', async () => {
    mockRequest.mockResolvedValueOnce('0x88BB0') // 560048 in hex = Hoodi
    const { result } = renderHook(() => useNetwork(true, mockProvider))

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })

    expect(result.current.chainId).toBe(560048)
    expect(result.current.isSupported).toBe(true)
    expect(result.current.networkName).toBe('Ethereum Hoodi')
  })

  it('marks unsupported network correctly', async () => {
    mockRequest.mockResolvedValueOnce('0x1') // Mainnet
    const { result } = renderHook(() => useNetwork(true, mockProvider))

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })

    expect(result.current.chainId).toBe(1)
    expect(result.current.isSupported).toBe(false)
    expect(result.current.networkName).not.toBeNull()
  })
})
