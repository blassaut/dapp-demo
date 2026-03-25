/**
 * Step definitions for deposit, withdraw, balance, and status scenarios.
 *
 * Covers: deposit-successfully.feature, withdraw-successfully.feature,
 *         reject-transaction.feature
 */
import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import type { Page } from 'playwright-core'
import { test } from './fixtures'
import { historyCountBefore } from './tx-history.steps'

const { Given, When, Then } = createBdd(test)

/**
 * Store a snapshot of the balance text so we can compare after a transaction.
 * Keyed per test worker via the page object reference.
 */
const balanceSnapshots = new WeakMap<object, string>()

/**
 * Pending MetaMask popup promise - set BEFORE clicking Deposit/Withdraw
 * to avoid the race where the popup opens before waitForEvent starts.
 */
let pendingPopup: Promise<Page> | null = null

// ---------------------------------------------------------------------------
// Given
// ---------------------------------------------------------------------------

Given('I am connected on the supported network', async ({ page, wallet }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')

  // Connect the wallet if not already connected
  const connectBtn = page.getByTestId('wallet-connect-button')
  if (await connectBtn.isVisible()) {
    // Listen for popup BEFORE clicking to avoid race condition
    const popupPromise = page.context().waitForEvent('page')
    await connectBtn.click()
    try {
      const popup = await popupPromise
      await popup.getByTestId('confirm-btn').click()
      if (!popup.isClosed()) await popup.waitForEvent('close')
    } catch {
      // MetaMask may auto-connect if already authorized
    }
    await page.bringToFront()
  }

  // Verify connected state
  await expect(page.getByTestId('wallet-address')).toBeVisible()

  // Snapshot history count for relative assertions later
  // Expand if paginated so we count all items, not just the visible 5
  const showAllBtn = page.getByRole('button', { name: /Show all/ })
  if (await showAllBtn.isVisible()) await showAllBtn.click()
  const count = await page.getByTestId('tx-history-item').count()
  historyCountBefore.set(page, count)
  // Collapse back
  const showLessBtn = page.getByRole('button', { name: /Show less/ })
  if (await showLessBtn.isVisible()) await showLessBtn.click()
})

Given('my locked balance shows {string}', async ({ page }, expectedBalance: string) => {
  const balanceEl = page.getByTestId('lockbox-balance')
  await expect(balanceEl).toContainText(expectedBalance)
})

Given('I have already deposited successfully', async ({ page, wallet }) => {
  // Perform a 0.1 ETH deposit - listen for popup BEFORE clicking
  await page.getByTestId('lockbox-input-amount').fill('0.1')
  const popupPromise = page.context().waitForEvent('page')
  await page.getByTestId('lockbox-button-deposit').click()
  const popup = await popupPromise
  await popup.getByTestId('confirm-footer-button').click()
  if (!popup.isClosed()) await popup.waitForEvent('close')
  await page.bringToFront()

  // Wait for the balance to update (transaction confirmed on-chain)
  await expect(page.getByTestId('lockbox-balance')).not.toContainText('0.0 ETH', {
    timeout: 30_000,
  })

  // Snapshot balance AFTER the deposit so later assertions
  // (e.g. "my locked balance should be unchanged") use the post-deposit value
  const balanceAfter = await page.getByTestId('lockbox-balance').textContent()
  balanceSnapshots.set(page, balanceAfter ?? '0')

  // Update history snapshot too so "grown by N" counts from after this setup step
  const showAllBtn = page.getByRole('button', { name: /Show all/ })
  if (await showAllBtn.isVisible()) await showAllBtn.click()
  historyCountBefore.set(page, await page.getByTestId('tx-history-item').count())
  const showLessBtn = page.getByRole('button', { name: /Show less/ })
  if (await showLessBtn.isVisible()) await showLessBtn.click()
})

// ---------------------------------------------------------------------------
// When
// ---------------------------------------------------------------------------

When('I enter {string} in the amount input', async ({ page }, amount: string) => {
  await page.getByTestId('lockbox-input-amount').fill(amount)
})

When('I click the Deposit button', async ({ page }) => {
  pendingPopup = page.context().waitForEvent('page')
  await page.getByTestId('lockbox-button-deposit').click()
})

When('I click the Withdraw button', async ({ page }) => {
  pendingPopup = page.context().waitForEvent('page')
  await page.getByTestId('lockbox-button-withdraw').click()
})

When('I approve the transaction in MetaMask', async ({ page }) => {
  if (!pendingPopup) throw new Error('No pending popup - click Deposit/Withdraw first')
  const popup = await pendingPopup
  await popup.getByTestId('confirm-footer-button').click()
  if (!popup.isClosed()) await popup.waitForEvent('close')
  pendingPopup = null
  await page.bringToFront()
})

