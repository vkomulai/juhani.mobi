import { test, expect, clearAppState } from './fixtures/test-fixtures'

test.describe('Offline Mode', () => {
  test.beforeEach(async ({ speechPage }) => {
    await speechPage.goto('/')
    await speechPage.waitForLoadState('networkidle')
  })

  test('offline shows pink info panel with Finnish text', async ({ speechPage }) => {
    // Simulate going offline
    await speechPage.context().setOffline(true)
    // Dispatch the window offline event to trigger the Redux state change
    await speechPage.evaluate(() => {
      window.dispatchEvent(new Event('offline'))
    })

    // Verify pink panel (speech-not-supported class) is shown
    await expect(speechPage.locator('.info-area.speech-not-supported')).toBeVisible()

    // Verify hardcoded Finnish offline text
    await expect(speechPage.locator('.info-text')).toContainText('Selaimesi offline-tilassa!')
    await expect(speechPage.locator('.info-text')).toContainText('Puheentunnistus ei toimi')

    // Restore online
    await speechPage.context().setOffline(false)
  })

  test('Tyhjennä button disabled when offline', async ({ speechPage }) => {
    // Go offline
    await speechPage.context().setOffline(true)
    await speechPage.evaluate(() => {
      window.dispatchEvent(new Event('offline'))
    })

    // Verify Tyhjennä button is disabled
    await expect(speechPage.locator('button:has-text("Tyhjennä")')).toBeDisabled()

    // Restore online
    await speechPage.context().setOffline(false)
  })

  test('recovery on coming back online', async ({ speechPage }) => {
    // Go offline
    await speechPage.context().setOffline(true)
    await speechPage.evaluate(() => {
      window.dispatchEvent(new Event('offline'))
    })

    // Verify offline state
    await expect(speechPage.locator('.info-area.speech-not-supported')).toBeVisible()

    // Come back online
    await speechPage.context().setOffline(false)
    await speechPage.evaluate(() => {
      window.dispatchEvent(new Event('online'))
    })

    // Verify the offline panel is gone
    await expect(speechPage.locator('.info-area.speech-not-supported')).not.toBeVisible()

    // Verify Tyhjennä button is re-enabled (if items exist)
    const itemCount = await speechPage.locator('.items-container').count()
    if (itemCount > 0) {
      await expect(speechPage.locator('button:has-text("Tyhjennä")')).toBeEnabled()
    }
  })
})
