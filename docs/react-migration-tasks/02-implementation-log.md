# Phase 2: React 16 → 18 — Implementation Log

## Changes made

### 1. `package.json` — Dependency changes
- Upgraded `react` and `react-dom` from `16.12.0` to `^18.3.1`
- Removed deprecated packages:
  - `react-addons-css-transition-group` (unused, not imported anywhere)
  - `enzyme`, `enzyme-adapter-react-16`, `jest-enzyme` (replaced by Testing Library)
  - `react-test-renderer` (only used internally by Enzyme, not imported in source)
- Added:
  - `@testing-library/react@^14.3.1` (v14 is last version supporting React 18; v15+ requires React 19)
  - `@testing-library/jest-dom@^4.2.4` (v4 is last version compatible with Jest 23 from react-scripts 2.x; v5+ requires Jest ≥24)

### 2. `src/index.js` — createRoot migration
```diff
-import ReactDOM from 'react-dom'
+import { createRoot } from 'react-dom/client'

-ReactDOM.render(
-  <Provider store={store}>...</Provider>,
-  document.getElementById('root')
-)
+createRoot(document.getElementById('root')).render(
+  <Provider store={store}>...</Provider>
+)
```

### 3. `vite.config.js` — Automatic JSX runtime
- Removed `jsxRuntime: 'classic'` from `@vitejs/plugin-react` config (automatic is default)
- Changed `jsx: 'transform'` → `jsx: 'automatic'` in esbuild transform plugin
- Existing `import React from 'react'` statements are harmless with automatic runtime

### 4. `src/setupTests.js` — Enzyme → Testing Library
```diff
-import { configure } from 'enzyme'
-import 'jest-enzyme'
-import Adapter from 'enzyme-adapter-react-16'
-
-configure({ adapter: new Adapter() })
+import '@testing-library/jest-dom'
```
localStorage mock kept unchanged.

### 5. `src/App.test.js` — Rewritten with Testing Library
- Replaced Enzyme `shallow(<App />)` with Testing Library `render()` wrapped in `<Provider>` + `<BrowserRouter>`
- App component uses `withNamespaces()` HOC requiring i18n context (initialized via side-effect import in App.js)
- Redux store created with `createStore(shoppingApp)` for the test

### 6. `docs/react-migration-tasks/phase-02b-react-19.md` — New phase doc
- Documents React 18→19 upgrade as Phase 2b
- Prerequisites: Phase 5 (Zustand replaces Redux) + Phase 6 (@dnd-kit replaces react-sortable-hoc)
- `react-sortable-hoc` uses `findDOMNode` which is removed in React 19
- `react-redux@7` doesn't support React 19

### 7. `docs/react-migration-tasks/README.md` — Updated dependency graph
- Added Phase 2b after Phase 6 in the dependency chain
- Updated Phase 9 prerequisites to include Phase 2b

## Files unchanged (as planned)
- `src/reducers/index.test.js` — pure logic test, no Enzyme
- `src/api/MarketCategories.test.js` — pure logic test, no Enzyme
- `src/api/SpeechRecognitionAPI.test.js` — pure logic test, no Enzyme
- All component/container source files — no code changes needed

## Verification results

| Check | Result |
|---|---|
| `npm test` | 25 passed, 4 suites |
| `npm run build` | Production build succeeds (612 kB JS, 2.1 kB CSS) |
| `npm run eslint` | No violations |
| `npm run test:e2e` | 41 passed |

## Expected warnings (not blockers)
Console warnings during unit tests from `react-sortable-hoc@0.6.7`:
- `findDOMNode` deprecation warning
- `childContextTypes` legacy context API warning
- `componentWillReceiveProps` renamed to `UNSAFE_componentWillReceiveProps`

All three are fixed in Phase 6 when react-sortable-hoc is replaced by @dnd-kit.
