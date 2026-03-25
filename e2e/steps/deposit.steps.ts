/**
 * Step definitions for deposit, withdraw, balance, and status scenarios.
 *
 * Covers: deposit-successfully.feature, withdraw-successfully.feature,
 *         reject-transaction.feature
 */
import { expect } from '@playwright/test'
import { createBdd } from 'playwright-bdd'
import { test } from './fixtures'

const { Given, When, Then } = createBdd(test)

/**
 * Store a snapshot of the balance text so we can compare after a transaction.
 * Keyed per test worker via the page object reference.
 */
const balanceSnapshots = new WeakMap<object, string>()

// ---------------------------------------------------------------------------
// Given
// ---------------------------------------------------------------------------

Given('I am connected on the supported network', async ({ page, wallet }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')

  // Connect the wallet if not already connected
  const connectBtn = page.getByTestId('wallet-connect-button')
  if (await connectBtn.isVisible()) {
    await connectBtn.click()
    // TODO: dappwright.approve() - confirms MetaMask connection popup
    await wallet.approve()
  }

  // Verify connected state
  await expect(page.getByTestId('wallet-address')).toBeVisible()
})

Given('my locked balance shows {string}', async ({ page }, expectedBalance: string) => {
  const balanceEl = page.getByTestId('lockbox-balance')
  await expect(balanceEl).toContainText(expectedBalance)
})

Given('I have already deposited successfully', async ({ page, wallet }) => {
  // Snapshot balance before deposit
  const balanceBefore = await page.getByTestId('lockbox-balance').textContent()
  balanceSnapshots.set(page, balanceBefore ?? '0')

  // Perform a 0.1 ETH deposit
  await page.getByTestId('lockbox-input-amount').fill('0.1')
  await page.getByTestId('lockbox-button-deposit').click()

  // TODO: dappwright.confirmTransaction(page) - confirms the pending
  // MetaMask transaction popup for the deposit
  await wallet.confirmTransaction()

  // Wait for the balance to update (transaction confirmed on-chain)
  await expect(page.getByTestId('lockbox-balance')).not.toContainText('0.0 ETH', {
    timeout: 30_000,
  })
})

// ---------------------------------------------------------------------------
// When
// ---------------------------------------------------------------------------

When('I enter {string} in the amount input', async ({ page }, amount: string) => {
  await page.getByTestId('lockbox-input-amount').fill(amount)
})

When('I click the Deposit button', async ({ page }) => {
  await page.getByTestId('lockbox-button-deposit').click()
})

When('I click the Withdraw button', async ({ page }) => {
  await page.getByTestId('lockbox-button-withdraw').click()
})

When('I approve the transaction in MetaMask', async ({ wallet }) => {
  // TODO: dappwright.confirmTransaction() - confirms the pending
  // MetaMask transaction popup (deposit or withdraw)
  await wallet.confirmTransaction()
})

When('I reject the transaction in MetaMask', async ({ wallet }) => {
  // TODO: dappwright.rejectTransaction() - clicks "Reject" on the
  // MetaMask transaction confirmation popup
  await wallet.rejectTransaction()
})

// ---------------------------------------------------------------------------
// Then
// ---------------------------------------------------------------------------

Then('the status panel should show {string}', async ({ page }, expectedText: string) => {
  const statusPanel = page.getByTestId('status-panel')
  await expect(statusPanel).toContainText(expectedText, { timeout: 15_000 })
})

Then('after confirmation the locked balance should update', async ({ page }) => {
  // The balance should no longer show 0.0 ETH after a deposit
  await expect(page.getByTestId('lockbox-balance')).not.toContainText('0.0 ETH', {
    timeout: 30_000,
  })
})

Then('the status should show a deposit confirmation message', async ({ page }) => {
  const statusCurrent = page.getByTestId('status-current')
  await expect(statusCurrent).toContainText(/deposit|confirmed|success/i, { timeout: 15_000 })
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
  const statusCurrent = page.getByTestId('status-current')
  await expect(statusCurrent).toContainText(/withdraw|confirmed|success/i, { timeout: 15_000 })
})
