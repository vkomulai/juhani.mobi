# 09 — Settings Menu

## Overview

A hamburger menu provides access to application settings: automatic sorting toggle, language selector, and version information.

## User-Facing Behavior

### Menu Open/Close

- A hamburger icon (`.bm-burger-button`, provided by `react-burger-menu`) is displayed in the top-left area.
- Clicking the hamburger opens a slide-in side menu from the left, 280px wide.
- The menu can be closed by clicking outside it or using the close button.

### Menu Contents

The menu displays (top to bottom):

1. **Title**: "Asetukset" (Finnish) / "Settings" (English) — translated via `t('settings.title')`.

2. **Sort Toggle**:
   - A row with a checkbox and label "Järjestä automaattisesti" / "Sort Automatically".
   - **Note**: The translation key `settings.sortAutomatially` has a typo (missing 'c') — this is the existing key name in the app code.
   - Checkbox reflects `sortAutomatically` Redux state.
   - Clicking the row dispatches `SORT_CHANGED`, which toggles `sortAutomatically` (boolean flip via `!state`).
   - Default: enabled (`true`).

3. **Language Selector**:
   - Shows current language code (e.g., `FI`) and text "Vaihda kieli (EN)" / "Change language (FI)".
   - Clicking calls `i18n.changeLanguage()` to toggle between `fi` and `en`.

4. **Version Info**:
   - Shows commit hash (truncated to 6 characters) and build date.
   - Format: `"Versio: {hash}\nJulkaistu: {date}"`.
   - Data sourced from `versionInfo.json` (generated during build).

### Sort Toggle Behavior

- When **enabled**: Items added via speech are sorted by market category.
- When **disabled**: Items are appended in recognition order.
- The toggle state persists via `redux-storage` to localStorage.

## Key Source Files

| File | Role |
|------|------|
| `src/components/HamburgerMenu/Menu.jsx` | Menu UI with sort toggle, language selector, version info |
| `src/containers/ApplicationMenu.js` | Redux connection: reads `sortAutomatically`, dispatches `SORT_CHANGED` |
| `src/actions/index.js` | `sortAutomaticallyChanged()` action creator |
| `src/reducers/index.js` | `sortAutomatically` reducer (toggles boolean) |

## Acceptance Criteria

1. Hamburger icon is visible and clickable.
2. Clicking hamburger opens a 280px side menu.
3. Sort toggle checkbox reflects current sort state.
4. Clicking sort toggle changes sorting behavior.
5. Language selector shows current language and switches to the other.
6. Version info shows a 6-character commit hash and build date.
7. Sort preference persists across page reload (via localStorage).

## Edge Cases

- `versionInfo.json` may not exist in development (only generated during build) — this could cause a module not found error.
- The checkbox is `readOnly` with the click handler on the parent `div`, so clicking the checkbox directly also triggers the toggle via event bubbling.
- Sort toggle applies only to newly added items; existing items are not re-sorted when toggling.
