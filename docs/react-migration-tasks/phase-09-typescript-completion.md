# Phase 9: TypeScript Completion + Code Modernization

**Size:** Medium
**Prerequisites:** Phases 1–8
**Blocks:** None

## Overview

Convert all remaining .js/.jsx files to .ts/.tsx. Add proper TypeScript interfaces for all data types. Enable `strict: true` in tsconfig. Wrap app in `React.StrictMode`. Migrate unit tests from Jest to Vitest. Update ESLint to flat config with TypeScript support.

## Packages

### Remove
- `react-scripts` — if any residual dependency remains
- `react-test-renderer` — replaced by Testing Library (Phase 2)

### Add
- `vitest` — Vite-native test runner
- `@typescript-eslint/parser` — TypeScript ESLint parser
- `@typescript-eslint/eslint-plugin` — TypeScript ESLint rules
- `eslint` (latest) — if not already upgraded

## Files to Modify

| File | Change |
|---|---|
| All `src/**/*.js` | Rename to `.ts` |
| All `src/**/*.jsx` | Rename to `.tsx` |
| All `src/**/*.test.js` | Rename to `.test.ts` (or `.test.tsx` for files containing JSX), migrate from Jest to Vitest |
| `tsconfig.json` | Enable `strict: true` |
| `src/index.js` → `src/index.tsx` | Add `<React.StrictMode>` wrapper |
| `.eslintrc` → `eslint.config.js` | Flat config with @typescript-eslint |
| `vite.config.ts` | Add Vitest config |
| `package.json` | Update test scripts |

## Step-by-Step Tasks

### 1. Rename all source files

```
src/index.js → src/index.tsx
src/App.js → src/App.tsx
src/i18n.js → src/i18n.ts
src/store.ts (already .ts from Phase 5)
src/api/Analytics.ts (already .ts from Phase 7)
src/api/MarketCategories.js → src/api/MarketCategories.ts
src/api/SpeechRecognitionAPI.js → src/api/SpeechRecognitionAPI.ts
src/api/Share.js → src/api/Share.ts
src/api/Utils.js → src/api/Utils.ts
src/api/RecipeScrapeAPI.js → src/api/RecipeScrapeAPI.ts
src/components/Button/Button.jsx → src/components/Button/Button.tsx
src/components/InfoView/InfoView.jsx → src/components/InfoView/InfoView.tsx
src/components/SortableList/SortableList.jsx → src/components/SortableList/SortableList.tsx
src/components/HamburgerMenu/Menu.jsx → src/components/HamburgerMenu/Menu.tsx
src/components/index.js → src/components/index.ts
```

### 2. Add TypeScript interfaces

```ts
// src/types.ts
export interface ShoppingItem {
  name: string
  collected: boolean
  index: number
}

export interface CategoryData {
  order: number
  items: string[]
}

export interface AppState {
  shoppingItems: ShoppingItem[]
  listening: boolean
  isSpeechRecognitionSupported: boolean
  onBoardingCompleted: boolean
  isOnline: boolean
  sortAutomatically: boolean
}
```

### 3. Enable strict mode in tsconfig

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

Fix all resulting type errors across the codebase.

### 4. Add React.StrictMode

```tsx
// src/index.tsx
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path='/l/:id' element={<App />} />
        <Route path='/' element={<App />} />
      </Routes>
    </Router>
  </React.StrictMode>
)
```

Note: StrictMode double-invokes effects in development. Verify speech recognition and event listeners handle this correctly.

### 5. Migrate Jest → Vitest

**vite.config.ts** (add the `test` property to your existing config):
```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  // ... your existing Vite config (plugins, server, etc.)
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts'
  }
})
```

**Update test files:**
- Jest and Vitest APIs are nearly identical (`describe`, `it`, `expect`)
- Replace `jest.fn()` → `vi.fn()`
- Replace `jest.mock()` → `vi.mock()`
- Update import if needed: `import { describe, it, expect, vi } from 'vitest'`

**Update package.json:**
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "npx playwright test"
  }
}
```

### 6. Update ESLint to flat config

**Replace `.eslintrc` with `eslint.config.js`:**
```js
import js from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import reactPlugin from 'eslint-plugin-react'

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser
    },
    plugins: {
      '@typescript-eslint': tseslint,
      react: reactPlugin
    },
    rules: {
      semi: [2, 'never'],
      quotes: ['error', 'single'],
      'comma-dangle': ['error', 'never']
    }
  }
]
```

### 7. Remove prop-types usage

Remove all `import PropTypes from 'prop-types'` and `.propTypes = { ... }` blocks. TypeScript interfaces replace runtime prop validation.

## Risks

- **Strict mode type errors:** Enabling `strict: true` will surface many implicit `any` types. This may require significant effort to fix, especially in:
  - Speech recognition API (webkitSpeechRecognition types)
  - Redux-era callback signatures
  - Event handler types
- **React.StrictMode double-effects:** Speech recognition `startListening()` may fire twice in dev mode. Add cleanup logic if needed.
- **Vitest compatibility:** Most Jest tests port 1:1 but there can be edge cases with module mocking.
- **ESLint flat config:** Some plugin APIs may not support flat config yet. Check compatibility.

## Verification

- `npx tsc --noEmit` — no TypeScript errors
- `npm test` (Vitest) — all unit tests pass
- `npm run eslint` — no violations
- `npm run build` — production build succeeds
- `npm run test:e2e` — all 41 E2E tests pass
- Dev server shows no console errors (StrictMode warnings are acceptable)
