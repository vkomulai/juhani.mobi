import { test, expect, clearAppState, addItemsViaSpeech } from './fixtures/test-fixtures'

test.describe('Shopping List', () => {
  test.beforeEach(async ({ speechPage }) => {
    await speechPage.goto('/')
    await clearAppState(speechPage)
    await speechPage.reload()
    await speechPage.waitForLoadState('networkidle')
  })

  test('empty state shows info text and disabled empty button', async ({ speechPage }) => {
    // On localhost, default items exist. Clear them first.
    // Click Tyhjennä to clear the default items
    const emptyButton = speechPage.locator('button:has-text("Tyhjennä")')
    if (await emptyButton.isEnabled()) {
      await emptyButton.click()
    }

    // Verify info text shows "Olen Juhani" message
    await expect(speechPage.locator('.info-text')).toContainText('Olen Juhani')

    // Verify Tyhjennä button is disabled when list is empty
    await expect(emptyButton).toBeDisabled()
  })

  test('add items via mocked speech', async ({ speechPage }) => {
    await addItemsViaSpeech(speechPage, 'maito leipä juusto')

    await expect(speechPage.locator('span.item-normal', { hasText: 'maito' })).toBeVisible()
    await expect(speechPage.locator('span.item-normal', { hasText: 'leipä' })).toBeVisible()
    await expect(speechPage.locator('span.item-normal', { hasText: 'juusto' })).toBeVisible()
  })

  test('mark item as collected moves to end with strikethrough', async ({ speechPage }) => {
    // Click on the first item to mark it collected
    const firstItem = speechPage.locator('.item-container').first()
    const firstItemName = await firstItem.locator('span').last().textContent()
    await firstItem.click()

    // Verify the item has strikethrough class
    await expect(speechPage.locator(`span.item-collected`, { hasText: firstItemName! })).toBeVisible()

    // Verify collected item is at the end of the list
    const lastItem = speechPage.locator('.items-container').last()
    await expect(lastItem.locator('span.item-collected')).toContainText(firstItemName!)
  })

  test('remove item via trash icon', async ({ speechPage }) => {
    // Get the first item's name
    const firstItemName = await speechPage.locator('span.item-normal').first().textContent()

    // Count items before removal
    const countBefore = await speechPage.locator('.items-container').count()

    // Click the trash icon (🗑) on the first item
    await speechPage.locator('.items-container').first().locator('span').last().click()

    // Verify item count decreased
    const countAfter = await speechPage.locator('.items-container').count()
    expect(countAfter).toBe(countBefore - 1)

    // Verify the removed item is no longer in the list
    if (firstItemName) {
      await expect(speechPage.locator(`span.item-normal`, { hasText: firstItemName })).toHaveCount(0)
    }
  })

  test('clear all items empties the list and disables button', async ({ speechPage }) => {
    // Verify items exist (default localhost items)
    await expect(speechPage.locator('.items-container').first()).toBeVisible()

    // Click Tyhjennä button
    await speechPage.locator('button:has-text("Tyhjennä")').click()

    // Verify list is empty
    await expect(speechPage.locator('.items-container')).toHaveCount(0)

    // Verify Tyhjennä button is disabled
    await expect(speechPage.locator('button:has-text("Tyhjennä")')).toBeDisabled()
  })

  test('duplicate items are not added', async ({ speechPage }) => {
    // Add banaani (which already exists as a default item)
    await addItemsViaSpeech(speechPage, 'banaani')

    // Count how many times 'banaani' appears
    const banaaniCount = await speechPage.locator('span', { hasText: /^banaani$/ }).count()
    expect(banaaniCount).toBe(1)
  })

  test('uncollecting an item moves it back among uncollected items', async ({ speechPage }) => {
    // Collect the first item
    const firstItem = speechPage.locator('.item-container').first()
    const itemName = await firstItem.locator('span').last().textContent()
    await firstItem.click()

    // Verify it's collected
    await expect(speechPage.locator(`span.item-collected`, { hasText: itemName! })).toBeVisible()

    // Click it again to uncollect
    await speechPage.locator(`.item-container:has(span.item-collected)`).first().click()

    // Verify it's back to normal
    await expect(speechPage.locator(`span.item-normal`, { hasText: itemName! })).toBeVisible()
  })

  test('drag and drop reorder', async ({ speechPage }) => {
    // @dnd-kit MouseSensor with delay: 500, tolerance: 5
    // Mouse must stay still for 500ms before drag activates.
    const itemSpans = speechPage.locator('span.item-normal')
    const initialNames = await itemSpans.allTextContents()
    expect(initialNames.length).toBeGreaterThanOrEqual(2)

    const firstName = initialNames[0]
    const secondName = initialNames[1]

    const firstBox = await itemSpans.first().boundingBox()
    const secondBox = await itemSpans.nth(1).boundingBox()
    expect(firstBox).not.toBeNull()
    expect(secondBox).not.toBeNull()

    // 1. Position mouse on first item
    await speechPage.mouse.move(
      firstBox!.x + firstBox!.width / 2,
      firstBox!.y + firstBox!.height / 2
    )

    // 2. Press and hold for 500ms activation delay
    await speechPage.mouse.down()
    await speechPage.waitForTimeout(600)

    // 3. Drag to second item position
    await speechPage.mouse.move(
      firstBox!.x + firstBox!.width / 2,
      secondBox!.y + secondBox!.height / 2,
      { steps: 10 }
    )

    // 4. Release
    await speechPage.mouse.up()
    await speechPage.waitForTimeout(300)

    // Verify items swapped
    const newNames = await itemSpans.allTextContents()
    expect(newNames[0]).toBe(secondName)
    expect(newNames[1]).toBe(firstName)
  })
})
