import { test, expect } from '@playwright/test'

const incomeTotal = page => page.locator('.summary-card')
  .filter({ has: page.getByRole('heading', { name: 'Income', exact: true }) })
  .locator('p')

function displayedAmount(text) {
  return Number(text.replace(/[$,]/g, ''))
}

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2027-01-15T12:00:00Z') })
})

test('adding income increases its total numerically, not by string concatenation', async ({ page }) => {
  await page.goto('/')
  const before = displayedAmount(await incomeTotal(page).innerText())
  await page.getByPlaceholder('Description').fill('Workshop income')
  await page.getByPlaceholder('Amount').fill('100')
  await page.locator('form').getByRole('combobox').first().selectOption('income')
  await page.getByRole('button', { name: 'Add', exact: true }).click()
  await expect.poll(async () => displayedAmount(await incomeTotal(page).innerText()))
    .toBe(before + 100)
})

test('fixture totals and UTC dates are deterministic across the year boundary', async ({ page }) => {
  await page.goto('/')
  await expect(incomeTotal(page)).toHaveText('$5800.00')
  await expect(page.locator('.summary-card .expense-amount')).toHaveText('$1545.00')
  await expect(page.locator('.balance-amount')).toHaveText('$4255.00')
  await expect(page.locator('tbody tr')).toHaveCount(8)
  await expect(page.getByRole('row').filter({ hasText: 'Rent' })).toContainText('2026-12-02')
  await expect(page.getByRole('row').filter({ hasText: 'Groceries' })).toContainText('2027-01-03')
})

test('adding a decimal expense updates totals and clears the form', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Description', { exact: true }).fill('  Lunch  ')
  await page.getByLabel('Amount (USD)').fill('12.34')
  await page.getByRole('button', { name: 'Add', exact: true }).click()
  const row = page.getByRole('row').filter({ hasText: 'Lunch' })
  await expect(row).toContainText('2027-01-15')
  await expect(row.getByRole('cell').nth(1)).toHaveText('Lunch')
  await expect(row).toContainText('-$12.34')
  await expect(page.locator('.summary-card .expense-amount')).toHaveText('$1557.34')
  await expect(page.locator('.balance-amount')).toHaveText('$4242.66')
  await expect(page.getByLabel('Description', { exact: true })).toHaveValue('')
  await expect(page.getByLabel('Amount (USD)')).toHaveValue('')
})

test('invalid entries preserve the existing transactions and totals', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Description', { exact: true }).fill('Invalid example')
  for (const amount of ['', '0', '-1', '1.001', '1000000.01']) {
    await page.getByLabel('Amount (USD)').fill(amount)
    await page.getByRole('button', { name: 'Add', exact: true }).click()
    await expect(page.locator('tbody tr')).toHaveCount(8)
    await expect(page.getByLabel('Amount (USD)')).toBeFocused()
    expect(await page.getByLabel('Amount (USD)').evaluate(el => el.checkValidity())).toBe(false)
  }
  await page.getByLabel('Description', { exact: true }).fill('   ')
  await page.getByLabel('Amount (USD)').fill('10')
  await page.getByRole('button', { name: 'Add', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('description')
  await expect(page.locator('tbody tr')).toHaveCount(8)
  await expect(page.locator('.balance-amount')).toHaveText('$4255.00')
})

test('table filters combine, show an empty state, and leave global totals alone', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Filter type').selectOption('income')
  await expect(page.locator('tbody tr')).toHaveCount(2)
  await page.getByLabel('Filter category').selectOption('food')
  await expect(page.getByText('No transactions match these filters.')).toBeVisible()
  await page.getByLabel('Filter type').selectOption('expense')
  await expect(page.locator('tbody tr')).toHaveCount(2)
  await expect(page.getByRole('table')).toContainText('Groceries')
  await expect(page.getByRole('table')).toContainText('Dinner Out')
  await expect(page.locator('.summary-card .expense-amount')).toHaveText('$1545.00')
  await expect(page.locator('.balance-amount')).toHaveText('$4255.00')
})

test('repeat entries stay distinct and reload resets synthetic changes', async ({ page }) => {
  const messages = []
  page.on('console', message => {
    if (['error', 'warning'].includes(message.type())) messages.push(message.text())
  })
  page.on('pageerror', error => messages.push(error.message))
  await page.goto('/')
  for (const [description, amount] of [['First item', '0.10'], ['Second item', '0.20']]) {
    await page.getByLabel('Description', { exact: true }).fill(description)
    await page.getByLabel('Amount (USD)').fill(amount)
    await page.getByRole('button', { name: 'Add', exact: true }).click()
  }
  await expect(page.locator('tbody tr')).toHaveCount(10)
  await expect(page.locator('.summary-card .expense-amount')).toHaveText('$1545.30')
  await page.reload()
  await expect(page.locator('tbody tr')).toHaveCount(8)
  await expect(page.locator('.summary-card .expense-amount')).toHaveText('$1545.00')
  expect(messages).toEqual([])
})

test('narrow screens keep controls labelled and page content within the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('/')
  await expect(page.getByRole('main')).toBeVisible()
  for (const [role, name] of [
    ['textbox', 'Description'], ['spinbutton', 'Amount (USD)'],
    ['combobox', 'Transaction type'], ['combobox', 'Category'],
    ['combobox', 'Filter type'], ['combobox', 'Filter category'],
  ]) {
    const control = page.getByRole(role, { name, exact: true })
    await expect(control).toBeVisible()
    expect((await control.boundingBox()).height).toBeGreaterThanOrEqual(44)
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByLabel('Description', { exact: true }).focus()
  await page.keyboard.press('Tab')
  await expect(page.getByLabel('Amount (USD)')).toBeFocused()
})
