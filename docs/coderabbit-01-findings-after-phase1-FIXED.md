# CodeRabbit Review — Fix Report

Fixes applied to markdown files from `docs/coderabbit-01-findings-after-phase1.md`.

## Summary

- **42 findings** total from CodeRabbit review
- **28 fixed** (all markdown-file findings)
- **14 skipped** (non-markdown files: `.ts`, `.js`, `.html`, `.txt`)

## Files Modified

| File | Findings Fixed |
|---|---|
| `docs/specs/01-shopping-list-management.md` | #17, #42 (4 items) |
| `docs/specs/02-speech-recognition.md` | #12, #16, #42 (1 item) |
| `docs/specs/03-market-category-sorting.md` | #8, #19 |
| `docs/specs/04-sharing.md` | #1, #15, #18 |
| `docs/specs/05-recipe-scraping.md` | #2, #9 |
| `docs/specs/06-offline-mode.md` | #42 (1 item) |
| `docs/specs/07-pwa.md` | #5, #13, #14 |
| `docs/specs/08-i18n.md` | #28, #29, #30 |
| `docs/specs/09-settings-menu.md` | #31 |
| `docs/migration-plan.md` | #3 |
| `docs/temp-plan.md` | #36 |
| `docs/react-migration-tasks/README.md` | #41 |
| `docs/react-migration-tasks/phase-01-vite-typescript-setup.md` | #33 |
| `docs/react-migration-tasks/phase-02b-react-19.md` | #39 |
| `docs/react-migration-tasks/phase-06-dnd-kit-migration.md` | #34, #41 |
| `docs/react-migration-tasks/phase-08-remaining-deps.md` | #35 |
| `docs/react-migration-tasks/phase-09-typescript-completion.md` | #38, #40 |

## Fixes by Category

### Typos and Translation Errors (4 findings)

| # | File | Fix |
|---|---|---|
| 28 | `08-i18n.md` | "Speechrecognition" → "Speech recognition" |
| 29 | `08-i18n.md` | English translation "Empty" → "Clear" for `buttons.clear` |
| 31 | `09-settings-menu.md` | Label "Sort Automatially" → "Sort Automatically" (key name typo noted) |
| 39 | `phase-02b-react-19.md` | Added "(available since React 17)" — automatic JSX runtime is not a React 19 feature |

### Known Bugs Documented (11 findings)

| # | File | Bug Documented |
|---|---|---|
| 1 | `04-sharing.md` | Race condition: share dialog opens before POST completes, recipient may get broken URL |
| 5 | `07-pwa.md` | WebKit-prefixed visibility API breaks on Firefox; fix: use standard `visibilitychange`/`document.hidden` |
| 8 | `03-market-category-sorting.md` | Localhost check `location == 'http://localhost/'` doesn't match `:3000`; fix: use `location.hostname` |
| 9 | `05-recipe-scraping.md` | `DOMContentLoaded` race condition; fix: check `document.readyState` |
| 12 | `02-speech-recognition.md` | `tokenizeWords("")` returns item with empty name instead of `[]` |
| 13 | `07-pwa.md` | Theme-color mismatch: HTML `#000000` vs manifest `#2F3BA2` |
| 15 | `04-sharing.md` | `ITEMS_LIST_LOADED` replaces list without confirmation — data loss risk |
| 18 | `04-sharing.md` | Alert references "Chrome 61 Android!!" (outdated since 2017) |
| 19 | `03-market-category-sorting.md` | Fuse.js async init: `getItemOrder()` should return 99999 when not initialized |
| 30 | `08-i18n.md` | Offline text hardcoded in Finnish, ignores i18n language setting |
| 14 | `07-pwa.md` | 1-second forced reload after SW update — UX concern noted |

### Security Notes Added (2 findings)

| # | File | Note |
|---|---|---|
| 2 | `05-recipe-scraping.md` | SSRF risk: no URL validation before scraping user-provided URLs |
| 3 | `migration-plan.md` | Node 10 EOL (April 2021) — security risk, referenced Phase 10 upgrade |

### Spec Clarifications (8 findings)

| # | File | Clarification |
|---|---|---|
| 16 | `02-speech-recognition.md` | Algorithm note: prepended item `"1/2 kiloa"` is no longer a raw quantity word |
| 17 | `01-shopping-list-management.md` | `index = state.length` is out-of-bounds but sorts to end as intended |
| 42a | `01-shopping-list-management.md` | Automatic sorting: added behavior description, toggle reference, default value |
| 42b | `01-shopping-list-management.md` | "capitalized as-is" → "displayed exactly as received from speech recognition" |
| 42c | `01-shopping-list-management.md` | Collect/uncollect: clarified `index` assignment and positioning logic |
| 42d | `01-shopping-list-management.md` | Removal by name: added note that all same-name items are removed |
| 42e | `02-speech-recognition.md` | `1/2` in descriptive words: clarified as mapped output, not speech input |
| 42f | `06-offline-mode.md` | "window.online" → "'online' and 'offline' events on the window object" |

### Migration Doc Fixes (7 findings)

| # | File | Fix |
|---|---|---|
| 33 | `phase-01-vite-typescript-setup.md` | Invalid `''` alias → comment explaining `nodepathPlugin` was used |
| 34 | `phase-06-dnd-kit-migration.md` | Added missing `import { useEffect } from 'react'` |
| 35 | `phase-08-remaining-deps.md` | Added shebang and husky helper sourcing to pre-commit hook |
| 36 | `temp-plan.md` | Clarified Phase 1 vs Phase 9 react-scripts removal |
| 38 | `phase-09-typescript-completion.md` | Clarified `.test.ts` vs `.test.tsx` for component tests |
| 40 | `phase-09-typescript-completion.md` | Added note to merge `test` config into existing `vite.config.ts` |
| 41 | `README.md` + `phase-06-dnd-kit-migration.md` | @dnd-kit independent of Zustand; updated dependency graph and prerequisites |

## Remaining (Non-Markdown) Findings

These 14 findings require changes to code, config, or test files:

| # | File | Type | Description |
|---|---|---|---|
| 6 | `playwright.config.ts` | config | Trace never captured (`on-first-retry` + `retries: 0`) |
| 7 | `src/registerServiceWorker.js` | code | Hardcoded `/service-worker.js` path |
| 10 | `e2e/speech-recognition.spec.ts` | test | `isEnabled()` throws if element missing |
| 11 | `e2e/persistence.spec.ts` | test | Wrong item selector (counts container, not items) |
| 20 | `e2e/i18n.spec.ts` | test | Unused `clearAppState` import |
| 21 | `e2e/i18n.spec.ts` | test | Flaky menu test (menu auto-closes, uses `waitForTimeout`) |
| 22 | `e2e/settings-menu.spec.ts` | test | Test name doesn't match assertions |
| 23 | `e2e/speech-recognition.spec.ts` | test | Loose regex assertion `/kiloa\|kg/` |
| 24 | `e2e/shopping-list.spec.ts` | test | Silent null pass on `textContent()` |
| 25 | `e2e/shopping-list.spec.ts` | test | Unverified precondition (assumes default items) |
| 26 | `e2e/offline-mode.spec.ts` | test | Dead conditional (button check never exercised) |
| 27 | `e2e/shopping-list.spec.ts` | test | Fragile selector + unsafe non-null assertion |
| 32 | `docs/migration-log.txt` | txt | Multiple typos (not a markdown file) |
| 37 | `index.html` | html | URL-encode space in Google Fonts link (`Exo 2` → `Exo+2`) |
