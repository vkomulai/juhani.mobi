# Phase 3: React Router v5 → v6 — Implementation Log

## Package Changes

```bash
npm uninstall react-router-prop-types --force
npm install react-router@6 react-router-dom@6 --force
```

- Removed `react-router-prop-types` (1.0.5)
- Upgraded `react-router` 5.3.4 → 6.30.3
- Upgraded `react-router-dom` 5.3.4 → 6.30.3
- New transitive dep: `@remix-run/router` 1.23.2
- Removed transitive deps: `history`, `path-to-regexp`, `tiny-invariant`, `tiny-warning`, `resolve-pathname`, `value-equal`

## Source Changes

### `src/index.js`

- Import: `Switch` → `Routes`
- `<Switch>` → `<Routes>`
- `<Route component={App} />` → `<Route element={<App />} />`

### `src/components/SortableList/SortableList.jsx`

- Removed `import { withRouter } from 'react-router'`
- Removed `import ReactRouterPropTypes from 'react-router-prop-types'`
- Added `import { useParams } from 'react-router-dom'`
- Extracted class component as `SortableListInner` with `listId` prop (replacing `match.params.id`)
- Created functional `SortableList` wrapper that calls `useParams()` and passes `id` as `listId`
- `componentDidMount` simplified: `this.props.match.params && this.props.match.params.id` → `this.props.listId`

## Files Changed

- `package.json` — dependency changes
- `package-lock.json` — lockfile updated
- `yarn.lock` — lockfile updated
- `src/index.js` — Router v6 syntax
- `src/components/SortableList/SortableList.jsx` — replace `withRouter` with `useParams()` wrapper

## Commit

```
9145107 Upgrade React Router v5 → v6 (Phase 3)
```

## Pre-commit Hook Output

ESLint, CSS lint, and unit tests all passed during commit.

## Test Results

### Unit tests: 25/25 passed

```
PASS src/App.test.js
PASS src/api/MarketCategories.test.js
PASS src/reducers/index.test.js
PASS src/api/SpeechRecognitionAPI.test.js

Test Suites: 4 passed, 4 total
Tests:       25 passed, 25 total
```

Console warnings (pre-existing, from react-sortable-hoc — not related to this phase):
- `sortableList` uses legacy `childContextTypes` API
- `sortableElement` uses legacy `contextTypes` API
- `componentWillReceiveProps` renamed warning for `sortableElement`
- `findDOMNode` deprecated warning

New console warnings from React Router v6:
- `v7_startTransition` future flag warning
- `v7_relativeSplatPath` future flag warning

### E2E tests: 41/41 passed

```
Running 41 tests using 1 worker
41 passed (1.1m)
```

All 10 spec files green: category-sorting, i18n, offline-mode, persistence, pwa, recipe-scraping, settings-menu, sharing, shopping-list, speech-recognition.
