import hardhatEthers from '@nomicfoundation/hardhat-ethers'
import hardhatNodeTestRunner from '@nomicfoundation/hardhat-node-test-runner'
import { defineConfig } from 'hardhat/config'
import 'dotenv/config'

export default defineConfig({
  plugins: [hardhatEthers, hardhatNodeTestRunner],
  solidity: {
    version: '0.8.24',
  },
  networks: {
    hardhat: {
      type: 'edr-simulated',
      chainId: 31337,
    },
    hoodi: {
      type: 'http',
      url: 'https://rpc.hoodi.ethpandaops.io',
      chainId: 560048,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
})
