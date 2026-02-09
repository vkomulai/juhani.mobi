# Migration Plan: Juhani.mobi Modernization

## Context
Juhani.mobi is a React 16.12 + Redux PWA built with CRA (react-scripts 2.1.3). Many core dependencies are deprecated (react-sortable-hoc, raven-js, react-ga, enzyme). The goal is to modernize the entire stack while keeping the app functional after each phase, using the existing 41 E2E Playwright tests as the safety net.

## User Choices
- **Build tool:** CRA → Vite
- **State management:** Redux → Zustand
- **Drag & drop:** react-sortable-hoc → @dnd-kit
- **TypeScript:** Yes, incrementally (allowJs:true from Phase 1)

## Output
Create `docs/migration-phases/` directory with 11 files:
- `README.md` — Overview, current vs target dependency table, phase dependency graph
- `phase-01-vite-typescript-setup.md`
- `phase-02-react-18.md`
- `phase-03-react-router-v6.md`
- `phase-04-i18n-modernization.md`
- `phase-05-zustand-migration.md`
- `phase-06-dnd-kit-migration.md`
- `phase-07-monitoring-upgrade.md`
- `phase-08-remaining-deps.md`
- `phase-09-typescript-completion.md`
- `phase-10-backend-modernization.md`

Each phase document includes: overview, packages to add/remove, files to modify, step-by-step tasks, risks, and verification criteria.

---

## Phase Summary

### Phase 1: CRA → Vite + TypeScript Foundation (Large)
- Remove react-scripts as build tool (replaced by Vite), remove cra-append-sw
- Add vite, @vitejs/plugin-react, vite-plugin-pwa, typescript
- Create vite.config.ts with src/ path alias (replaces NODE_PATH=src/)
- Create tsconfig.json with allowJs:true
- Move public/index.html → root index.html with module script tag
- Replace CRA service worker setup with vite-plugin-pwa
- Replace process.env.NODE_ENV with import.meta.env.MODE
- Update proxy config, package.json scripts, playwright webServer command

### Phase 2: React 16 → 18 (Medium)
- Upgrade react, react-dom to ^18
- Replace ReactDOM.render() with createRoot() in index.js
- Remove react-addons-css-transition-group (React 15 addon)
- Replace enzyme + enzyme-adapter-react-16 with @testing-library/react
- Rewrite App.test.js (only test using enzyme)
- Update react-test-renderer to ^18

### Phase 3: React Router v5 → v6 (Small)
- Upgrade react-router, react-router-dom to ^6
- Remove react-router-prop-types
- Replace `<Switch>` with `<Routes>`, `component=` with `element=`
- Replace withRouter HOC in SortableList with useParams() hook
- Files: src/index.js, src/components/SortableList/SortableList.jsx

### Phase 4: i18n Modernization (Small)
- Upgrade i18next, react-i18next to latest
- Replace withNamespaces() HOC with useTranslation() hook in 4 components
- Fix known bug: hardcoded Finnish offline text in InfoView.jsx (use i18n keys)
- Files: App.js, Button.jsx, InfoView.jsx, Menu.jsx, i18n.js

### Phase 5: Redux → Zustand (Large)
- Create Zustand store with persist middleware (localStorage key: 'juhani.mobi')
- Port all reducer logic and thunks to Zustand actions
- Replace connect() HOC with useStore() hook in all 6 containers
- Dissolve container/component separation — merge containers into components
- Handle localStorage format migration (redux-storage → Zustand persist)
- Remove: redux, react-redux, redux-thunk, redux-storage, redux-storage-engine-localstorage
- Remove: src/containers/ directory, src/reducers/
- Rewrite reducer unit tests as store tests
- Files: every container, every component, index.js, new store.ts

### Phase 6: react-sortable-hoc → @dnd-kit (Medium)
- Add @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
- Convert SortableList from class component to functional component
- Replace SortableContainer/SortableElement with DndContext/SortableContext/useSortable
- Configure touch sensor with 500ms activation delay
- Remove react-sortable-hoc
- Update drag-and-drop E2E test

### Phase 7: Monitoring & Analytics Upgrade (Medium)
- Replace raven-js with @sentry/react
- Replace react-ga (UA) with GA4 via gtag.js
- Fix known bugs: isProduction() call, process.envs typo
- Rewrite src/api/Analytics.js (→ .ts)

### Phase 8: Remaining Frontend Dependencies (Small)
- Upgrade fuse.js 3 → 7 (breaking API changes in constructor/search)
- Replace lodash _.unionBy() with native Set/filter
- Upgrade uuid 3 → latest
- Fix MarketCategories localhost detection bug
- Replace pre-commit with husky + lint-staged
- Upgrade stylelint 9 → latest
- Remove prop-types, classnames (if unused)

### Phase 9: TypeScript Completion + Code Modernization (Medium)
- Rename all remaining .js/.jsx to .ts/.tsx
- Add proper interfaces for ShoppingItem, store state, component props
- Enable strict: true in tsconfig.json
- Add React.StrictMode wrapper
- Migrate unit tests from Jest to Vitest
- Remove any residual react-scripts dependency (kept for unit tests until Vitest migration)
- Update ESLint to flat config with @typescript-eslint

### Phase 10: Backend API Modernization (Large, Independent)
- Upgrade Node 10 → 20 (update .nvmrc, serverless runtime)
- Upgrade TypeScript 2.9 → 5+
- Replace aws-sdk v2 with @aws-sdk/* v3 modular clients
- Upgrade Serverless Framework 1 → 3+
- Replace webpack with esbuild for Lambda bundling
- Update all backend dependencies

## Phase Dependencies
```
Phase 1 (Vite) → Phase 2 (React 18) → Phase 3 (Router v6)
                                     → Phase 4 (i18n)
                                     → Phase 5 (Zustand) → Phase 6 (@dnd-kit)
Phase 7 (Monitoring) depends on Phase 1
Phase 8 (Remaining) depends on Phase 1
Phase 9 (TS completion) depends on Phases 1-8
Phase 10 (Backend) is fully independent — can run in parallel with anything
```

## Verification (after each phase)
1. `npm run test:e2e` — all 41 Playwright tests pass
2. `npm test` — all unit tests pass
3. `npm run eslint` — no new violations
4. `npm run build` — production build succeeds
5. Manual: dev server starts, core flows work (add item via speech mock, toggle sort, share)
