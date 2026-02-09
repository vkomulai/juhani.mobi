# Phase 3: React Router v5 → v6 — Implementation Log

## Package Changes

```bash
npm uninstall react-router-prop-types --force
npm install react-router@6 react-router-dom@6 --force
```

- Removed `react-router-prop-types`
- Upgraded `react-router` 5.1.2 → 6, `react-router-dom` 5.1.2 → 6

## Source Changes

### `src/index.js`

- Import: `Switch` → `Routes`
- `<Switch>` → `<Routes>`
- `<Route component={App} />` → `<Route element={<App />} />`

### `src/components/SortableList/SortableList.jsx`

- Removed `withRouter` import from `react-router`
- Removed `ReactRouterPropTypes` import from `react-router-prop-types`
- Extracted class component as `SortableListInner` with `listId` prop (replacing `match.params.id`)
- Created functional `SortableList` wrapper that calls `useParams()` and passes `id` as `listId`
- `componentDidMount` simplified: `this.props.match.params && this.props.match.params.id` → `this.props.listId`

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

### E2E tests: 41/41 passed

```
41 passed (1.1m)
```

All 10 spec files green: category-sorting, i18n, offline-mode, persistence, pwa, recipe-scraping, settings-menu, sharing, shopping-list, speech-recognition.
