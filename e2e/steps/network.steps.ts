/**
 * Step definitions for network detection scenarios.
 *
 * Covers: wrong-network.feature
 */
import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import { test } from './fixtures'

const { Given, Then } = createBdd(test)

// ---------------------------------------------------------------------------
// Given
// ---------------------------------------------------------------------------

Given('I am connected on an unsupported network', async ({ page, wallet }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')

  // TODO: dappwright.switchNetwork() - switch MetaMask to Ethereum mainnet
  // (chainId 1) which is unsupported by the LockBox demo app.
  // The app only supports the Hoodi testnet / local Hardhat network.
  await wallet.switchNetwork('Ethereum Mainnet')

  // Connect if not already connected
  const connectBtn = page.getByTestId('wallet-connect-button')
  if (await connectBtn.isVisible()) {
    await connectBtn.click()
    await wallet.approve()
  }

  await expect(page.getByTestId('wallet-address')).toBeVisible()
})

// ---------------------------------------------------------------------------
// Then
// ---------------------------------------------------------------------------

Then('I should see the unsupported network banner', async ({ page }) => {
  await expect(page.getByTestId('network-banner-unsupported')).toBeVisible()
})

Then('the banner should say {string}', async ({ page }, expectedText: string) => {
  await expect(page.getByTestId('network-banner-unsupported')).toContainText(expectedText)
})

Then('the network chip should show amber styling', async ({ page }) => {
  const chip = page.getByTestId('network-chip')
  await expect(chip).toBeVisible()

  // Verify the chip has amber/warning styling - check for amber-related CSS classes
  // The exact class depends on the app's Tailwind implementation
  await expect(chip).toHaveClass(/amber|warning|yellow/)
})
