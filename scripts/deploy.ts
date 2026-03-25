import { network } from 'hardhat'

async function main() {
  const { ethers } = await network.connect()
  const factory = await ethers.getContractFactory('LockBox')
  const lockbox = await factory.deploy()
  await lockbox.waitForDeployment()
  console.log(`LockBox deployed to: ${await lockbox.getAddress()}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
