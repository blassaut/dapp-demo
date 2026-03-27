/**
 * Step definitions for wallet connection and network scenarios.
 */
import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import { test } from './fixtures'
import { lkboxBalanceSnapshots, lockedBalanceSnapshots } from './common.steps'

const { Given, When, Then } = createBdd(test)

Given('I am on the LockBox app', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
})

When('I click "Connect Wallet"', async ({ page }) => {
  ;(page as any).__connectPopup = page.context().waitForEvent('page', { timeout: 10_000 }).catch(() => null)
  await page.getByTestId('connect-wallet-btn').click()
})

When('I approve the connection in MetaMask', async ({ page }) => {
  const popup = await (page as any).__connectPopup as import('playwright-core').Page | null
  if (popup) {
    await popup.getByTestId('confirm-btn').click()
    if (!popup.isClosed()) await popup.waitForEvent('close', { timeout: 30_000 })
  }
  // MetaMask may auto-connect without a popup if already authorized
  ;(page as any).__connectPopup = null
  await page.bringToFront()
})

Then('I should see my truncated wallet address', async ({ page }) => {
  const addressEl = page.getByTestId('wallet-address')
  await expect(addressEl).toBeVisible()
  await expect(addressEl).toHaveText(/^0x[a-fA-F0-9]{4}\.{3}[a-fA-F0-9]{4}$/)
})

Then('I should see my LKBOX balance', async ({ page }) => {
  await expect(page.getByTestId('lkbox-balance')).toBeVisible()
  // Snapshot balances for relative assertions later in the scenario
  const lkboxText = await page.getByTestId('lkbox-balance').textContent()
  lkboxBalanceSnapshots.set(page, parseFloat((lkboxText ?? '0').replace(/[^0-9.]/g, '')))
  const lockedText = await page.getByTestId('locked-balance').textContent()
  lockedBalanceSnapshots.set(page, parseFloat((lockedText ?? '0').replace(/[^0-9.]/g, '')))
})
