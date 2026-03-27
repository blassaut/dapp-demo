/**
 * Shared Given steps used across multiple feature files.
 */
import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import type { Page } from 'playwright-core'
import { test } from './fixtures'

const { Given, Then } = createBdd(test)

/** Store balance snapshots per page for before/after comparisons */
export const lkboxBalanceSnapshots = new WeakMap<object, number>()
export const lockedBalanceSnapshots = new WeakMap<object, number>()

function parseBalance(text: string | null): number {
  return parseFloat((text ?? '0').replace(/[^0-9.]/g, ''))
}

async function connectWallet(page: Page) {
  await page.goto('/')
  await page.waitForLoadState('networkidle')

  const connectBtn = page.getByTestId('connect-wallet-btn')
  if (await connectBtn.isVisible()) {
    const popupPromise = page.context().waitForEvent('page', { timeout: 30_000 })
    await connectBtn.click()
    try {
      const popup = await popupPromise
      await popup.getByTestId('confirm-btn').click()
      if (!popup.isClosed()) await popup.waitForEvent('close', { timeout: 30_000 })
    } catch {
      // MetaMask may auto-connect
    }
    await page.bringToFront()
  }

  await expect(page.getByTestId('wallet-address')).toBeVisible()
}

Given('I am connected to the LockBox app', async ({ page }) => {
  await connectWallet(page)
  const lkboxText = await page.getByTestId('lkbox-balance').textContent()
  lkboxBalanceSnapshots.set(page, parseBalance(lkboxText))
})

Given('I have {int} LKBOX in my wallet', async ({ page, wallet }) => {
  await connectWallet(page)

  // Mint tokens: 100 LKBOX = 0.1 ETH
  const ethAmount = String(100 / 1000)
  await page.getByTestId('mint-eth-input').fill(ethAmount)
  const popupPromise = page.context().waitForEvent('page', { timeout: 30_000 })
  await page.getByTestId('mint-lkbox-btn').click()
  const popup = await popupPromise
  await popup.getByTestId('confirm-footer-button').click()
  if (!popup.isClosed()) await popup.waitForEvent('close', { timeout: 30_000 })
  await page.bringToFront()

  await expect(async () => {
    const text = await page.getByTestId('lkbox-balance').textContent()
    expect(parseBalance(text)).toBeGreaterThanOrEqual(100)
  }).toPass({ timeout: 30_000 })

  const lkboxText = await page.getByTestId('lkbox-balance').textContent()
  lkboxBalanceSnapshots.set(page, parseBalance(lkboxText))
  const lockedText = await page.getByTestId('locked-balance').textContent()
  lockedBalanceSnapshots.set(page, parseBalance(lockedText))
})

Then('I snapshot my current balances', async ({ page }) => {
  const lkboxText = await page.getByTestId('lkbox-balance').textContent()
  lkboxBalanceSnapshots.set(page, parseBalance(lkboxText))
  const lockedText = await page.getByTestId('locked-balance').textContent()
  lockedBalanceSnapshots.set(page, parseBalance(lockedText))
})

Then('my LKBOX balance should be unchanged', async ({ page }) => {
  const snapshot = lkboxBalanceSnapshots.get(page) ?? 0
  const currentText = await page.getByTestId('lkbox-balance').textContent()
  expect(parseBalance(currentText)).toBe(snapshot)
})
