/**
 * Step definitions for wallet connection and disconnection scenarios.
 *
 * Covers: connect-wallet.feature
 */
import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import { test } from './fixtures'

const { Given, When, Then } = createBdd(test)

// ---------------------------------------------------------------------------
// Given
// ---------------------------------------------------------------------------

Given('I am on the LockBox demo page', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
})

Given('MetaMask is not installed', async ({ page }) => {
  // TODO: Launch a plain Chromium context without the MetaMask extension.
  // dappwright bootstraps MetaMask by default, so this scenario needs a
  // separate browser context that skips extension injection.
  // For now we simulate by removing window.ethereum before the page loads:
  await page.addInitScript(() => {
    Object.defineProperty(window, 'ethereum', {
      get: () => undefined,
      configurable: true,
    })
  })
})

// ---------------------------------------------------------------------------
// When
// ---------------------------------------------------------------------------

When('I click the Connect Wallet button', async ({ page }) => {
  // Store popup promise BEFORE clicking to avoid race condition
  ;(page as any).__connectPopup = page.context().waitForEvent('page')
  await page.getByTestId('wallet-connect-button').click()
})

When('I approve the connection in MetaMask', async ({ page }) => {
  const popupPromise = (page as any).__connectPopup as Promise<import('playwright-core').Page>
  if (!popupPromise) throw new Error('No pending popup - click Connect first')
  const popup = await popupPromise
  await popup.getByTestId('confirm-btn').click()
  if (!popup.isClosed()) await popup.waitForEvent('close')
  ;(page as any).__connectPopup = null
  await page.bringToFront()
})

When('I close the MetaMask connection prompt', async ({ wallet }) => {
  // TODO: dappwright.reject() - dismisses the MetaMask connection popup
  // so the dApp receives a "user rejected" error.
  await wallet.reject()
})

// ---------------------------------------------------------------------------
// Then
// ---------------------------------------------------------------------------

Then('I should see my truncated wallet address', async ({ page }) => {
  const addressEl = page.getByTestId('wallet-address')
  await expect(addressEl).toBeVisible()
  // Truncated address looks like 0x1234...abcd
  await expect(addressEl).toHaveText(/^0x[a-fA-F0-9]{4}\.{3}[a-fA-F0-9]{4}$/)
})

Then('the network chip should show the current network', async ({ page }) => {
  const chip = page.getByTestId('network-chip')
  await expect(chip).toBeVisible()
  // On the local Hardhat network the chip should contain a network name
  await expect(chip).not.toBeEmpty()
})

Then('the app should remain in disconnected state', async ({ page }) => {
  await expect(page.getByTestId('wallet-address')).not.toBeVisible()
})

Then('the Connect Wallet button should still be visible', async ({ page }) => {
  await expect(page.getByTestId('wallet-connect-button')).toBeVisible()
})

Then('I should see {string}', async ({ page }, message: string) => {
  await expect(page.getByText(message)).toBeVisible()
})
