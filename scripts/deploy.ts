import { network } from 'hardhat'

async function main() {
  const { ethers } = await network.connect()

  const tokenFactory = await ethers.getContractFactory('LKBOXToken')
  const token = await tokenFactory.deploy()
  await token.waitForDeployment()
  const tokenAddress = await token.getAddress()
  console.log(`LKBOXToken deployed to: ${tokenAddress}`)

  const lockboxFactory = await ethers.getContractFactory('LockBox')
  const lockbox = await lockboxFactory.deploy(tokenAddress)
  await lockbox.waitForDeployment()
  const lockboxAddress = await lockbox.getAddress()
  console.log(`LockBox deployed to: ${lockboxAddress}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
