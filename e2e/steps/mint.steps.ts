/**
 * Step definitions for mint scenarios.
 */
import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import type { Page } from 'playwright-core'
import { test } from './fixtures'
import { lkboxBalanceSnapshots } from './common.steps'

const { When, Then } = createBdd(test)

When('I enter {string} ETH in the mint input', async ({ page }, amount: string) => {
  await page.getByTestId('mint-eth-input').fill(amount)
})

When('I click "Mint LKBOX"', async ({ page }) => {
  ;(page as any).__pendingPopup = page.context().waitForEvent('page')
  await page.getByTestId('mint-lkbox-btn').click()
})

When('I confirm the transaction in MetaMask', async ({ page }) => {
  const pendingPopup = (page as any).__pendingPopup as Promise<Page> | null
  if (!pendingPopup) throw new Error('No pending popup')
  const popup = await pendingPopup
  await popup.getByTestId('confirm-footer-button').click()
  if (!popup.isClosed()) await popup.waitForEvent('close')
  ;(page as any).__pendingPopup = null
  await page.bringToFront()
})

When('I reject the transaction in MetaMask', async ({ page }) => {
  const pendingPopup = (page as any).__pendingPopup as Promise<Page> | null
  if (!pendingPopup) throw new Error('No pending popup')
  const popup = await pendingPopup
  const cancelBtn = popup.getByTestId('confirm-footer-cancel-button')
  const rejectBtn = popup.getByTestId('cancel-btn')
  await cancelBtn.or(rejectBtn).click()
  if (!popup.isClosed()) await popup.waitForEvent('close')
  ;(page as any).__pendingPopup = null
  await page.bringToFront()
})

Then('I should see my LKBOX balance increase by {int}', async ({ page }, increase: number) => {
  const snapshot = lkboxBalanceSnapshots.get(page) ?? 0
  await expect(async () => {
    const text = await page.getByTestId('lkbox-balance').textContent()
    const current = parseFloat((text ?? '0').replace(/[^0-9.]/g, ''))
    expect(current).toBeGreaterThanOrEqual(snapshot + increase)
  }).toPass({ timeout: 30_000 })
})

Then('the transaction should appear in history', async ({ page }) => {
  await expect(page.getByTestId('tx-history')).toBeVisible({ timeout: 15_000 })
  await expect(page.getByTestId('tx-history-item').first()).toBeVisible()
})

Then('I should see a rejection message', async ({ page }) => {
  const status = page.getByTestId('tx-status')
  await expect(status).toContainText(/rejected/i, { timeout: 15_000 })
})
