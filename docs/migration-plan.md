# Plan: Functional Specs + Playwright E2E Tests for React Migration

## Context

Juhani.mobi is a ~1,500-line Finnish voice-driven shopping list PWA (React 16.12, Redux, CRA). Before migrating to modern React, we need to:
1. Document all current behavior as functional specs (safety net for correctness)
2. Add Playwright e2e tests (safety net for regressions)

The `react-version-migration` branch is ready with only a setup commit. No migration code exists yet.

---

## Phase 1: Functional Specs (10 files in `docs/specs/`)

Each spec follows this structure: **Overview → User-Facing Behavior → Key Source Files → Acceptance Criteria → Edge Cases**

### Files to create (in order):

**1. `docs/specs/01-shopping-list-management.md`**
- Adding items (via speech callback), viewing (capitalized, sortable list), marking collected (toggles, moves to end, strikethrough), removing (trash icon), clearing (Empty button, disabled when offline or empty), drag-and-drop reordering (500ms press delay)
- Key files: `src/containers/AddButton.js`, `src/containers/EmptyButton.js`, `src/containers/ShoppingList.js`, `src/components/SortableList/SortableList.jsx`, `src/reducers/index.js`, `src/actions/index.js`
- Document: item deduplication by name (`_.unionBy`), collected items reposition logic, `arrayMove` for drag reorder

**2. `docs/specs/02-speech-recognition.md`**
- `webkitSpeechRecognition` wrapper, Finnish tokenization, number map (yksi→1..puoli→1/2), unit map (gramma→g, kilo→kg, litra→l), descriptive words, adjective detection (ends with "inen"), known error corrections (skype→skyr), deduplication within utterance
- Key files: `src/api/SpeechRecognitionAPI.js`
- Document: full `tokenizeWords()` algorithm, `prependQuantityFromPrevious()` mutation (pops previous item), language codes (fi-FI, en-GB)

**3. `docs/specs/03-market-category-sorting.md`**
- 9 Finnish grocery categories with order values 1-9, Fuse.js fuzzy matching (threshold 0.3), automatic sort toggle, unknown items → order 99999
- Key files: `src/api/MarketCategories.js`, `src/api/CategoryData.json`
- Document: categories fetched from `/categories` endpoint in production, local `CategoryData.json` on localhost, unknown items reported to Sentry

**4. `docs/specs/04-sharing.md`**
- Share flow: UUID v1 → POST `/list/{id}` → `navigator.share()` with Finnish date format title. Load shared list via `/l/:id` route → GET `/list/{id}` → replaces shopping list
- Key files: `src/api/Share.js`, `src/containers/Header/Header.js`, `src/components/SortableList/SortableList.jsx` (componentDidMount), `api/src/routes.ts`
- Document: guards (empty list alert, missing navigator.share alert), share text format

**5. `docs/specs/05-recipe-scraping.md`**
- Web Share Target receives URLs, frontend extracts URL from query params, calls GET `/recipe?url=...`, backend scrapes with `scrape-it` (only kotikokki.net supported), results cached in DynamoDB Recipes table
- Key files: `src/api/RecipeScrapeAPI.js`, `src/actions/index.js` (listenToShareTargetEvent), `api/src/scraper.ts`, `api/src/routes.ts`

**6. `docs/specs/06-offline-mode.md`**
- Window online/offline event listeners, Redux `isOnline` state, pink info panel with hardcoded Finnish text (NOT i18n), Empty button disabled
- Key files: `src/actions/index.js`, `src/components/InfoView/InfoView.jsx:40-44`, `src/containers/EmptyButton.js`
- Document: offline text is hardcoded Finnish even when language is English (known bug/limitation)

**7. `docs/specs/07-pwa.md`**
- Manifest (standalone, share_target, icons), service worker (production only, CRA-generated + custom-sw.js for SKIP_WAITING), update detection on visibility change, auto-reload on SW update
- Key files: `public/manifest.json`, `src/registerServiceWorker.js`, `src/custom-sw.js`

**8. `docs/specs/08-i18n.md`**
- Finnish (default) and English, `withNamespaces()` HOC, all translation keys from `translations.json`, language toggle in menu, speech language follows UI language
- Key files: `src/i18n.js`, `src/translations.json`
- Document: language does NOT persist across reload (no i18next detection/storage plugin configured)

**9. `docs/specs/09-settings-menu.md`**
- Hamburger menu (react-burger-menu, 280px), sort toggle (default: on), language selector, version info (commit hash truncated to 6 chars + build date from versionInfo.json)
- Key files: `src/components/HamburgerMenu/Menu.jsx`, `src/containers/ApplicationMenu.js`

**10. `docs/specs/10-analytics-error-tracking.md`**
- Google Analytics (`UA-113979141-1`, react-ga), Sentry (raven-js), event names, production-only
- Key files: `src/api/Analytics.js`
- Document: known bug — `isProduction` checked as reference not function call (always truthy)

---

## Phase 2: Playwright E2E Tests

### Step 1: Setup

**Install (root directory):**
```bash
npm install -D @playwright/test
npx playwright install chromium
```

**Add scripts to `package.json`:**
```json
"test:e2e": "npx playwright test",
"test:e2e:ui": "npx playwright test --ui",
"test:e2e:headed": "npx playwright test --headed"
```

