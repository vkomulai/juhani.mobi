import { test, expect, clearAppState, addItemsViaSpeech } from './fixtures/test-fixtures'
import * as fs from 'fs'
import * as path from 'path'

// Load category data to serve via route mock (backend may not be running)
const categoryDataPath = path.resolve(__dirname, '../src/api/CategoryData.json')
const categoryData = JSON.parse(fs.readFileSync(categoryDataPath, 'utf-8'))

test.describe('Category Sorting', () => {
  test.beforeEach(async ({ speechPage }) => {
    // Mock the /categories endpoint so Fuse.js gets initialized with real data
    await speechPage.route('**/categories', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(categoryData)
      })
    })

    await speechPage.goto('/')
    await clearAppState(speechPage)
    await speechPage.reload()
    await speechPage.waitForLoadState('networkidle')
    // Give Fuse.js time to initialize with the mocked category data
    await speechPage.waitForTimeout(300)

    // Clear default items
    const emptyButton = speechPage.locator('button:has-text("Tyhjennä")')
    if (await emptyButton.isEnabled()) {
      await emptyButton.click()
    }
  })

  test('sort enabled (default): items ordered by category', async ({ speechPage }) => {
    // Add items from different categories:
    // hammastahna = taloustarvikkeet (order 9)
    // banaani = hevi (order 1)
    // maito = maitotuotteet (order 4)
    await addItemsViaSpeech(speechPage, 'hammastahna banaani maito')

    const itemNames = await speechPage.locator('span.item-normal').allTextContents()

    // With sorting enabled, order should be: banaani (1) < maito (4) < hammastahna (9)
    const banaaniIdx = itemNames.indexOf('banaani')
    const maitoIdx = itemNames.indexOf('maito')
    const hammastahnaidx = itemNames.indexOf('hammastahna')

    expect(banaaniIdx).toBeGreaterThanOrEqual(0)
    expect(maitoIdx).toBeGreaterThanOrEqual(0)
    expect(hammastahnaidx).toBeGreaterThanOrEqual(0)
    expect(banaaniIdx).toBeLessThan(maitoIdx)
    expect(maitoIdx).toBeLessThan(hammastahnaidx)
  })

  test('sort disabled: insertion order preserved', async ({ speechPage }) => {
    // Disable sorting via settings menu
    await speechPage.click('.bm-burger-button')
    await speechPage.waitForSelector('.bm-menu')
    await speechPage.locator('.bm-menu .item').first().click()

    // Close menu by pressing Escape (overlay intercepts clicks on .info-area)
    await speechPage.keyboard.press('Escape')
    await speechPage.waitForTimeout(500)

    // Add items in specific order
    await addItemsViaSpeech(speechPage, 'hammastahna banaani maito')

    const itemNames = await speechPage.locator('span.item-normal').allTextContents()

    // Without sorting, insertion order should be preserved
    const hammastahnaidx = itemNames.indexOf('hammastahna')
    const banaaniIdx = itemNames.indexOf('banaani')
    const maitoIdx = itemNames.indexOf('maito')

    expect(hammastahnaidx).toBeLessThan(banaaniIdx)
    expect(banaaniIdx).toBeLessThan(maitoIdx)
  })

  test('unknown items sort to end', async ({ speechPage }) => {
    // Add a known item and an unknown item
    // banaani = hevi (order 1)
    // xyznonexistent = unknown (order 99999)
    await addItemsViaSpeech(speechPage, 'xyznonexistent banaani')

    const itemNames = await speechPage.locator('span.item-normal').allTextContents()

    const banaaniIdx = itemNames.indexOf('banaani')
    const unknownIdx = itemNames.indexOf('xyznonexistent')

    expect(banaaniIdx).toBeGreaterThanOrEqual(0)
    expect(unknownIdx).toBeGreaterThanOrEqual(0)
    expect(banaaniIdx).toBeLessThan(unknownIdx)
  })
})
