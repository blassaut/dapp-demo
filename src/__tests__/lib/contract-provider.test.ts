import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ContractProvider } from '../../lib/contract-provider'
import { HARDHAT_RPC_URL } from '../../lib/constants'

const mockWait = vi.fn().mockResolvedValue(undefined)
const mockMint = vi.fn().mockResolvedValue({ wait: mockWait, hash: '0xminthash' })
const mockApprove = vi.fn().mockResolvedValue({ wait: mockWait, hash: '0xapprovehash' })
const mockDeposit = vi.fn().mockResolvedValue({ wait: mockWait, hash: '0xdeposithash' })
const mockWithdraw = vi.fn().mockResolvedValue({ wait: mockWait, hash: '0xwithdrawhash' })
const mockBalanceOf = vi.fn()
const mockLockedBalance = vi.fn()

const mockSigner = {
  getAddress: vi.fn().mockResolvedValue('0xUserAddress'),
}

const mockBrowserProvider = {
  getSigner: vi.fn().mockResolvedValue(mockSigner),
}

vi.mock('ethers', () => ({
  BrowserProvider: vi.fn().mockImplementation(() => mockBrowserProvider),
  JsonRpcProvider: vi.fn().mockImplementation(() => ({
    getBlockNumber: vi.fn().mockResolvedValue(100),
  })),
  Contract: vi.fn().mockImplementation(() => ({
    mint: mockMint,
    approve: mockApprove,
    deposit: mockDeposit,
    withdraw: mockWithdraw,
    balanceOf: mockBalanceOf,
    lockedBalance: mockLockedBalance,
    filters: {
      Minted: vi.fn().mockReturnValue({}),
      Deposited: vi.fn().mockReturnValue({}),
      Withdrawn: vi.fn().mockReturnValue({}),
    },
    queryFilter: vi.fn().mockResolvedValue([]),
  })),
  formatEther: vi.fn((val: bigint) => {
    const num = Number(val) / 1e18
    return num === 0 ? '0.0' : num.toString()
  }),
  parseEther: vi.fn((val: string) => BigInt(Math.round(parseFloat(val) * 1e18))),
  EventLog: class EventLog {},
}))

beforeEach(() => {
  mockMint.mockResolvedValue({ wait: mockWait, hash: '0xminthash' })
  mockApprove.mockResolvedValue({ wait: mockWait, hash: '0xapprovehash' })
  mockDeposit.mockResolvedValue({ wait: mockWait, hash: '0xdeposithash' })
  mockWithdraw.mockResolvedValue({ wait: mockWait, hash: '0xwithdrawhash' })
  mockWait.mockResolvedValue(undefined)
  mockBalanceOf.mockReset()
  mockLockedBalance.mockReset()
  mockSigner.getAddress.mockResolvedValue('0xUserAddress')
  Object.defineProperty(window, 'ethereum', {
    value: { request: vi.fn(), on: vi.fn(), removeListener: vi.fn() },
    writable: true,
    configurable: true,
  })
})

const FAKE_TOKEN_ADDRESS = '0x1234567890123456789012345678901234567890'
const FAKE_LOCKBOX_ADDRESS = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'
const fakeEip1193 = { request: vi.fn(), on: vi.fn(), removeListener: vi.fn() }

describe('ContractProvider', () => {
  it('calls token contract.mint and waits for tx', async () => {
    const provider = new ContractProvider(FAKE_TOKEN_ADDRESS, FAKE_LOCKBOX_ADDRESS, fakeEip1193, HARDHAT_RPC_URL)
    await provider.mintLKBOX('0.001')

    expect(mockMint).toHaveBeenCalledOnce()
    expect(mockWait).toHaveBeenCalled()
  })

  it('calls token contract.approve and waits for tx', async () => {
    const provider = new ContractProvider(FAKE_TOKEN_ADDRESS, FAKE_LOCKBOX_ADDRESS, fakeEip1193, HARDHAT_RPC_URL)
    await provider.approveLKBOX('100')

    expect(mockApprove).toHaveBeenCalledOnce()
    expect(mockWait).toHaveBeenCalled()
  })

  it('calls lockbox contract.deposit and waits for tx', async () => {
    const provider = new ContractProvider(FAKE_TOKEN_ADDRESS, FAKE_LOCKBOX_ADDRESS, fakeEip1193, HARDHAT_RPC_URL)
    await provider.depositLKBOX('100')

    expect(mockDeposit).toHaveBeenCalledOnce()
    expect(mockWait).toHaveBeenCalled()
  })

  it('calls lockbox contract.withdraw and waits for tx', async () => {
    const provider = new ContractProvider(FAKE_TOKEN_ADDRESS, FAKE_LOCKBOX_ADDRESS, fakeEip1193, HARDHAT_RPC_URL)
    await provider.withdrawLKBOX('50')

    expect(mockWithdraw).toHaveBeenCalledOnce()
    expect(mockWait).toHaveBeenCalled()
  })

  it('returns formatted LKBOX balance from token contract', async () => {
    mockBalanceOf.mockResolvedValueOnce(1500000000000000000000n)

    const provider = new ContractProvider(FAKE_TOKEN_ADDRESS, FAKE_LOCKBOX_ADDRESS, fakeEip1193, HARDHAT_RPC_URL)
    const balance = await provider.getLKBOXBalance()

    expect(typeof balance).toBe('string')
  })

  it('returns formatted locked balance from lockbox contract', async () => {
    mockLockedBalance.mockResolvedValueOnce(500000000000000000000n)

    const provider = new ContractProvider(FAKE_TOKEN_ADDRESS, FAKE_LOCKBOX_ADDRESS, fakeEip1193, HARDHAT_RPC_URL)
    const balance = await provider.getLockedBalance()

    expect(typeof balance).toBe('string')
  })

  it('propagates mint rejection', async () => {
    mockMint.mockRejectedValueOnce(new Error('user rejected'))

    const provider = new ContractProvider(FAKE_TOKEN_ADDRESS, FAKE_LOCKBOX_ADDRESS, fakeEip1193, HARDHAT_RPC_URL)
    await expect(provider.mintLKBOX('0.001')).rejects.toThrow('user rejected')
  })

  it('propagates deposit rejection', async () => {
    mockDeposit.mockRejectedValueOnce(new Error('user rejected'))

    const provider = new ContractProvider(FAKE_TOKEN_ADDRESS, FAKE_LOCKBOX_ADDRESS, fakeEip1193, HARDHAT_RPC_URL)
    await expect(provider.depositLKBOX('100')).rejects.toThrow('user rejected')
  })

  it('propagates withdraw rejection', async () => {
    mockWithdraw.mockRejectedValueOnce(new Error('user rejected'))

    const provider = new ContractProvider(FAKE_TOKEN_ADDRESS, FAKE_LOCKBOX_ADDRESS, fakeEip1193, HARDHAT_RPC_URL)
    await expect(provider.withdrawLKBOX('50')).rejects.toThrow('user rejected')
  })
})
