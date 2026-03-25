/**
 * Step definitions for transaction history assertions.
 *
 * Used inline in deposit-successfully.feature and withdraw-successfully.feature.
 */
import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import { test } from './fixtures'

const { Then } = createBdd(test)

/** Track history count per page so we can assert relative growth. */
export const historyCountBefore = new WeakMap<object, number>()

Then('the transaction history should be visible', async ({ page }) => {
  await expect(page.getByTestId('tx-history')).toBeVisible({ timeout: 10_000 })
})

Then('the history should have grown by {int}', async ({ page }, delta: number) => {
  const before = historyCountBefore.get(page) ?? 0
  const expected = before + delta
  await expect(async () => {
    // Expand history if paginated so we count all items
    const showAllBtn = page.getByRole('button', { name: /Show all/ })
    if (await showAllBtn.isVisible()) await showAllBtn.click()
    const count = await page.getByTestId('tx-history-item').count()
    expect(count).toBeGreaterThanOrEqual(expected)
  }).toPass({ timeout: 15_000 })
})
