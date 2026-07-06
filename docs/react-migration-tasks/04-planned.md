# Phase 3: React Router v5 → v6

## Context
Continuing the react-version-migration branch. Phase 2 (React 18) is done. This phase upgrades React Router from v5 to v6, affecting only 2 source files.

## Steps

### 1. Update packages
- `npm uninstall react-router-prop-types`
- `npm install react-router@6 react-router-dom@6`

### 2. Edit `src/index.js`
- Change import: `Switch` → `Routes`
- Change `<Switch>` → `<Routes>`
- Change `component={App}` → `element={<App />}`

### 3. Edit `src/components/SortableList/SortableList.jsx`
- SortableList is a class component wrapped with `withRouter` HOC and `SortableContainer` (via react-sortable-hoc)
- Since hooks can't be used in class components, create a wrapper functional component that calls `useParams()` and passes `id` as a prop
- Remove `withRouter` import and `react-router-prop-types` import
- Remove `match` from propTypes, add `listId` prop
- Change `componentDidMount` to use `this.props.listId` instead of `this.props.match.params.id`

### 4. Verify
- Run unit tests: `npm test`
- Run E2E tests: `npm run test:e2e`

## Files Modified
- `package.json` — dependency changes
- `src/index.js` — Router v6 syntax
- `src/components/SortableList/SortableList.jsx` — replace `withRouter` with wrapper using `useParams()`
