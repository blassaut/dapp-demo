import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ContractProvider } from '../../lib/contract-provider'

const mockWait = vi.fn().mockResolvedValue(undefined)
const mockDeposit = vi.fn().mockResolvedValue({ wait: mockWait })
const mockWithdraw = vi.fn().mockResolvedValue({ wait: mockWait })
const mockBalanceOf = vi.fn()

const mockSigner = {
  getAddress: vi.fn().mockResolvedValue('0xUserAddress'),
}

const mockBrowserProvider = {
  getSigner: vi.fn().mockResolvedValue(mockSigner),
}

vi.mock('ethers', () => ({
  BrowserProvider: vi.fn().mockImplementation(() => mockBrowserProvider),
  Contract: vi.fn().mockImplementation(() => ({
    deposit: mockDeposit,
    withdraw: mockWithdraw,
    balanceOf: mockBalanceOf,
  })),
  formatEther: vi.fn((val: bigint) => {
    const num = Number(val) / 1e18
    return num === 0 ? '0.0' : num.toString()
  }),
  parseEther: vi.fn((val: string) => BigInt(Math.round(parseFloat(val) * 1e18))),
}))

beforeEach(() => {
  mockDeposit.mockResolvedValue({ wait: mockWait })
  mockWithdraw.mockResolvedValue({ wait: mockWait })
  mockWait.mockResolvedValue(undefined)
  mockBalanceOf.mockReset()
  mockSigner.getAddress.mockResolvedValue('0xUserAddress')
})

const FAKE_ADDRESS = '0x1234567890123456789012345678901234567890'

describe('ContractProvider', () => {
  it('calls contract.deposit and waits for tx', async () => {
    const provider = new ContractProvider(FAKE_ADDRESS)
    await provider.deposit('0.5')

    expect(mockDeposit).toHaveBeenCalledOnce()
    expect(mockWait).toHaveBeenCalled()
  })

  it('calls contract.withdraw and waits for tx', async () => {
    const provider = new ContractProvider(FAKE_ADDRESS)
    await provider.withdraw('0.5')

    expect(mockWithdraw).toHaveBeenCalledOnce()
    expect(mockWait).toHaveBeenCalled()
  })

  it('returns formatted balance from contract', async () => {
    mockBalanceOf.mockResolvedValueOnce(1500000000000000000n)

    const provider = new ContractProvider(FAKE_ADDRESS)
    const balance = await provider.getBalance()

    expect(balance).toBe('1.5')
  })

  it('returns 0 balance when nothing deposited', async () => {
    mockBalanceOf.mockResolvedValueOnce(0n)

    const provider = new ContractProvider(FAKE_ADDRESS)
    const balance = await provider.getBalance()

    expect(balance).toBe('0.0')
  })

  it('propagates deposit rejection', async () => {
    mockDeposit.mockRejectedValueOnce(new Error('user rejected'))

    const provider = new ContractProvider(FAKE_ADDRESS)
    await expect(provider.deposit('0.5')).rejects.toThrow('user rejected')
  })

  it('propagates withdraw rejection', async () => {
    mockWithdraw.mockRejectedValueOnce(new Error('user rejected'))

    const provider = new ContractProvider(FAKE_ADDRESS)
    await expect(provider.withdraw('0.5')).rejects.toThrow('user rejected')
  })
})
