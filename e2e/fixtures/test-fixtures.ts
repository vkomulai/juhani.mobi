import { test as base, Page } from '@playwright/test'
import { speechMockScript } from './speech-mock'

type TestFixtures = {
  speechPage: Page
}

/**
 * Extended test fixture that provides a page with the speech recognition mock
 * already injected. Use `speechPage` instead of `page` when testing speech features.
 */
export const test = base.extend<TestFixtures>({
  speechPage: async ({ page }, use) => {
    await page.addInitScript(speechMockScript)
    await use(page)
  }
})

export { expect } from '@playwright/test'

/**
 * Helper to set the speech mock transcript before triggering speech recognition.
 */
export async function setSpeechTranscript(page: Page, transcript: string) {
  await page.evaluate((t) => {
    (window as any).__speechMockTranscript = t
  }, transcript)
}

/**
 * Helper to enable speech error mode.
 */
export async function setSpeechError(page: Page, shouldError: boolean) {
  await page.evaluate((e) => {
    (window as any).__speechMockShouldError = e
  }, shouldError)
}

/**
 * Helper to clear localStorage state for a clean test.
 */
export async function clearAppState(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('juhani.mobi')
  })
}

/**
 * Helper to add items to the shopping list by triggering speech mock.
 * Navigates to the page if not already there, sets transcript, and clicks Add.
 */
export async function addItemsViaSpeech(page: Page, transcript: string) {
  await setSpeechTranscript(page, transcript)
  await page.click('button:has-text("Lisää")')
  // Wait for speech recognition mock to fire (100ms) + onspeechend (50ms) + React re-render
  await page.waitForTimeout(500)
}
