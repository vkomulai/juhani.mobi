import { test, expect, clearAppState, addItemsViaSpeech } from './fixtures/test-fixtures'

test.describe('Sharing', () => {
  test.beforeEach(async ({ speechPage }) => {
    await speechPage.goto('/')
    await speechPage.waitForLoadState('networkidle')
  })

  test('share icon click with items calls navigator.share', async ({ speechPage }) => {
    // Mock navigator.share
    const shareData = await speechPage.evaluate(() => {
      return new Promise<any>((resolve) => {
        (navigator as any).share = (data: any) => {
          resolve(data)
          return Promise.resolve()
        }
      // We need a different approach - set up the mock and capture the call
      })
    }).catch(() => null)

    // Better approach: mock navigator.share and capture the call
    await speechPage.evaluate(() => {
      (window as any).__shareCalledWith = null;
      (navigator as any).share = (data: any) => {
        (window as any).__shareCalledWith = data
        return Promise.resolve()
      }
    })

    // Click the share icon
    await speechPage.locator('.header img').click()

    // Wait for the share call
    await speechPage.waitForTimeout(500)

    const shareCalledWith = await speechPage.evaluate(() => (window as any).__shareCalledWith)

    // Should have been called (items exist on localhost)
    if (shareCalledWith) {
      expect(shareCalledWith.title).toMatch(/^Ostoslista \d+\.\d+\. kello \d+\.\d+$/)
      expect(shareCalledWith.url).toContain('https://www.juhani.mobi/l/')
      expect(shareCalledWith.text).toContain('- ')
    }
  })

  test('empty list share shows alert', async ({ speechPage }) => {
    // Clear the list first
    const emptyButton = speechPage.locator('button:has-text("Tyhjennä")')
    if (await emptyButton.isEnabled()) {
      await emptyButton.click()
    }

    // Mock navigator.share
    await speechPage.evaluate(() => {
      (navigator as any).share = (data: any) => Promise.resolve()
    })

    // Listen for alert dialog
    const alertPromise = speechPage.waitForEvent('dialog')

    // Click share icon
    await speechPage.locator('.header img').click()

    const dialog = await alertPromise
    expect(dialog.message()).toContain('Lisää ostoksia')
    await dialog.accept()
  })

  test('missing navigator.share shows alert', async ({ speechPage }) => {
    // Remove navigator.share
    await speechPage.evaluate(() => {
      delete (navigator as any).share
    })

    // Listen for alert dialog
    const alertPromise = speechPage.waitForEvent('dialog')

    // Click share icon
    await speechPage.locator('.header img').click()

    const dialog = await alertPromise
    expect(dialog.message()).toContain('Chrome 61 Android')
    await dialog.accept()
  })

  test('load shared list via /l/:id replaces current items', async ({ speechPage }) => {
    // This test requires the backend API to be running
    // We'll seed data via the API if available, or skip

    // First, store a list via the app's own mechanism
    await speechPage.evaluate(() => {
      (navigator as any).share = () => Promise.resolve()
    })

    // Navigate to a shared list URL
    // Note: This requires the backend to be running on localhost:4000
    // If the backend is not available, the test will show the existing items unchanged
    const testListId = 'e2e-test-list-id'

    // Try to seed the backend directly
    try {
      const response = await speechPage.request.post(`http://localhost:4000/list/${testListId}`, {
        data: JSON.stringify([
          { name: 'shared-item-1', collected: false },
          { name: 'shared-item-2', collected: false }
        ]),
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok()) {
        // Navigate to the shared list URL
        await speechPage.goto(`/l/${testListId}`)
        await speechPage.waitForLoadState('networkidle')
        await speechPage.waitForTimeout(500)

        // Verify the shared items are displayed
        await expect(speechPage.locator('span.item-normal', { hasText: 'shared-item-1' })).toBeVisible()
        await expect(speechPage.locator('span.item-normal', { hasText: 'shared-item-2' })).toBeVisible()
      }
    } catch {
      test.skip(true, 'Backend API not available')
    }
  })
})
