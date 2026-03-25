import hardhatEthers from '@nomicfoundation/hardhat-ethers'
import { defineConfig } from 'hardhat/config'

export default defineConfig({
  plugins: [hardhatEthers],
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
