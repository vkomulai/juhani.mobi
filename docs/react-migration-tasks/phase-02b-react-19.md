# Phase 2b: React 18 → 19

## Prerequisites

- **Phase 5 (Zustand)** — `react-redux@7` doesn't support React 19; Phase 5 eliminates Redux entirely
- **Phase 6 (@dnd-kit)** — `react-sortable-hoc` uses `findDOMNode` which is *removed* in React 19 (not just deprecated)

## Why this can't happen earlier

React 19 removes `findDOMNode` from `react-dom`. `react-sortable-hoc` calls `findDOMNode` internally — this would break drag-and-drop completely. Phase 6 replaces it with `@dnd-kit`.

`react-redux@7.1.3` doesn't support React 19. Upgrading to react-redux v9 requires redux v5, but Phase 5 replaces Redux with Zustand entirely, making the redux upgrade unnecessary.

## Scope

1. Upgrade `react` and `react-dom` from ^18 to ^19
2. Upgrade `@testing-library/react` from ^14 to ^16 (v15+ requires React 19)
3. Upgrade `react-i18next` if needed for React 19 compatibility
4. Remove any remaining React 18 compatibility shims
5. Remove unused `import React from 'react'` statements (automatic JSX runtime)

## Expected changes

### Package upgrades
```
npm install react@^19 react-dom@^19
npm install --save-dev @testing-library/react@^16
```

### Code changes
- Remove `React.StrictMode` warnings if any were suppressed
- Address any breaking changes from React 19 changelog
- Update `@vitejs/plugin-react` if needed for React 19 support

## Verification

1. `npm start` — app loads, all features work
2. `npm run build` — production build succeeds
3. `npm test` — all unit tests pass
4. `npm run test:e2e` — all E2E tests pass
5. `npm run eslint` — no new violations
