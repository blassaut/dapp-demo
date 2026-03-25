import { expect } from 'chai'
import { ethers } from 'hardhat'

describe('LockBox', () => {
  async function deployFixture() {
    const factory = await ethers.getContractFactory('LockBox')
    const lockbox = await factory.deploy()
    await lockbox.waitForDeployment()
    return { lockbox }
  }

  it('starts with zero balance', async () => {
    const { lockbox } = await deployFixture()
    const [owner] = await ethers.getSigners()
    const balance = await lockbox.balanceOf(owner.address)
    expect(balance).to.equal(0n)
  })

  it('accepts deposit and tracks balance', async () => {
    const { lockbox } = await deployFixture()
    const [owner] = await ethers.getSigners()
    await lockbox.deposit({ value: ethers.parseEther('1.0') })
    const balance = await lockbox.balanceOf(owner.address)
    expect(balance).to.equal(ethers.parseEther('1.0'))
  })

  it('accumulates deposits', async () => {
    const { lockbox } = await deployFixture()
    await lockbox.deposit({ value: ethers.parseEther('0.5') })
    await lockbox.deposit({ value: ethers.parseEther('0.3') })
    const [owner] = await ethers.getSigners()
    const balance = await lockbox.balanceOf(owner.address)
    expect(balance).to.equal(ethers.parseEther('0.8'))
  })

  it('withdraws full balance back to sender', async () => {
    const { lockbox } = await deployFixture()
    const [owner] = await ethers.getSigners()
    await lockbox.deposit({ value: ethers.parseEther('1.0') })

    const balanceBefore = await ethers.provider.getBalance(owner.address)
    const tx = await lockbox.withdraw()
    const receipt = await tx.wait()
    const gasUsed = receipt!.gasUsed * receipt!.gasPrice
    const balanceAfter = await ethers.provider.getBalance(owner.address)

    expect(balanceAfter + gasUsed - balanceBefore).to.equal(ethers.parseEther('1.0'))
    expect(await lockbox.balanceOf(owner.address)).to.equal(0n)
  })

  it('reverts withdraw when nothing deposited', async () => {
    const { lockbox } = await deployFixture()
    try {
      await lockbox.withdraw()
      expect.fail('Expected revert')
    } catch (error: unknown) {
      const msg = (error as Error).message
      expect(msg).to.include('Nothing deposited')
    }
  })

  it('reverts deposit with zero value', async () => {
    const { lockbox } = await deployFixture()
    try {
      await lockbox.deposit({ value: 0n })
      expect.fail('Expected revert')
    } catch (error: unknown) {
      const msg = (error as Error).message
      expect(msg).to.include('Must send ETH')
    }
  })

  it('tracks balances per address independently', async () => {
    const { lockbox } = await deployFixture()
    const [addr1, addr2] = await ethers.getSigners()
    await lockbox.connect(addr1).deposit({ value: ethers.parseEther('1.0') })
    await lockbox.connect(addr2).deposit({ value: ethers.parseEther('2.0') })

    expect(await lockbox.balanceOf(addr1.address)).to.equal(ethers.parseEther('1.0'))
    expect(await lockbox.balanceOf(addr2.address)).to.equal(ethers.parseEther('2.0'))
  })

  it('resists reentrancy on withdraw', async () => {
    const { lockbox } = await deployFixture()
    const ReentrantFactory = await ethers.getContractFactory('ReentrantAttacker')
    const attacker = await ReentrantFactory.deploy(await lockbox.getAddress())
    await attacker.waitForDeployment()

    await attacker.attack({ value: ethers.parseEther('1.0') })

    // CEI pattern prevents double-withdraw: attacker balance should be 0
    expect(await lockbox.balanceOf(await attacker.getAddress())).to.equal(0n)
  })
})
