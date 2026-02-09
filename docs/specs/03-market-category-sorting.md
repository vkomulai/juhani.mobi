# 03 — Market Category Sorting

## Overview

Items can be automatically sorted by grocery store aisle order. Nine Finnish market categories are defined with order values 1–9. Fuse.js fuzzy matching determines which category an item belongs to, and items are sorted accordingly.

## User-Facing Behavior

### Automatic Sorting

- Sorting is **enabled by default** (`SORT_AUTOMATICALLY_ENABLED = true`).
- When enabled, newly added items are sorted by category order after being merged into the list.
- Users can toggle sorting via the settings menu checkbox.

### Sort Order

Items are sorted by `getItemOrder(itemName)` which returns a numeric order value:

| Category | Finnish Name | Order |
|----------|-------------|-------|
| Produce | hevi | 1 |
| Breads | leivät | 2 |
| Meat & prepared | liha ja eines | 3 |
| Dairy | maitotuotteet | 4 |
| Dry goods | kuivatuotteet | 5 |
| Canned goods | säilykkeet | 6 |
| Beverages | juomat | 7 |
| Frozen | pakasteet | 8 |
| Household | taloustarvikkeet ja pesuaineet | 9 |

Unknown items get order `99999` and sort to the end.

### Fuzzy Matching

- Uses Fuse.js with `threshold: 0.3` (fairly strict matching).
- Searches the `items` array within each category.
- Returns the best match's `order` value, or `UNKNOWN_ITEM_ORDER` (99999) if no match.

### Category Data Source

- **Production**: Fetched from `GET /categories` API endpoint.
- **Localhost**: Uses local `CategoryData.json` file (hardcoded check `location == 'http://localhost/'`).
- Categories are loaded at module initialization time (`init()` called immediately).
- **Known bug**: The localhost check compares the full URL string `'http://localhost/'`, which does not match `'http://localhost:3000/'` used by the dev server. Fix: use `location.hostname === 'localhost'` instead. This means the dev server currently fetches from the API.

### Unknown Item Reporting

- After items are recognized, items with `UNKNOWN_ITEM_ORDER` are collected via `getItemsWithUnknownOrder()`.
- Unknown item names are reported to Sentry via `sendUnknownItems()`.

## Key Source Files

| File | Role |
|------|------|
| `src/api/MarketCategories.js` | Fuse.js setup, `getItemOrder()`, `getItemsWithUnknownOrder()` |
| `src/api/CategoryData.json` | Local category data with items per category |
| `src/reducers/index.js` | Sorts items in `ITEMS_LISTENED` handler when `sortAutomatically` is true |
| `src/actions/index.js` | `itemsRecognized()` thunk reads `sortAutomatically` from state |

## Acceptance Criteria

1. With sorting enabled, items appear in category order (hevi items before dairy items before household items).
2. With sorting disabled, items appear in insertion order.
3. Unknown items (not matching any category) appear at the end.
4. Toggling sort off and adding items preserves insertion order.
5. Category data loads successfully from the API (production) or local file (localhost).

## Edge Cases

- Fuse.js `fuzzy` is initialized asynchronously. If items are added before categories load, `fuzzy.search()` may throw or return no results. Expected behavior: `getItemOrder()` should return `UNKNOWN_ITEM_ORDER` (99999) when Fuse.js is not yet initialized, rather than throwing.
- The localhost check (`location == 'http://localhost/'`) does not match the dev server's `http://localhost:3000/`, causing the dev server to attempt the API fetch (see known bug above).
- Items matching multiple categories: Fuse.js returns the best match (lowest score); `_.get(match, '[0].item.order')` takes the first result.
- Empty category data (API error): `fetchCategoryData` catches errors and returns `[]`, meaning all items will be unknown order.
