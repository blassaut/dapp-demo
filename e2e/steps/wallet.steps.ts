/**
 * Step definitions for wallet connection and network scenarios.
 */
import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import { test } from './fixtures'

const { Given, When, Then } = createBdd(test)

Given('I am on the LockBox app', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
})

Given('I am connected with the wrong network', async ({ page, wallet }) => {
  await wallet.switchNetwork('Sepolia')
  await page.goto('/')
  await page.waitForLoadState('networkidle')

  const connectBtn = page.getByTestId('connect-wallet-btn')
  if (await connectBtn.isVisible()) {
    const popupPromise = page.context().waitForEvent('page')
    await connectBtn.click()
    try {
      const popup = await popupPromise
      await popup.getByTestId('confirm-btn').click()
      if (!popup.isClosed()) await popup.waitForEvent('close')
    } catch {}
    await page.bringToFront()
  }
})

Given('I am on the wrong network', async ({ page, wallet }) => {
  await wallet.switchNetwork('Sepolia')
  await page.goto('/')
  await page.waitForLoadState('networkidle')

  const connectBtn = page.getByTestId('connect-wallet-btn')
  if (await connectBtn.isVisible()) {
    const popupPromise = page.context().waitForEvent('page')
    await connectBtn.click()
    try {
      const popup = await popupPromise
      await popup.getByTestId('confirm-btn').click()
      if (!popup.isClosed()) await popup.waitForEvent('close')
    } catch {}
    await page.bringToFront()
  }
})

When('I click "Connect Wallet"', async ({ page }) => {
  ;(page as any).__connectPopup = page.context().waitForEvent('page')
  await page.getByTestId('connect-wallet-btn').click()
})

When('I approve the connection in MetaMask', async ({ page }) => {
  const popupPromise = (page as any).__connectPopup as Promise<import('playwright-core').Page>
  if (!popupPromise) throw new Error('No pending popup')
  const popup = await popupPromise
  await popup.getByTestId('confirm-btn').click()
  if (!popup.isClosed()) await popup.waitForEvent('close')
  ;(page as any).__connectPopup = null
  await page.bringToFront()
})

When('I click "Switch to Hoodi"', async ({ page }) => {
  await page.getByTestId('switch-network-btn').click()
})

Then('I should see my truncated wallet address', async ({ page }) => {
  const addressEl = page.getByTestId('wallet-address')
  await expect(addressEl).toBeVisible()
  await expect(addressEl).toHaveText(/^0x[a-fA-F0-9]{4}\.{3}[a-fA-F0-9]{4}$/)
})

Then('I should see my LKBOX balance', async ({ page }) => {
  await expect(page.getByTestId('lkbox-balance')).toBeVisible()
})

Then('I should see the "Switch to Hoodi" button', async ({ page }) => {
  await expect(page.getByTestId('switch-network-btn')).toBeVisible()
})

Then('deposit and withdraw buttons should be disabled', async ({ page }) => {
  await expect(page.getByTestId('deposit-btn')).not.toBeVisible()
  await expect(page.getByTestId('withdraw-btn')).not.toBeVisible()
})

Then('the network badge should show "Ethereum Hoodi"', async ({ page }) => {
  await expect(page.getByTestId('network-badge')).toContainText('Ethereum Hoodi', { timeout: 15_000 })
})

Then('all actions should be available', async ({ page }) => {
  await expect(page.getByTestId('mint-lkbox-btn')).toBeVisible({ timeout: 15_000 })
  await expect(page.getByTestId('deposit-btn')).toBeVisible()
  await expect(page.getByTestId('withdraw-btn')).toBeVisible()
})
