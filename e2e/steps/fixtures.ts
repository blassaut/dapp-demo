/**
 * Playwright + dappwright test fixtures.
 *
 * Bootstraps a Chromium browser with the MetaMask extension installed,
 * funded with Hardhat's default test account, and connected to the
 * local Hardhat network (localhost:8545, chainId 31337).
 *
 * Usage in step definitions:
 *   import { test } from './fixtures'
 *   const { Given, When, Then } = createBdd(test)
 */
import { test as base } from '@playwright/test'
import { bootstrap, getWallet, MetaMaskWallet, type Dappwright } from '@tenkeylabs/dappwright'
import type { BrowserContext } from 'playwright-core'

/**
 * Hardhat's default mnemonic - first account is pre-funded with 10 000 ETH.
 * @see https://hardhat.org/hardhat-network/docs/reference#accounts
 */
const HARDHAT_SEED = 'test test test test test test test test test test test junk'

export const test = base.extend<
  { wallet: Dappwright },
  { walletContext: BrowserContext }
>({
  walletContext: [
    async ({}, use) => {
      const [wallet, , context] = await bootstrap('', {
        wallet: 'metamask',
        version: MetaMaskWallet.recommendedVersion,
        seed: HARDHAT_SEED,
        headless: false,
      })

      // Add the local Hardhat network to MetaMask
      await wallet.addNetwork({
        networkName: 'Hardhat',
        rpc: 'http://127.0.0.1:8545',
        chainId: 31337,
        symbol: 'ETH',
      })

      await use(context)
      await context.close()
    },
    { scope: 'worker' },
  ],

  context: async ({ walletContext }, use) => {
    await use(walletContext)
  },

  wallet: async ({ walletContext }, use) => {
    const wallet = await getWallet('metamask', walletContext)
    await use(wallet)
  },
})
