/**
 * Step definitions for withdraw scenarios.
 */
import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import type { Page } from 'playwright-core'
import { test } from './fixtures'
import { lkboxBalanceSnapshots } from './common.steps'

const { When, Then } = createBdd(test)

When('I enter {string} in the withdraw input', async ({ page }, amount: string) => {
  await page.getByTestId('withdraw-input').fill(amount)
})

When('I click "Withdraw"', async ({ page }) => {
  ;(page as any).__withdrawPopup = page.context().waitForEvent('page')
  await page.getByTestId('withdraw-btn').click()
})

Then('the withdraw button should be disabled', async ({ page }) => {
  await expect(page.getByTestId('withdraw-btn')).toBeDisabled()
})

Then('my locked balance should be {int}', async ({ page }, expected: number) => {
  await expect(async () => {
    const text = await page.getByTestId('locked-balance').textContent()
    const amount = parseFloat((text ?? '0').replace(/[^0-9.]/g, ''))
    expect(amount).toBe(expected)
  }).toPass({ timeout: 30_000 })
})

Then('my wallet LKBOX balance should increase by {int}', async ({ page }, increase: number) => {
  const snapshot = lkboxBalanceSnapshots.get(page) ?? 0
  await expect(async () => {
    const text = await page.getByTestId('lkbox-balance').textContent()
    const current = parseFloat((text ?? '0').replace(/[^0-9.]/g, ''))
    expect(current).toBeGreaterThanOrEqual(snapshot + increase - 0.01)
  }).toPass({ timeout: 30_000 })
})
