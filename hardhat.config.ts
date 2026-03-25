import hardhatEthers from '@nomicfoundation/hardhat-ethers'
import hardhatNodeTestRunner from '@nomicfoundation/hardhat-node-test-runner'
import { defineConfig } from 'hardhat/config'

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
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
})
