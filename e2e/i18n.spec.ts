import { test, expect, clearAppState } from './fixtures/test-fixtures'

test.describe('Internationalization', () => {
  test.beforeEach(async ({ speechPage }) => {
    await speechPage.goto('/')
    await speechPage.waitForLoadState('networkidle')
  })

  test('default Finnish text is shown', async ({ speechPage }) => {
    // Verify Finnish button labels
    await expect(speechPage.locator('button:has-text("Lisää")')).toBeVisible()
    await expect(speechPage.locator('button:has-text("Tyhjennä")')).toBeVisible()

    // Clear items to see the Juhani intro text
    const emptyButton = speechPage.locator('button:has-text("Tyhjennä")')
    if (await emptyButton.isEnabled()) {
      await emptyButton.click()
    }

    // Verify Finnish info text
    await expect(speechPage.locator('.info-text')).toContainText('Olen Juhani')
  })

  test('switch to English via menu', async ({ speechPage }) => {
    // Open settings menu
    await speechPage.click('.bm-burger-button')
    await speechPage.waitForSelector('.bm-menu')

    // Click language selector (second .item in menu)
    await speechPage.locator('.bm-menu .item').nth(1).click()

    // Close menu
    await speechPage.click('.bm-overlay', { force: true }).catch(() => {
      // If overlay click doesn't work, click elsewhere
      return speechPage.keyboard.press('Escape')
    })
    await speechPage.waitForTimeout(300)

    // Verify English button labels
    await expect(speechPage.locator('button:has-text("Add")')).toBeVisible()
    await expect(speechPage.locator('button:has-text("Empty")')).toBeVisible()
  })

  test('switch to English and back to Finnish', async ({ speechPage }) => {
    // Switch to English
    await speechPage.click('.bm-burger-button')
    await speechPage.waitForSelector('.bm-menu')
    await speechPage.locator('.bm-menu .item').nth(1).click()

    // Verify English
    await speechPage.waitForTimeout(200)
    await expect(speechPage.locator('button:has-text("Add")')).toBeVisible()

    // Switch back to Finnish
    await speechPage.locator('.bm-menu .item').nth(1).click()

    // Verify Finnish
    await speechPage.waitForTimeout(200)
    await expect(speechPage.locator('button:has-text("Lisää")')).toBeVisible()
    await expect(speechPage.locator('button:has-text("Tyhjennä")')).toBeVisible()
  })

  test('language does NOT persist across reload', async ({ speechPage }) => {
    // Switch to English
    await speechPage.click('.bm-burger-button')
    await speechPage.waitForSelector('.bm-menu')
    await speechPage.locator('.bm-menu .item').nth(1).click()
    await speechPage.waitForTimeout(200)

    // Verify English
    await expect(speechPage.locator('button:has-text("Add")')).toBeVisible()

    // Reload
    await speechPage.reload()
    await speechPage.waitForLoadState('networkidle')

    // Should be back to Finnish (language doesn't persist)
    await expect(speechPage.locator('button:has-text("Lisää")')).toBeVisible()
    await expect(speechPage.locator('button:has-text("Tyhjennä")')).toBeVisible()
  })
})
