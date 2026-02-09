# Phase 2: React 16 → 18

## Context
React 16.12 is EOL. Upgrading to React 18 unblocks Phases 3–5 (Router v6, i18n hooks, Zustand). Enzyme has no React 18 adapter, so tests must migrate to Testing Library. This phase keeps all other libraries (redux, router, i18n) unchanged.

## Steps

### 1. Upgrade React packages
```
npm install react@^18 react-dom@^18 --force
npm install --save-dev react-test-renderer@^18 --force
```

### 2. Migrate `src/index.js` to createRoot
- `import ReactDOM from 'react-dom'` → `import { createRoot } from 'react-dom/client'`
- `ReactDOM.render(<App />, el)` → `createRoot(el).render(<App />)`
- Everything else stays (Provider, Router, Switch, Routes)

### 3. Update `vite.config.js` — switch to automatic JSX runtime
- Remove `jsxRuntime: 'classic'` from react plugin (automatic is default)
- Change `jsx: 'transform'` → `jsx: 'automatic'` in esbuild transform plugin
- React 18 supports automatic runtime; existing `import React` statements are harmless

### 4. Remove deprecated packages
```
npm uninstall react-addons-css-transition-group enzyme enzyme-adapter-react-16 jest-enzyme
```
- `react-addons-css-transition-group` is unused (confirmed: not imported anywhere)
- `enzyme` + adapter + matchers: replaced by Testing Library

### 5. Install Testing Library
```
npm install --save-dev @testing-library/react@^14 @testing-library/jest-dom@^4 --force
```
- `@testing-library/react@14` — last version supporting React 18 (v15+ requires React 19)
- `@testing-library/jest-dom@4` — last version compatible with Jest 23 (react-scripts 2.x bundles Jest 23.6.0; jest-dom v5+ requires Jest ≥24)

### 6. Rewrite `src/setupTests.js`
Remove Enzyme, add Testing Library:
```js
import '@testing-library/jest-dom'

const localStorageMock = { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn(), clear: jest.fn() }
global.localStorage = localStorageMock
```

### 7. Rewrite `src/App.test.js`
Current test uses `shallow(<App />)`. Replace with Testing Library `render()`. The App component is wrapped in `withNamespaces()` HOC, so it needs i18n + Redux + Router context:
```js
import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { createStore } from 'redux'
import shoppingApp from 'reducers'
import { App } from './App.js'

it('renders without crashing', () => {
  const store = createStore(shoppingApp)
  render(
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  )
})
```

### 8. Remove `react-test-renderer` if unused
Check if anything imports it — if not, remove from devDependencies. (Enzyme used it internally; Testing Library does not.)

## Files modified
- `src/index.js` — createRoot migration (2 lines)
- `src/setupTests.js` — remove Enzyme, add Testing Library
- `src/App.test.js` — rewrite with Testing Library + providers
- `vite.config.js` — automatic JSX runtime
- `package.json` — dependency changes

## Files unchanged
- `src/reducers/index.test.js` — pure logic test, no Enzyme
- `src/api/MarketCategories.test.js` — pure logic test, no Enzyme
- `src/api/SpeechRecognitionAPI.test.js` — pure logic test, no Enzyme
- All component/container files — no code changes needed

## Expected warnings (not blockers)
- `react-sortable-hoc@0.6.7`: `findDOMNode` deprecation warning (fixed in Phase 6)
- `react-burger-menu@2.6.1`: may log deprecation warnings
- `react-redux@7.1.3`: may log lifecycle method warnings (replaced in Phase 5)

## Verification
1. `npm start` — app loads, default items visible, add/remove/reorder work
2. `npm run build` — production build succeeds
3. `npm test` — all unit tests pass (25 tests, 4 suites)
4. `npm run test:e2e` — all 41 E2E tests pass
5. `npm run eslint` — no new violations