**Create `playwright.config.ts`** at project root:
- `testDir: './e2e'`
- `workers: 1` (serial — tests share localStorage and backend state)
- `baseURL: 'http://localhost:3000'`
- `webServer` entries for both frontend (`npm start`, port 3000, `BROWSER=none`) and API (`cd api && npm run start:local-api`, port 4000)
- Chromium-only project
- Note: Local DynamoDB (`port 8000`) needs to be started separately before tests (via `cd api && sls dynamodb install && npm run start:local-dynamodb`), or via a `globalSetup` script

**Known risk — Node version mismatch:** API requires Node 10.15 (`api/.nvmrc`). Playwright needs modern Node. May need `nvm exec` in the webServer command, or update the API's Node requirement as a prerequisite.

### Step 2: Project structure

```
e2e/
  fixtures/
    speech-mock.ts          # webkitSpeechRecognition mock injected via addInitScript
    test-fixtures.ts        # Extended test with speechPage fixture + clearState
  helpers/
    api-helpers.ts          # Seed/clean backend data via HTTP
  shopping-list.spec.ts
  speech-recognition.spec.ts
  category-sorting.spec.ts
  sharing.spec.ts
  offline-mode.spec.ts
  settings-menu.spec.ts
  i18n.spec.ts
  pwa.spec.ts
  recipe-scraping.spec.ts
  persistence.spec.ts
```

### Step 3: Speech API mock (`e2e/fixtures/speech-mock.ts`)

Inject via `page.addInitScript()` BEFORE app loads (must exist on `window` before `SpeechRecognitionAPI.js` evaluates `'webkitSpeechRecognition' in window`).

Mock class on `window.webkitSpeechRecognition`:
- `start()` → setTimeout → fires `onresult` with `window.__speechMockTranscript` → fires `onspeechend`
- Control from tests via `page.evaluate(() => { window.__speechMockTranscript = 'banaani maito' })`
- Error mode via `window.__speechMockShouldError = true`

### Step 4: Test helper (`e2e/helpers/api-helpers.ts`)

Functions for seeding/reading backend data:
- `seedListData(listId, items)` — POST to `http://localhost:4000/list/{id}`
- `getListData(listId)` — GET from `http://localhost:4000/list/{id}`

### Step 5: Test files (in implementation order)

**`e2e/persistence.spec.ts`** (start here — validates infrastructure works)
- Items persist across reload (add items → reload → verify)
- Sort toggle persists across reload
- State stored under localStorage key `juhani.mobi`
- Note: on localhost, empty localStorage → 4 default items (banaani, appelsiini, kiwi, kahvi)

**`e2e/shopping-list.spec.ts`** (core CRUD)
- Empty state shows "Olen Juhani" info text, Tyhjenna disabled
- Add items via mocked speech → items appear
- Mark collected → moves to end, strikethrough class `item-collected`
- Remove via trash icon `🗑` → item gone
- Clear all → empty list, button disabled again
- Duplicate items not added (same name)
- Drag-and-drop reorder (fragile — may need `test.fixme` initially due to 500ms pressDelay)

**`e2e/speech-recognition.spec.ts`**
- Listening state: green info panel with "Kuuntelen" text
- Quantity words: "yksi mansikka" → "1 mansikka"
- Compound: "puoli kiloa mansikoita" → "1/2 kiloa mansikoita"
- Adjective: "sveitsiläinen juustokeitto" → prepended
- Error correction: "skype" → "skyr"
- Speech error → no crash, empty result

**`e2e/category-sorting.spec.ts`**
- Sort enabled (default): items ordered by category (hevi < dairy < household)
- Sort disabled: insertion order preserved
- Unknown items sort to end

**`e2e/offline-mode.spec.ts`**
- Simulate offline via `page.context().setOffline(true)` + dispatch window `offline` event
- Pink info panel, Finnish offline text, Tyhjenna disabled
- Recovery on coming back online

**`e2e/settings-menu.spec.ts`**
- Hamburger opens side menu (`.bm-burger-button`)
- Sort toggle reflects state and toggles
- Version info shows 6-char commit hash + date

**`e2e/i18n.spec.ts`**
- Default Finnish text (Lisää, Tyhjennä, Olen Juhani)
- Switch to English via menu → text changes (Add, Empty, I'm Juhani)
- Switch back to Finnish
- Note: language does NOT persist across reload (document as known behavior)

**`e2e/pwa.spec.ts`**
- `/manifest.json` accessible with correct fields (name, display, share_target)
- HTML has `<link rel="manifest">` and `<meta name="theme-color">`

**`e2e/sharing.spec.ts`** (requires backend)
- Share icon click → list POSTed to backend → `navigator.share` called (mock it)
- Load shared list via `/l/:id` → items from backend replace current list
- Empty list share → alert shown
- Missing navigator.share → alert shown

**`e2e/recipe-scraping.spec.ts`** (requires backend + DynamoDB)
- Share target with recipe URL → ingredients loaded as items
- Pre-seed DynamoDB Recipes table to avoid external site dependency
- Unknown source → graceful error handling

---

## Verification

After implementation, verify by:
1. Each functional spec is reviewed against the actual source code it references
2. `npm run test:e2e` passes all tests with local backend running
3. `npm run test:e2e:headed` — visually confirm test interactions match spec descriptions
4. Existing unit tests still pass: `npm run test-ci`
5. Run `npm run eslint` and `npm run csslint` — no new violations

---

## Out of scope (for later)

- Actual React version migration (Phase 3 — planned separately after specs + tests are complete)
- Upgrading the API's Node version
- Fixing known bugs documented in specs (analytics isProduction bug, hardcoded offline text)
