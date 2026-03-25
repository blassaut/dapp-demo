import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ControlledProvider } from '../../lib/controlled-provider'

const mockSigner = {
  signMessage: vi.fn(),
}

const mockBrowserProvider = {
  getSigner: vi.fn().mockResolvedValue(mockSigner),
}

vi.mock('ethers', () => ({
  BrowserProvider: vi.fn().mockImplementation(() => mockBrowserProvider),
}))

beforeEach(() => {
  mockSigner.signMessage.mockReset()
  mockBrowserProvider.getSigner.mockClear()
  mockBrowserProvider.getSigner.mockResolvedValue(mockSigner)
})

describe('ControlledProvider', () => {
  it('starts with zero balance', async () => {
    const provider = new ControlledProvider()
    expect(await provider.getBalance()).toBe('0')
  })

  it('increases balance on stake approval', async () => {
    mockSigner.signMessage.mockResolvedValueOnce('0xsignature')
    const provider = new ControlledProvider()

    await provider.stake('0.5')

    expect(await provider.getBalance()).toBe('0.5')
    expect(mockSigner.signMessage).toHaveBeenCalledOnce()
  })

  it('throws on stake rejection', async () => {
    mockSigner.signMessage.mockRejectedValueOnce(new Error('user rejected'))
    const provider = new ControlledProvider()

    await expect(provider.stake('0.5')).rejects.toThrow()
    expect(await provider.getBalance()).toBe('0')
  })

  it('accumulates balance across multiple stakes', async () => {
    mockSigner.signMessage.mockResolvedValue('0xsig')
    const provider = new ControlledProvider()

    await provider.stake('0.1')
    await provider.stake('0.2')

    expect(await provider.getBalance()).toBe('0.3')
  })

  it('resets balance to 0 on unstake', async () => {
    mockSigner.signMessage.mockResolvedValue('0xsig')
    const provider = new ControlledProvider()

    await provider.stake('0.5')
    await provider.unstake()

    expect(await provider.getBalance()).toBe('0')
  })

  it('throws on unstake rejection', async () => {
    mockSigner.signMessage.mockResolvedValueOnce('0xsig')
    mockSigner.signMessage.mockRejectedValueOnce(new Error('user rejected'))
    const provider = new ControlledProvider()

    await provider.stake('0.5')
    await expect(provider.unstake()).rejects.toThrow()
    expect(await provider.getBalance()).toBe('0.5')
  })
})
