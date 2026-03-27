import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { network } from 'hardhat'

async function deployFixture() {
  const { ethers } = await network.connect()
  const factory = await ethers.getContractFactory('LKBOXToken')
  const token = await factory.deploy()
  await token.waitForDeployment()
  return { token, ethers }
}

describe('LKBOXToken', () => {
  it('has correct name and symbol', async () => {
    const { token } = await deployFixture()
    assert.equal(await token.name(), 'LockBox Token')
    assert.equal(await token.symbol(), 'LKBOX')
  })

  it('mints correct amount: 1 ETH = 1000 LKBOX', async () => {
    const { token, ethers } = await deployFixture()
    const [owner] = await ethers.getSigners()
    await token.mint({ value: ethers.parseEther('1.0') })
    const balance = await token.balanceOf(owner.address)
    assert.equal(balance, ethers.parseEther('1000'))
  })

  it('mints correct amount for fractional ETH', async () => {
    const { token, ethers } = await deployFixture()
    const [owner] = await ethers.getSigners()
    await token.mint({ value: ethers.parseEther('0.1') })
    const balance = await token.balanceOf(owner.address)
    assert.equal(balance, ethers.parseEther('100'))
  })

  it('emits Minted event with correct args', async () => {
    const { token, ethers } = await deployFixture()
    const [owner] = await ethers.getSigners()
    const tx = await token.mint({ value: ethers.parseEther('0.5') })
    const receipt = await tx.wait()
    const event = receipt!.logs.find(
      (log: any) => log.fragment?.name === 'Minted'
    )
    assert.ok(event, 'Minted event not found')
    const args = (event as any).args
    assert.equal(args[0], owner.address)
    assert.equal(args[1], ethers.parseEther('0.5'))
    assert.equal(args[2], ethers.parseEther('500'))
  })

  it('reverts when msg.value is 0', async () => {
    const { token } = await deployFixture()
    await assert.rejects(
      async () => { await token.mint({ value: 0n }) },
      (error: unknown) => {
        const msg = (error as Error).message
        return msg.includes('Must send ETH')
      }
    )
  })

  it('accumulates balance across multiple mints', async () => {
    const { token, ethers } = await deployFixture()
    const [owner] = await ethers.getSigners()
    await token.mint({ value: ethers.parseEther('0.5') })
    await token.mint({ value: ethers.parseEther('0.3') })
    const balance = await token.balanceOf(owner.address)
    assert.equal(balance, ethers.parseEther('800'))
  })
})
