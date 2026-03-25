import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { network } from 'hardhat'

async function deployFixture() {
  const { ethers } = await network.connect()
  const factory = await ethers.getContractFactory('LockBox')
  const lockbox = await factory.deploy()
  await lockbox.waitForDeployment()
  return { lockbox, ethers }
}

describe('LockBox', () => {
  it('starts with zero balance', async () => {
    const { lockbox, ethers } = await deployFixture()
    const [owner] = await ethers.getSigners()
    const balance = await lockbox.balanceOf(owner.address)
    assert.equal(balance, 0n)
  })

  it('accepts deposit and tracks balance', async () => {
    const { lockbox, ethers } = await deployFixture()
    const [owner] = await ethers.getSigners()
    await lockbox.deposit({ value: ethers.parseEther('1.0') })
    const balance = await lockbox.balanceOf(owner.address)
    assert.equal(balance, ethers.parseEther('1.0'))
  })

  it('accumulates deposits', async () => {
    const { lockbox, ethers } = await deployFixture()
    await lockbox.deposit({ value: ethers.parseEther('0.5') })
    await lockbox.deposit({ value: ethers.parseEther('0.3') })
    const [owner] = await ethers.getSigners()
    const balance = await lockbox.balanceOf(owner.address)
    assert.equal(balance, ethers.parseEther('0.8'))
  })

  it('withdraws specified amount', async () => {
    const { lockbox, ethers } = await deployFixture()
    const [owner] = await ethers.getSigners()
    await lockbox.deposit({ value: ethers.parseEther('1.0') })

    await lockbox.withdraw(ethers.parseEther('0.4'))

    assert.equal(await lockbox.balanceOf(owner.address), ethers.parseEther('0.6'))
  })

  it('withdraws full balance', async () => {
    const { lockbox, ethers } = await deployFixture()
    const [owner] = await ethers.getSigners()
    await lockbox.deposit({ value: ethers.parseEther('1.0') })

    const balanceBefore = await ethers.provider.getBalance(owner.address)
    const tx = await lockbox.withdraw(ethers.parseEther('1.0'))
    const receipt = await tx.wait()
    const gasUsed = receipt!.gasUsed * receipt!.gasPrice
    const balanceAfter = await ethers.provider.getBalance(owner.address)

    assert.equal(balanceAfter + gasUsed - balanceBefore, ethers.parseEther('1.0'))
    assert.equal(await lockbox.balanceOf(owner.address), 0n)
  })

  it('reverts withdraw when insufficient balance', async () => {
    const { lockbox, ethers } = await deployFixture()
    await lockbox.deposit({ value: ethers.parseEther('0.5') })
    await assert.rejects(
      async () => { await lockbox.withdraw(ethers.parseEther('1.0')) },
      (error: unknown) => {
        const msg = (error as Error).message
        return msg.includes('Insufficient balance')
      }
    )
  })

  it('reverts withdraw with zero amount', async () => {
    const { lockbox, ethers } = await deployFixture()
    await lockbox.deposit({ value: ethers.parseEther('1.0') })
    await assert.rejects(
      async () => { await lockbox.withdraw(0n) },
      (error: unknown) => {
        const msg = (error as Error).message
        return msg.includes('Must withdraw > 0')
      }
    )
  })

  it('reverts deposit with zero value', async () => {
    const { lockbox } = await deployFixture()
    await assert.rejects(
      async () => { await lockbox.deposit({ value: 0n }) },
      (error: unknown) => {
        const msg = (error as Error).message
        return msg.includes('Must send ETH')
      }
    )
  })

  it('reports contract balance', async () => {
    const { lockbox, ethers } = await deployFixture()
    const [addr1, addr2] = await ethers.getSigners()
    assert.equal(await lockbox.contractBalance(), 0n)

    await lockbox.connect(addr1).deposit({ value: ethers.parseEther('1.0') })
    await lockbox.connect(addr2).deposit({ value: ethers.parseEther('2.0') })
    assert.equal(await lockbox.contractBalance(), ethers.parseEther('3.0'))

    await lockbox.connect(addr1).withdraw(ethers.parseEther('0.5'))
    assert.equal(await lockbox.contractBalance(), ethers.parseEther('2.5'))
  })

  it('tracks balances per address independently', async () => {
    const { lockbox, ethers } = await deployFixture()
    const [addr1, addr2] = await ethers.getSigners()
    await lockbox.connect(addr1).deposit({ value: ethers.parseEther('1.0') })
    await lockbox.connect(addr2).deposit({ value: ethers.parseEther('2.0') })

    assert.equal(await lockbox.balanceOf(addr1.address), ethers.parseEther('1.0'))
    assert.equal(await lockbox.balanceOf(addr2.address), ethers.parseEther('2.0'))
  })

  it('resists reentrancy on withdraw', async () => {
    const { lockbox, ethers } = await deployFixture()
    const [, victim] = await ethers.getSigners()

    // Victim deposits 2 ETH (funds the attacker should NOT be able to steal)
    await lockbox.connect(victim).deposit({ value: ethers.parseEther('2.0') })

    const ReentrantFactory = await ethers.getContractFactory('ReentrantAttacker')
    const attacker = await ReentrantFactory.deploy(await lockbox.getAddress())
    await attacker.waitForDeployment()

    // Attacker deposits 1 ETH then tries reentrancy during withdraw
    await attacker.attack({ value: ethers.parseEther('1.0') })

    // Attacker's balance should be 0 (legitimate withdrawal succeeded)
    assert.equal(await lockbox.balanceOf(await attacker.getAddress()), 0n)
    // Victim's funds should be untouched
    assert.equal(await lockbox.balanceOf(victim.address), ethers.parseEther('2.0'))
    // Contract should still hold exactly the victim's 2 ETH
    const contractBalance = await ethers.provider.getBalance(await lockbox.getAddress())
    assert.equal(contractBalance, ethers.parseEther('2.0'))
  })
})
