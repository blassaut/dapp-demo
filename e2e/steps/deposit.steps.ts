/**
 * Step definitions for deposit and on-chain verification scenarios.
 */
import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import type { Page } from 'playwright-core'
import { test } from './fixtures'
import { lkboxBalanceSnapshots, lockedBalanceSnapshots } from './common.steps'

const { When, Then } = createBdd(test)

When('I enter {string} in the deposit input', async ({ page }, amount: string) => {
  await page.getByTestId('deposit-input').fill(amount)
})

When('I click "Approve & Deposit"', async ({ page }) => {
  ;(page as any).__pendingPopup = page.context().waitForEvent('page')
  await page.getByTestId('deposit-btn').click()
})

When('I confirm the approval in MetaMask', async ({ page }) => {
  const pendingPopup = (page as any).__pendingPopup as Promise<Page> | null
  if (!pendingPopup) throw new Error('No pending popup')
  const popup = await pendingPopup

  // Register deposit popup listener BEFORE confirming approval to avoid race condition
  const depositPopupPromise = page.context().waitForEvent('page')
  await popup.getByTestId('confirm-footer-button').click()
  if (!popup.isClosed()) await popup.waitForEvent('close', { timeout: 30_000 })
  await page.bringToFront()

  ;(page as any).__pendingPopup = depositPopupPromise
})

When('I confirm the deposit in MetaMask', async ({ page }) => {
  const pendingPopup = (page as any).__pendingPopup as Promise<Page> | null
  if (!pendingPopup) throw new Error('No pending popup')
  const popup = await pendingPopup
  await popup.getByTestId('confirm-footer-button').click()
  if (!popup.isClosed()) await popup.waitForEvent('close', { timeout: 30_000 })
  ;(page as any).__pendingPopup = null
  await page.bringToFront()
})

Then('my locked balance should have increased by {int}', async ({ page }, increase: number) => {
  const snapshot = lockedBalanceSnapshots.get(page) ?? 0
  await expect(async () => {
    const text = await page.getByTestId('locked-balance').textContent()
    const current = parseFloat((text ?? '0').replace(/[^0-9.]/g, ''))
    expect(current).toBe(snapshot + increase)
  }).toPass({ timeout: 30_000 })
})

Then('I should appear on the leaderboard', async ({ page }) => {
  await page.getByTestId('leaderboard-btn').click()
  await expect(page.getByTestId('leaderboard-you')).toBeVisible({ timeout: 15_000 })
  await page.getByTestId('leaderboard-close-btn').click()
})

Then('my wallet LKBOX balance should decrease by {int}', async ({ page }, decrease: number) => {
  const snapshot = lkboxBalanceSnapshots.get(page) ?? 0
  await expect(async () => {
    const text = await page.getByTestId('lkbox-balance').textContent()
    const current = parseFloat((text ?? '0').replace(/[^0-9.]/g, ''))
    expect(current).toBe(snapshot - decrease)
  }).toPass({ timeout: 30_000 })
})