When('I reject the transaction in MetaMask', async ({ page }) => {
  if (!pendingPopup) throw new Error('No pending popup - click Deposit/Withdraw first')
  const popup = await pendingPopup
  const cancelBtn = popup.getByTestId('confirm-footer-cancel-button')
  const rejectBtn = popup.getByTestId('cancel-btn')
  await cancelBtn.or(rejectBtn).click()
  if (!popup.isClosed()) await popup.waitForEvent('close')
  pendingPopup = null
  await page.bringToFront()
})

// ---------------------------------------------------------------------------
// Then
// ---------------------------------------------------------------------------

Then('the status panel should show {string}', async ({ page }, expectedText: string) => {
  const statusPanel = page.getByTestId('status-panel')
  await expect(statusPanel).toContainText(expectedText, { timeout: 15_000 })
})

Then('after confirmation the locked balance should update', async ({ page }) => {
  // The balance should show a non-zero value after a deposit
  await expect(async () => {
    const text = await page.getByTestId('lockbox-balance').textContent()
    const amount = parseFloat((text ?? '0').replace(/[^0-9.]/g, ''))
    expect(amount).toBeGreaterThan(0)
  }).toPass({ timeout: 30_000 })
})

Then('the status should show a deposit confirmation message', async ({ page }) => {
  // On Hardhat, tx confirms instantly so the message may be in status-current
  // or already moved to status-last-action (the "last action" line)
  const panel = page.getByTestId('status-panel')
  await expect(panel).toContainText(/deposit|confirmed|success/i, { timeout: 15_000 })
})

Then('after confirmation the locked balance should be higher than before', async ({ page }) => {
  const previousBalance = balanceSnapshots.get(page) ?? '0'
  const previousAmount = parseFloat(previousBalance.replace(/[^0-9.]/g, ''))

  // Wait for balance to exceed the previous value
  await expect(async () => {
    const currentText = await page.getByTestId('lockbox-balance').textContent()
    const currentAmount = parseFloat((currentText ?? '0').replace(/[^0-9.]/g, ''))
    expect(currentAmount).toBeGreaterThan(previousAmount)
  }).toPass({ timeout: 30_000 })
})

Then('after confirmation the amount input should be empty', async ({ page }) => {
  await expect(page.getByTestId('lockbox-input-amount')).toHaveValue('', { timeout: 15_000 })
})

Then('the amount input should still contain {string}', async ({ page }, amount: string) => {
  await expect(page.getByTestId('lockbox-input-amount')).toHaveValue(amount)
})

Then('the Deposit button should be enabled', async ({ page }) => {
  await expect(page.getByTestId('lockbox-button-deposit')).toBeEnabled()
})

Then('the Deposit button should be disabled', async ({ page }) => {
  await expect(page.getByTestId('lockbox-button-deposit')).toBeDisabled()
})

Then('the Withdraw button should be disabled', async ({ page }) => {
  await expect(page.getByTestId('lockbox-button-withdraw')).toBeDisabled()
})

Then('I should see the deposit hint showing the max wallet balance', async ({ page }) => {
  const hint = page.getByTestId('deposit-hint')
  await expect(hint).toBeVisible()
  await expect(hint).toHaveText(/Max deposit: .+ ETH/)
})

Then('I should see the withdraw hint showing the max locked balance', async ({ page }) => {
  const hint = page.getByTestId('withdraw-hint')
  await expect(hint).toBeVisible()
  await expect(hint).toHaveText(/Max withdraw: .+ ETH/)
})

Then('the contract balance should show a non-zero value', async ({ page }) => {
  await expect(async () => {
    const text = await page.getByTestId('contract-balance').textContent()
    const amount = parseFloat((text ?? '0').replace(/[^0-9.]/g, ''))
    expect(amount).toBeGreaterThan(0)
  }).toPass({ timeout: 30_000 })
})

Then('my locked balance should be unchanged', async ({ page }) => {
  const snapshotBalance = balanceSnapshots.get(page)
  if (snapshotBalance) {
    await expect(page.getByTestId('lockbox-balance')).toContainText(snapshotBalance)
  }
})

Then('after confirmation the locked balance should decrease', async ({ page }) => {
  const previousBalance = balanceSnapshots.get(page) ?? '0'
  const previousAmount = parseFloat(previousBalance.replace(/[^0-9.]/g, ''))

  await expect(async () => {
    const currentText = await page.getByTestId('lockbox-balance').textContent()
    const currentAmount = parseFloat((currentText ?? '0').replace(/[^0-9.]/g, ''))
    expect(currentAmount).toBeLessThan(previousAmount)
  }).toPass({ timeout: 30_000 })
})

Then('the status should show a withdrawal confirmation message', async ({ page }) => {
  const panel = page.getByTestId('status-panel')
  await expect(panel).toContainText(/withdraw|confirmed|success/i, { timeout: 15_000 })
})
