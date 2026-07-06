# Phase 4: i18n Modernization

**Size:** Small
**Prerequisites:** Phase 2 (React 18)
**Blocks:** None

## Overview

Upgrade i18next and react-i18next to latest versions. Replace deprecated `withNamespaces()` HOC with `useTranslation()` hook. Replace deprecated `reactI18nextModule` import with `initReactI18next`. Fix known bug: hardcoded Finnish offline text in InfoView.jsx.

## Packages

### Upgrade
- `i18next` — ^19.0.1 → latest
- `react-i18next` — ^9.0.10 → latest (v13+)

## Files to Modify

| File | Change |
|---|---|
| `src/i18n.js` | `reactI18nextModule` → `initReactI18next` |
| `src/App.js` | `withNamespaces()` HOC → `useTranslation()` hook |
| `src/components/Button/Button.jsx` | `withNamespaces()` → `useTranslation()` (if used) |
| `src/components/InfoView/InfoView.jsx` | Fix hardcoded Finnish offline text, use i18n keys |
| `src/components/HamburgerMenu/Menu.jsx` | `withNamespaces()` → `useTranslation()` (if used) |
| `src/translations.json` | Add missing keys for offline text |

## Step-by-Step Tasks

### 1. Upgrade packages
```bash
npm install i18next@latest react-i18next@latest
```

### 2. Update i18n.js initialization

**Before (v9):**
```js
import { reactI18nextModule } from 'react-i18next'
i18n.use(reactI18nextModule).init({ ... })
```

**After (v13+):**
```js
import { initReactI18next } from 'react-i18next'
i18n.use(initReactI18next).init({ ... })
```

### 3. Replace withNamespaces() in App.js

**Before:**
```js
import { withNamespaces } from 'react-i18next'
export const App = withNamespaces()(() => ( ... ))
```

**After:**
```js
export const App = () => ( ... )
```

Note: `App` doesn't actually use the `t` function — the `withNamespaces()` wrapper was likely added to trigger re-renders on language change for child components. With react-i18next v13+, the `I18nextProvider` or `useTranslation()` in child components handles this automatically.

### 4. Replace withNamespaces() in Button.jsx

**Before:**
```jsx
import { withNamespaces } from 'react-i18next'
const Button = withNamespaces()(({ t, enabled, onClick, labelKey }) => (
  <button onClick={onClick} disabled={!enabled}>{t(labelKey)}</button>
))
```

**After:**
```jsx
import { useTranslation } from 'react-i18next'
const Button = ({ enabled, onClick, labelKey }) => {
  const { t } = useTranslation()
  return <button onClick={onClick} disabled={!enabled}>{t(labelKey)}</button>
}
```

### 5. Fix hardcoded Finnish text in InfoView.jsx (bug fix)

**Current (lines 40-44):** Offline text is hardcoded in Finnish, ignoring i18n:
```jsx
{!isOnline && <p>Ei verkkoyhteyttä</p>}
```

**Fix:** Add translation keys and use `t()`:
```jsx
const { t } = useTranslation()
{!isOnline && <p>{t('info.offline')}</p>}
```

Add to `src/translations.json`:
```json
{
  "fi": { "translation": { "info.offline": "Ei verkkoyhteyttä" } },
  "en": { "translation": { "info.offline": "No network connection" } }
}
```

### 6. Update Menu.jsx similarly

Replace any `withNamespaces()` usage with `useTranslation()` hook.

## Risks

- **react-i18next v13 requires React 16.8+:** We'll be on React 18 by this point, so no issue.
- **Suspense:** react-i18next v13 uses React Suspense by default. Set `react: { useSuspense: false }` in i18n init options if this causes issues with existing code.
- **Bundle size:** Latest i18next is slightly larger but the difference is negligible.

## Verification

- App renders with Finnish text in all views
- Button labels display correctly via i18n keys
- Offline text shows translated string (not hardcoded Finnish)
- All 41 E2E tests pass
- All unit tests pass
