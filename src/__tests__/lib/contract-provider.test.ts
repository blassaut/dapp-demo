import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ContractProvider } from '../../lib/contract-provider'

const mockWait = vi.fn().mockResolvedValue(undefined)
const mockDeposit = vi.fn().mockResolvedValue({ wait: mockWait })
const mockWithdraw = vi.fn().mockResolvedValue({ wait: mockWait })
const mockBalanceOf = vi.fn()
const mockContractBalance = vi.fn()

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
    contractBalance: mockContractBalance,
  })),
  formatEther: vi.fn((val: bigint) => {
    const num = Number(val) / 1e18
    return num === 0 ? '0.0' : num.toString()
  }),
  parseEther: vi.fn((val: string) => BigInt(Math.round(parseFloat(val) * 1e18))),
  EventLog: class EventLog {},
}))

beforeEach(() => {
  mockDeposit.mockResolvedValue({ wait: mockWait })
  mockWithdraw.mockResolvedValue({ wait: mockWait })
  mockWait.mockResolvedValue(undefined)
  mockBalanceOf.mockReset()
  mockContractBalance.mockReset()
  mockSigner.getAddress.mockResolvedValue('0xUserAddress')
  Object.defineProperty(window, 'ethereum', {
    value: { request: vi.fn(), on: vi.fn(), removeListener: vi.fn() },
    writable: true,
    configurable: true,
  })
})

const FAKE_ADDRESS = '0x1234567890123456789012345678901234567890'
const fakeEip1193 = { request: vi.fn(), on: vi.fn(), removeListener: vi.fn() }

describe('ContractProvider', () => {
  it('calls contract.deposit and waits for tx', async () => {
    const provider = new ContractProvider(FAKE_ADDRESS, fakeEip1193, 'http://127.0.0.1:8545')
    await provider.deposit('0.5')

    expect(mockDeposit).toHaveBeenCalledOnce()
    expect(mockWait).toHaveBeenCalled()
  })

  it('calls contract.withdraw and waits for tx', async () => {
    const provider = new ContractProvider(FAKE_ADDRESS, fakeEip1193, 'http://127.0.0.1:8545')
    await provider.withdraw('0.5')

    expect(mockWithdraw).toHaveBeenCalledOnce()
    expect(mockWait).toHaveBeenCalled()
  })

  it('returns formatted balance from contract', async () => {
    mockBalanceOf.mockResolvedValueOnce(1500000000000000000n)

    const provider = new ContractProvider(FAKE_ADDRESS, fakeEip1193, 'http://127.0.0.1:8545')
    const balance = await provider.getBalance()

    expect(balance).toBe('1.5')
  })

  it('returns 0 balance when nothing deposited', async () => {
    mockBalanceOf.mockResolvedValueOnce(0n)

    const provider = new ContractProvider(FAKE_ADDRESS, fakeEip1193, 'http://127.0.0.1:8545')
    const balance = await provider.getBalance()

    expect(balance).toBe('0.0')
  })

  it('returns formatted contract balance', async () => {
    mockContractBalance.mockResolvedValueOnce(3000000000000000000n)

    const provider = new ContractProvider(FAKE_ADDRESS, fakeEip1193, 'http://127.0.0.1:8545')
    const balance = await provider.getContractBalance()

    expect(balance).toBe('3')
  })

  it('propagates deposit rejection', async () => {
    mockDeposit.mockRejectedValueOnce(new Error('user rejected'))

    const provider = new ContractProvider(FAKE_ADDRESS, fakeEip1193, 'http://127.0.0.1:8545')
    await expect(provider.deposit('0.5')).rejects.toThrow('user rejected')
  })

  it('propagates withdraw rejection', async () => {
    mockWithdraw.mockRejectedValueOnce(new Error('user rejected'))

    const provider = new ContractProvider(FAKE_ADDRESS, fakeEip1193, 'http://127.0.0.1:8545')
    await expect(provider.withdraw('0.5')).rejects.toThrow('user rejected')
  })
})
