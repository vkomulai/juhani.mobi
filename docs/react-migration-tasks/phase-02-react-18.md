# Phase 2: React 16 → 18

**Size:** Medium
**Prerequisites:** Phase 1 (Vite)
**Blocks:** Phases 3, 4, 5

## Overview

Upgrade React and ReactDOM from 16.12 to 18+. Migrate from `ReactDOM.render()` to `createRoot()`. Remove deprecated `react-addons-css-transition-group` (React 15 addon, unused). Replace Enzyme with @testing-library/react since Enzyme has no React 18 adapter.

## Packages

### Remove
- `react-addons-css-transition-group` — React 15 transition addon (unused in codebase)
- `enzyme` — no React 18 adapter exists
- `enzyme-adapter-react-16` — adapter for Enzyme + React 16
- `jest-enzyme` — Enzyme matchers for Jest

### Upgrade
- `react` — 16.12 → ^18
- `react-dom` — 16.12 → ^18
- `react-test-renderer` — ^16.7 → ^18

### Add
- `@testing-library/react` — React Testing Library
- `@testing-library/jest-dom` — DOM matchers
- `@testing-library/user-event` — user interaction simulation

## Files to Modify

| File | Change |
|---|---|
| `src/index.js` | `ReactDOM.render()` → `createRoot().render()` |
| `src/setupTests.js` | Remove Enzyme config, add Testing Library setup |
| `src/App.test.js` | Rewrite from Enzyme to Testing Library |
| `package.json` | Update deps |

## Step-by-Step Tasks

### 1. Upgrade React packages
```bash
npm install react@^18 react-dom@^18
npm install --save-dev react-test-renderer@^18
```

### 2. Migrate index.js to createRoot

**Before (React 16):**
```js
import ReactDOM from 'react-dom'
ReactDOM.render(
  <Provider store={store}>
    <Router>
      <Switch>
        <Route path='/l/:id' component={App} />
        <Route path='/' component={App} />
      </Switch>
    </Router>
  </Provider>,
  document.getElementById('root')
)
```

**After (React 18):**
```js
import { createRoot } from 'react-dom/client'
const root = createRoot(document.getElementById('root'))
root.render(
  <Provider store={store}>
    <Router>
      <Switch>
        <Route path='/l/:id' component={App} />
        <Route path='/' component={App} />
      </Switch>
    </Router>
  </Provider>
)
```

### 3. Remove deprecated packages
```bash
npm uninstall react-addons-css-transition-group enzyme enzyme-adapter-react-16 jest-enzyme
```

### 4. Update setupTests.js

**Before:**
```js
import { configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
configure({ adapter: new Adapter() })
```

**After:**
```js
import '@testing-library/jest-dom'
```

### 5. Rewrite App.test.js

Current test uses Enzyme's `shallow()`. Rewrite with `render()` from Testing Library:
```js
import { render, screen } from '@testing-library/react'
import { App } from 'App'
// Test that App renders without crashing
```

Note: App uses `withNamespaces()` HOC, so test may need i18n provider or mock.

### 6. Verify other tests still pass

The other 3 test suites (reducers, MarketCategories, SpeechRecognitionAPI) are pure unit tests that don't use Enzyme or React rendering — they should pass without changes.

## Risks

- **react-redux compatibility:** `react-redux@7.1.3` supports React 18 but may show console warnings about deprecated lifecycle methods. Consider upgrading to react-redux 8+ (but this will be replaced by Zustand in Phase 5 anyway).
- **react-sortable-hoc + React 18:** May show `findDOMNode` deprecation warnings. These are cosmetic and will be fixed in Phase 6 when we migrate to @dnd-kit.
- **react-burger-menu + React 18:** Verify it renders correctly. May need minor version bump.
- **Concurrent features:** Do NOT enable `<StrictMode>` yet — it causes double-renders that may break speech recognition and other side effects. Defer to Phase 9.

## Verification

- `npm start` — app loads without console errors (deprecation warnings are OK)
- `npm test` — all 25 unit tests pass (including rewritten App.test.js)
- `npm run test:e2e` — all 41 E2E tests pass
- No runtime errors in shopping list add/remove/reorder flows
