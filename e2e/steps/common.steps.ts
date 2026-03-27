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
    const popupPromise = page.context().waitForEvent('page')
    await connectBtn.click()
    try {
      const popup = await popupPromise
      await popup.getByTestId('confirm-btn').click()
      if (!popup.isClosed()) await popup.waitForEvent('close')
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
  const popupPromise = page.context().waitForEvent('page')
  await page.getByTestId('mint-lkbox-btn').click()
  const popup = await popupPromise
  await popup.getByTestId('confirm-footer-button').click()
  if (!popup.isClosed()) await popup.waitForEvent('close')
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

Given('I have deposited {int} LKBOX', async ({ page, wallet }) => {
  await connectWallet(page)

  // Mint 100 LKBOX (0.1 ETH)
  await page.getByTestId('mint-eth-input').fill('0.1')
  let popupPromise = page.context().waitForEvent('page')
  await page.getByTestId('mint-lkbox-btn').click()
  let popup = await popupPromise
  await popup.getByTestId('confirm-footer-button').click()
  if (!popup.isClosed()) await popup.waitForEvent('close')
  await page.bringToFront()

  await expect(async () => {
    const text = await page.getByTestId('lkbox-balance').textContent()
    expect(parseBalance(text)).toBeGreaterThanOrEqual(100)
  }).toPass({ timeout: 30_000 })

  // Snapshot balances BEFORE deposit for relative assertions
  const lkboxBefore = await page.getByTestId('lkbox-balance').textContent()
  lkboxBalanceSnapshots.set(page, parseBalance(lkboxBefore))
  const lockedBefore = await page.getByTestId('locked-balance').textContent()
  lockedBalanceSnapshots.set(page, parseBalance(lockedBefore))

  // Deposit 50 LKBOX
  await page.getByTestId('deposit-input').fill('50')
  popupPromise = page.context().waitForEvent('page')
  await page.getByTestId('deposit-btn').click()

  // Approve popup
  popup = await popupPromise
  await popup.getByTestId('confirm-footer-button').click()
  if (!popup.isClosed()) await popup.waitForEvent('close')
  await page.bringToFront()

  // Deposit popup
  popupPromise = page.context().waitForEvent('page')
  popup = await popupPromise
  await popup.getByTestId('confirm-footer-button').click()
  if (!popup.isClosed()) await popup.waitForEvent('close')
  await page.bringToFront()

  await expect(async () => {
    const text = await page.getByTestId('locked-balance').textContent()
    expect(parseBalance(text)).toBeGreaterThanOrEqual(50)
  }).toPass({ timeout: 30_000 })
})

Given('I have withdrawn all my LKBOX', async ({ page, wallet }) => {
  // Assumes "I have deposited 50 LKBOX" ran in a prior scenario.
  // But each scenario is independent in Playwright. This Given needs to set up the full state.
  // Actually, for this step to work, it needs its own full setup.
  // Let's do: connect, mint, deposit 50, then withdraw 50.
  await connectWallet(page)

  // Mint
  await page.getByTestId('mint-eth-input').fill('0.1')
  let popupPromise = page.context().waitForEvent('page')
  await page.getByTestId('mint-lkbox-btn').click()
  let popup = await popupPromise
  await popup.getByTestId('confirm-footer-button').click()
  if (!popup.isClosed()) await popup.waitForEvent('close')
  await page.bringToFront()
  await expect(async () => {
    const text = await page.getByTestId('lkbox-balance').textContent()
    expect(parseBalance(text)).toBeGreaterThanOrEqual(100)
  }).toPass({ timeout: 30_000 })

  // Deposit 50
  await page.getByTestId('deposit-input').fill('50')
  popupPromise = page.context().waitForEvent('page')
  await page.getByTestId('deposit-btn').click()
  popup = await popupPromise
  await popup.getByTestId('confirm-footer-button').click()
  if (!popup.isClosed()) await popup.waitForEvent('close')
  await page.bringToFront()
  popupPromise = page.context().waitForEvent('page')
  popup = await popupPromise
  await popup.getByTestId('confirm-footer-button').click()
  if (!popup.isClosed()) await popup.waitForEvent('close')
  await page.bringToFront()
  await expect(async () => {
    const text = await page.getByTestId('locked-balance').textContent()
    expect(parseBalance(text)).toBeGreaterThanOrEqual(50)
  }).toPass({ timeout: 30_000 })

  // Withdraw 50
  await page.getByTestId('withdraw-input').fill('50')
  popupPromise = page.context().waitForEvent('page')
  await page.getByTestId('withdraw-btn').click()
  popup = await popupPromise
  await popup.getByTestId('confirm-footer-button').click()
  if (!popup.isClosed()) await popup.waitForEvent('close')
  await page.bringToFront()

  await expect(async () => {
    const text = await page.getByTestId('locked-balance').textContent()
    expect(parseBalance(text)).toBe(0)
  }).toPass({ timeout: 30_000 })
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
