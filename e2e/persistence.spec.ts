import { test, expect, setSpeechTranscript, clearAppState, addItemsViaSpeech } from './fixtures/test-fixtures'

test.describe('Persistence', () => {
  test.beforeEach(async ({ speechPage }) => {
    await speechPage.goto('/')
    await clearAppState(speechPage)
    await speechPage.reload()
    await speechPage.waitForLoadState('networkidle')
  })

  test('default items appear on localhost with empty localStorage', async ({ speechPage }) => {
    // On localhost with no saved state, 4 default items should appear
    const items = speechPage.locator('.items-container')
    await expect(items).toHaveCount(4)

    const itemTexts = await speechPage.locator('.items-container .item-container span:not([class])').allTextContents()
    // The actual span with the item name has class item-normal or item-collected
    const itemNames = await speechPage.locator('.items-container span.item-normal').allTextContents()
    expect(itemNames).toContain('banaani')
    expect(itemNames).toContain('appelsiini')
    expect(itemNames).toContain('kiwi')
    expect(itemNames).toContain('kahvi')
  })

  test('items persist across page reload', async ({ speechPage }) => {
    // Add items via speech
    await addItemsViaSpeech(speechPage, 'maito leipä')

    // Verify items are in the list
    await expect(speechPage.locator('span.item-normal', { hasText: 'maito' })).toBeVisible()
    await expect(speechPage.locator('span.item-normal', { hasText: 'leipä' })).toBeVisible()

    // Reload the page
    await speechPage.reload()
    await speechPage.waitForLoadState('networkidle')

    // Items should still be visible after reload
    await expect(speechPage.locator('span.item-normal', { hasText: 'maito' })).toBeVisible()
    await expect(speechPage.locator('span.item-normal', { hasText: 'leipä' })).toBeVisible()
  })

  test('state is stored under localStorage key "juhani.mobi"', async ({ speechPage }) => {
    await addItemsViaSpeech(speechPage, 'juusto')

    const storedData = await speechPage.evaluate(() => {
      return localStorage.getItem('juhani.mobi')
    })

    expect(storedData).not.toBeNull()
    const parsed = JSON.parse(storedData!)
    expect(parsed).toHaveProperty('state')
    expect(parsed.state).toHaveProperty('shoppingItems')
    expect(parsed.state.shoppingItems.some((item: any) => item.name === 'juusto')).toBe(true)
  })

  test('sort toggle persists across reload', async ({ speechPage }) => {
    // Open menu and toggle sort off
    await speechPage.click('.bm-burger-button')
    await speechPage.waitForSelector('.bm-menu')

    // Find the sort checkbox and verify it's initially checked
    const sortCheckbox = speechPage.locator('.bm-menu input[type="checkbox"]')
    await expect(sortCheckbox).toBeChecked()

    // Click to toggle sort off
    await speechPage.locator('.bm-menu .item').first().click()
    await expect(sortCheckbox).not.toBeChecked()

    // Reload
    await speechPage.reload()
    await speechPage.waitForLoadState('networkidle')

    // Open menu again and verify sort is still off
    await speechPage.click('.bm-burger-button')
    await speechPage.waitForSelector('.bm-menu')
    const sortCheckboxAfter = speechPage.locator('.bm-menu input[type="checkbox"]')
    await expect(sortCheckboxAfter).not.toBeChecked()
  })
})
