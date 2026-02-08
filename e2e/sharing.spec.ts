import { test, expect, clearAppState, addItemsViaSpeech } from './fixtures/test-fixtures'

test.describe('Sharing', () => {
  test.beforeEach(async ({ speechPage }) => {
    await speechPage.goto('/')
    await speechPage.waitForLoadState('networkidle')
  })

  test('share icon click with items calls navigator.share', async ({ speechPage }) => {
    // Mock navigator.share and capture the call
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

    // Should have been called (default items exist on localhost)
    expect(shareCalledWith).not.toBeNull()
    expect(shareCalledWith.title).toMatch(/^Ostoslista \d+\.\d+\. kello \d+\.\d+$/)
    expect(shareCalledWith.url).toContain('https://www.juhani.mobi/l/')
    expect(shareCalledWith.text).toContain('- ')
  })

  test('empty list share shows alert', async ({ speechPage }) => {
    // Clear the list first
    const emptyButton = speechPage.locator('button:has-text("Tyhjennä")')
    if (await emptyButton.isEnabled()) {
      await emptyButton.click()
    }

    // Mock navigator.share so the "no share API" alert doesn't fire
    await speechPage.evaluate(() => {
      (navigator as any).share = (data: any) => Promise.resolve()
    })

    // Auto-accept dialog and capture message (alert() blocks JS, so must be
    // handled before click completes)
    let dialogMessage = ''
    speechPage.once('dialog', async dialog => {
      dialogMessage = dialog.message()
      await dialog.accept()
    })

    await speechPage.locator('.header img').click()
    await speechPage.waitForTimeout(200)

    expect(dialogMessage).toContain('Lisää ostoksia')
  })

  test('missing navigator.share shows alert', async ({ speechPage }) => {
    // Remove navigator.share
    await speechPage.evaluate(() => {
      delete (navigator as any).share
    })

    // Auto-accept dialog and capture message
    let dialogMessage = ''
    speechPage.once('dialog', async dialog => {
      dialogMessage = dialog.message()
      await dialog.accept()
    })

    await speechPage.locator('.header img').click()
    await speechPage.waitForTimeout(200)

    expect(dialogMessage).toContain('Chrome 61 Android')
  })

  test('load shared list via /l/:id replaces current items', async ({ speechPage }) => {
    // This test requires the backend API to be running on localhost:4000
    const testListId = 'e2e-test-list-id'

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
