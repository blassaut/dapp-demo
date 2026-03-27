import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { network } from 'hardhat'

async function deployFixture() {
  const { ethers } = await network.connect()

  const TokenFactory = await ethers.getContractFactory('LKBOXToken')
  const token = await TokenFactory.deploy()
  await token.waitForDeployment()

  const LockBoxFactory = await ethers.getContractFactory('LockBox')
  const lockbox = await LockBoxFactory.deploy(await token.getAddress())
  await lockbox.waitForDeployment()

  return { token, lockbox, ethers }
}

async function mintTokens(token: any, ethers: any, signer: any, ethAmount: string) {
  await token.connect(signer).mint({ value: ethers.parseEther(ethAmount) })
}

async function approveAndDeposit(token: any, lockbox: any, ethers: any, signer: any, lkboxAmount: string) {
  const amount = ethers.parseEther(lkboxAmount)
  await token.connect(signer).approve(await lockbox.getAddress(), amount)
  await lockbox.connect(signer).deposit(amount)
}

describe('LockBox', () => {
  it('stores the token address', async () => {
    const { token, lockbox } = await deployFixture()
    assert.equal(await lockbox.token(), await token.getAddress())
  })

  it('deposits after approval', async () => {
    const { token, lockbox, ethers } = await deployFixture()
    const [owner] = await ethers.getSigners()
    await mintTokens(token, ethers, owner, '1.0')
    const depositAmount = ethers.parseEther('500')
    await token.approve(await lockbox.getAddress(), depositAmount)
    await lockbox.deposit(depositAmount)
    assert.equal(await lockbox.lockedBalance(owner.address), depositAmount)
    assert.equal(await token.balanceOf(await lockbox.getAddress()), depositAmount)
  })

  it('reverts deposit without approval', async () => {
    const { token, lockbox, ethers } = await deployFixture()
    const [owner] = await ethers.getSigners()
    await mintTokens(token, ethers, owner, '1.0')
    await assert.rejects(
      async () => { await lockbox.deposit(ethers.parseEther('500')) },
      (error: unknown) => {
        const msg = (error as Error).message
        return msg.includes('ERC20InsufficientAllowance') || msg.includes('allowance')
      }
    )
  })

  it('withdraws and returns tokens', async () => {
    const { token, lockbox, ethers } = await deployFixture()
    const [owner] = await ethers.getSigners()
    await mintTokens(token, ethers, owner, '1.0')
    await approveAndDeposit(token, lockbox, ethers, owner, '500')
    await lockbox.withdraw(ethers.parseEther('200'))
    assert.equal(await lockbox.lockedBalance(owner.address), ethers.parseEther('300'))
    assert.equal(await token.balanceOf(owner.address), ethers.parseEther('700'))
  })

  it('reverts withdraw when amount exceeds locked balance', async () => {
    const { token, lockbox, ethers } = await deployFixture()
    const [owner] = await ethers.getSigners()
    await mintTokens(token, ethers, owner, '1.0')
    await approveAndDeposit(token, lockbox, ethers, owner, '500')
    await assert.rejects(
      async () => { await lockbox.withdraw(ethers.parseEther('600')) },
      (error: unknown) => {
        const msg = (error as Error).message
        return msg.includes('Insufficient locked balance')
      }
    )
  })

  it('tracks balances per address independently', async () => {
    const { token, lockbox, ethers } = await deployFixture()
    const [addr1, addr2] = await ethers.getSigners()
    await mintTokens(token, ethers, addr1, '1.0')
    await mintTokens(token, ethers, addr2, '2.0')
    await approveAndDeposit(token, lockbox, ethers, addr1, '300')
    await approveAndDeposit(token, lockbox, ethers, addr2, '800')
    assert.equal(await lockbox.lockedBalance(addr1.address), ethers.parseEther('300'))
    assert.equal(await lockbox.lockedBalance(addr2.address), ethers.parseEther('800'))
  })

  it('contract token balance equals sum of deposits minus withdrawals', async () => {
    const { token, lockbox, ethers } = await deployFixture()
    const [addr1, addr2] = await ethers.getSigners()
    await mintTokens(token, ethers, addr1, '1.0')
    await mintTokens(token, ethers, addr2, '1.0')
    await approveAndDeposit(token, lockbox, ethers, addr1, '400')
    await approveAndDeposit(token, lockbox, ethers, addr2, '600')
    const lockboxAddress = await lockbox.getAddress()
    assert.equal(await token.balanceOf(lockboxAddress), ethers.parseEther('1000'))
    await lockbox.connect(addr1).withdraw(ethers.parseEther('100'))
    assert.equal(await token.balanceOf(lockboxAddress), ethers.parseEther('900'))
    assert.equal(await lockbox.lockedBalance(addr1.address), ethers.parseEther('300'))
    assert.equal(await lockbox.lockedBalance(addr2.address), ethers.parseEther('600'))
  })

  it('emits Deposited event', async () => {
    const { token, lockbox, ethers } = await deployFixture()
    const [owner] = await ethers.getSigners()
    await mintTokens(token, ethers, owner, '1.0')
    const amount = ethers.parseEther('500')
    await token.approve(await lockbox.getAddress(), amount)
    const tx = await lockbox.deposit(amount)
    const receipt = await tx.wait()
    const event = receipt!.logs.find(
      (log: any) => log.fragment?.name === 'Deposited'
    )
    assert.ok(event, 'Deposited event not found')
    const args = (event as any).args
    assert.equal(args[0], owner.address)
    assert.equal(args[1], amount)
  })

  it('emits Withdrawn event', async () => {
    const { token, lockbox, ethers } = await deployFixture()
    const [owner] = await ethers.getSigners()
    await mintTokens(token, ethers, owner, '1.0')
    await approveAndDeposit(token, lockbox, ethers, owner, '500')
    const amount = ethers.parseEther('200')
    const tx = await lockbox.withdraw(amount)
    const receipt = await tx.wait()
    const event = receipt!.logs.find(
      (log: any) => log.fragment?.name === 'Withdrawn'
    )
    assert.ok(event, 'Withdrawn event not found')
    const args = (event as any).args
    assert.equal(args[0], owner.address)
    assert.equal(args[1], amount)
  })
})
