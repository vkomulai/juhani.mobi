import { test, expect, clearAppState, addItemsViaSpeech } from './fixtures/test-fixtures'

test.describe('Category Sorting', () => {
  test.beforeEach(async ({ speechPage }) => {
    await speechPage.goto('/')
    await clearAppState(speechPage)
    await speechPage.reload()
    await speechPage.waitForLoadState('networkidle')

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

    expect(banaaniIdx).toBeLessThan(maitoIdx)
    expect(maitoIdx).toBeLessThan(hammastahnaidx)
  })

  test('sort disabled: insertion order preserved', async ({ speechPage }) => {
    // Disable sorting via settings menu
    await speechPage.click('.bm-burger-button')
    await speechPage.waitForSelector('.bm-menu')
    await speechPage.locator('.bm-menu .item').first().click()

    // Close menu by clicking outside
    await speechPage.click('.info-area')
    await speechPage.waitForTimeout(300)

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

    expect(banaaniIdx).toBeLessThan(unknownIdx)
  })
})
