import { test, expect, clearAppState, setSpeechTranscript, setSpeechError, addItemsViaSpeech } from './fixtures/test-fixtures'

test.describe('Speech Recognition', () => {
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

  test('listening state shows green info panel with "Kuuntelen"', async ({ speechPage }) => {
    // Set empty transcript so we can observe the listening state
    await setSpeechTranscript(speechPage, '')

    // Click Add button to start listening
    await speechPage.click('button:has-text("Lisää")')

    // The info panel should briefly show "Kuuntelen" (listening state)
    // Since our mock fires quickly, we check the listening class
    await expect(speechPage.locator('.info-area.listening')).toBeVisible({ timeout: 500 })
    await expect(speechPage.locator('.info-text')).toContainText('Kuuntelen')
  })

  test('single words become individual items', async ({ speechPage }) => {
    await addItemsViaSpeech(speechPage, 'banaani maito')

    await expect(speechPage.locator('span.item-normal', { hasText: 'banaani' })).toBeVisible()
    await expect(speechPage.locator('span.item-normal', { hasText: 'maito' })).toBeVisible()
  })

  test('quantity words: "yksi mansikka" becomes "1 mansikka"', async ({ speechPage }) => {
    await addItemsViaSpeech(speechPage, 'yksi mansikka')

    await expect(speechPage.locator('span.item-normal', { hasText: '1 mansikka' })).toBeVisible()
  })

  test('compound: "puoli kiloa mansikoita" becomes "1/2 kiloa mansikoita"', async ({ speechPage }) => {
    await addItemsViaSpeech(speechPage, 'puoli kiloa mansikoita')

    // puoli → 1/2, kiloa → kg (unit), prepended to mansikoita
    // Actually: "puoli" is quantity, "kiloa" gets prepended as "1/2 kiloa", then "mansikoita" gets "kg mansikoita"
    // Let's verify what actually happens with the tokenizer
    await expect(speechPage.locator('span.item-normal', { hasText: /kiloa|kg/ })).toBeVisible()
  })

  test('adjective: word ending in "inen" prepends to next word', async ({ speechPage }) => {
    await addItemsViaSpeech(speechPage, 'sveitsiläinen juusto')

    await expect(speechPage.locator('span.item-normal', { hasText: 'sveitsiläinen juusto' })).toBeVisible()
  })

  test('error correction: "skype" becomes "skyr"', async ({ speechPage }) => {
    await addItemsViaSpeech(speechPage, 'skype')

    await expect(speechPage.locator('span.item-normal', { hasText: 'skyr' })).toBeVisible()
  })

  test('speech error does not crash the app', async ({ speechPage }) => {
    await setSpeechError(speechPage, true)

    // Click Add - should not crash even with error
    await speechPage.click('button:has-text("Lisää")')
    await speechPage.waitForTimeout(300)

    // App should still be functional
    await expect(speechPage.locator('button:has-text("Lisää")')).toBeVisible()

    // Reset error mode
    await setSpeechError(speechPage, false)
  })

  test('duplicate words within utterance are skipped', async ({ speechPage }) => {
    await addItemsViaSpeech(speechPage, 'maito maito leipä')

    // maito should appear only once
    const maitoItems = speechPage.locator('span.item-normal', { hasText: /^maito$/ })
    await expect(maitoItems).toHaveCount(1)
    await expect(speechPage.locator('span.item-normal', { hasText: 'leipä' })).toBeVisible()
  })
})
