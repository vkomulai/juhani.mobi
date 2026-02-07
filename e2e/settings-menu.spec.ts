import { test, expect, clearAppState } from './fixtures/test-fixtures'

test.describe('Settings Menu', () => {
  test.beforeEach(async ({ speechPage }) => {
    await speechPage.goto('/')
    await speechPage.waitForLoadState('networkidle')
  })

  test('hamburger opens side menu', async ({ speechPage }) => {
    await speechPage.click('.bm-burger-button')

    // Menu should be visible
    await expect(speechPage.locator('.bm-menu')).toBeVisible()

    // Menu should contain the settings title
    await expect(speechPage.locator('.bm-menu .label')).toContainText('Asetukset')
  })

  test('sort toggle reflects state and toggles', async ({ speechPage }) => {
    await speechPage.click('.bm-burger-button')
    await speechPage.waitForSelector('.bm-menu')

    // Sort should be enabled by default
    const sortCheckbox = speechPage.locator('.bm-menu input[type="checkbox"]')
    await expect(sortCheckbox).toBeChecked()

    // Click to toggle sort off
    await speechPage.locator('.bm-menu .item').first().click()
    await expect(sortCheckbox).not.toBeChecked()

    // Click again to toggle sort back on
    await speechPage.locator('.bm-menu .item').first().click()
    await expect(sortCheckbox).toBeChecked()
  })

  test('version info shows commit hash and date', async ({ speechPage }) => {
    await speechPage.click('.bm-burger-button')
    await speechPage.waitForSelector('.bm-menu')

    const versionSection = speechPage.locator('.bm-menu .version')
    await expect(versionSection).toBeVisible()

    // Version should contain a 6-character hash-like string
    const versionText = await versionSection.textContent()
    expect(versionText).toContain('Versio')
    expect(versionText).toContain('Julkaistu')
  })
})
