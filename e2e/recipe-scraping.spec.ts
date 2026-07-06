import { test, expect, clearAppState } from './fixtures/test-fixtures'

test.describe('Recipe Scraping', () => {
  test('share target with recipe URL loads ingredients', async ({ speechPage }) => {
    const recipeUrl = 'https://www.kotikokki.net/reseptit/test-recipe'
    const mockIngredients = [
      { amount: '2', name: 'kananmuna' },
      { amount: '1 dl', name: 'sokeri' }
    ]

    // Mock GET /recipe?url=... — scrapeRecipe() calls this on DOMContentLoaded
    await speechPage.route('**/recipe**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockIngredients)
      })
    })

    // Navigate first so localStorage is accessible, then clear state
    await speechPage.goto('/')
    await clearAppState(speechPage)

    // Navigate with share target URL param — triggers listenToShareTargetEvent
    await speechPage.goto(`/?url=${encodeURIComponent(recipeUrl)}`)
    await speechPage.waitForLoadState('networkidle')
    await speechPage.waitForTimeout(1000)

    // Recipe ingredients should appear as shopping list items
    await expect(speechPage.locator('span.item-normal', { hasText: 'kananmuna' })).toBeVisible()
    await expect(speechPage.locator('span.item-normal', { hasText: 'sokeri' })).toBeVisible()
  })

  test('unknown recipe source handles error gracefully', async ({ speechPage }) => {
    // Mock /recipe endpoint to return a server error
    await speechPage.route('**/recipe**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Unsupported recipe source' })
      })
    })

    // Navigate first so localStorage is accessible, then clear state
    await speechPage.goto('/')
    await clearAppState(speechPage)

    const unsupportedUrl = 'https://www.example.com/recipe/123'
    await speechPage.goto(`/?url=${encodeURIComponent(unsupportedUrl)}`)
    await speechPage.waitForLoadState('networkidle')
    await speechPage.waitForTimeout(1000)

    // App should still be functional (error handled gracefully)
    await expect(speechPage.locator('button:has-text("Lisää")')).toBeVisible()
  })
})
