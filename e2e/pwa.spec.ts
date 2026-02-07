import { test, expect } from '@playwright/test'

test.describe('PWA', () => {
  test('manifest.json is accessible with correct fields', async ({ page }) => {
    const response = await page.goto('/manifest.json')
    expect(response?.status()).toBe(200)

    const manifest = await response?.json()

    expect(manifest.name).toBe('Juhani.mobi')
    expect(manifest.short_name).toBe('Juhani.mobi')
    expect(manifest.display).toBe('standalone')
    expect(manifest.start_url).toBe('/index.html')
    expect(manifest.background_color).toBe('#3E4EB8')
    expect(manifest.theme_color).toBe('#2F3BA2')

    // share_target config
    expect(manifest.share_target).toBeDefined()
    expect(manifest.share_target.action).toBe('/')
    expect(manifest.share_target.params).toEqual({
      title: 'title',
      text: 'text',
      url: 'url'
    })

    // Icons exist
    expect(manifest.icons.length).toBeGreaterThan(0)
  })

  test('HTML has manifest link and theme-color meta', async ({ page }) => {
    await page.goto('/')

    // Check for manifest link
    const manifestLink = page.locator('link[rel="manifest"]')
    await expect(manifestLink).toHaveAttribute('href', '/manifest.json')

    // Check for theme-color meta tag
    const themeColor = page.locator('meta[name="theme-color"]')
    await expect(themeColor).toHaveAttribute('content', '#000000')
  })
})
