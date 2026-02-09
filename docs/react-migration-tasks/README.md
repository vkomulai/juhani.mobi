# React Migration Tasks

Juhani.mobi modernization from React 16 + CRA to React 18 + Vite + Zustand.

## Current Stack → Target Stack

| Category | Current | Target |
|---|---|---|
| Build tool | react-scripts 2.1.3 (CRA) | Vite + @vitejs/plugin-react |
| React | 16.12 | 18+ |
| State | Redux + redux-thunk + redux-storage | Zustand + persist middleware |
| Router | react-router v5 | react-router v6 |
| i18n | react-i18next v9 (withNamespaces HOC) | react-i18next v13+ (useTranslation hook) |
| Drag & drop | react-sortable-hoc | @dnd-kit |
| Monitoring | raven-js + react-ga (UA) | @sentry/react + GA4 gtag.js |
| Testing | Enzyme + Jest | @testing-library/react + Vitest |
| Language | JavaScript | TypeScript (incremental) |
| Backend runtime | Node 10 | Node 20 |

## Phase Dependency Graph

```
Phase 1 (Vite+TS) → Phase 2 (React 18) → Phase 3 (Router v6)
                                         → Phase 4 (i18n)
                                         → Phase 5 (Zustand) → Phase 6 (@dnd-kit) → Phase 2b (React 19)
Phase 1 → Phase 7 (Monitoring)
Phase 1 → Phase 8 (Remaining deps)
Phases 1–8, 2b → Phase 9 (TS completion)
Phase 10 (Backend) — independent, can run in parallel
```

## Verification (after each phase)

1. `npm run test:e2e` — all 41 Playwright tests pass
2. `npm test` — all unit tests pass
3. `npm run eslint` — no new violations
4. `npm run build` — production build succeeds
5. Manual: dev server starts, core flows work
