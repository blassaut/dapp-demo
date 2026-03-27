/**
 * Step definitions for deposit and on-chain verification scenarios.
 */
import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import type { Page } from 'playwright-core'
import { test } from './fixtures'
import { lkboxBalanceSnapshots } from './common.steps'

const { When, Then } = createBdd(test)

let pendingPopup: Promise<Page> | null = null

When('I enter {string} in the deposit input', async ({ page }, amount: string) => {
  await page.getByTestId('deposit-input').fill(amount)
})

When('I click "Approve & Deposit"', async ({ page }) => {
  pendingPopup = page.context().waitForEvent('page')
  await page.getByTestId('deposit-btn').click()
})

When('I confirm the approval in MetaMask', async ({ page }) => {
  if (!pendingPopup) throw new Error('No pending popup')
  const popup = await pendingPopup
  await popup.getByTestId('confirm-footer-button').click()
  if (!popup.isClosed()) await popup.waitForEvent('close')
  pendingPopup = null
  await page.bringToFront()

  // Wait for the deposit popup (second transaction)
  pendingPopup = page.context().waitForEvent('page')
})

When('I confirm the deposit in MetaMask', async ({ page }) => {
  if (!pendingPopup) throw new Error('No pending popup')
  const popup = await pendingPopup
  await popup.getByTestId('confirm-footer-button').click()
  if (!popup.isClosed()) await popup.waitForEvent('close')
  pendingPopup = null
  await page.bringToFront()
})

Then('my locked balance should show {int} LKBOX', async ({ page }, expected: number) => {
  await expect(async () => {
    const text = await page.getByTestId('locked-balance').textContent()
    const amount = parseFloat((text ?? '0').replace(/[^0-9.]/g, ''))
    expect(amount).toBe(expected)
  }).toPass({ timeout: 30_000 })
})

Then('my wallet LKBOX balance should decrease by {int}', async ({ page }, decrease: number) => {
  const snapshot = lkboxBalanceSnapshots.get(page) ?? 0
  await expect(async () => {
    const text = await page.getByTestId('lkbox-balance').textContent()
    const current = parseFloat((text ?? '0').replace(/[^0-9.]/g, ''))
    expect(current).toBeLessThanOrEqual(snapshot - decrease + 0.01)
  }).toPass({ timeout: 30_000 })
})

Then('the contract token balance should equal {int} LKBOX', async ({ page }, expected: number) => {
  await expect(async () => {
    const text = await page.getByTestId('locked-balance').textContent()
    const amount = parseFloat((text ?? '0').replace(/[^0-9.]/g, ''))
    expect(amount).toBe(expected)
  }).toPass({ timeout: 30_000 })
})

Then('the contract token balance should equal {int}', async ({ page }, expected: number) => {
  await expect(async () => {
    const text = await page.getByTestId('locked-balance').textContent()
    const amount = parseFloat((text ?? '0').replace(/[^0-9.]/g, ''))
    expect(amount).toBe(expected)
  }).toPass({ timeout: 30_000 })
})

Then('my locked balance should equal {int} LKBOX', async ({ page }, expected: number) => {
  await expect(async () => {
    const text = await page.getByTestId('locked-balance').textContent()
    const amount = parseFloat((text ?? '0').replace(/[^0-9.]/g, ''))
    expect(amount).toBe(expected)
  }).toPass({ timeout: 30_000 })
})
