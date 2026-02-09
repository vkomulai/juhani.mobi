# CodeRabbit Review Findings — After Phase 1+2

Review run on `react-version-migration` branch after Phase 1 (CRA → Vite) and Phase 2 (React 16 → 18, Enzyme → Testing Library).

## Critical Issues

### 1. Race condition in sharing flow — FIXED (docs)
**File:** `docs/specs/04-sharing.md:68`
**Type:** potential_issue

Share dialog opens before backend POST completes. If POST fails, recipient gets a broken URL. The spec acknowledges that "shareList call happens independently of the POST completion."

**Recommendation:** Wait for POST to complete successfully before calling `navigator.share()`.

**Fix:** Documented as known bug in spec with explanation of the consequences.

### 2. SSRF vulnerability in recipe scraping — FIXED (docs)
**File:** `docs/specs/05-recipe-scraping.md:17-24`
**Type:** potential_issue

No URL validation or sanitization before scraping user-provided URLs. Could target internal services, cloud metadata endpoints (169.254.169.254), or localhost services.

**Recommendation:** Add URL validation (reject non-http(s), IP literals, private ranges), rate limiting, timeouts, and max URL length checks.

**Fix:** Added security note to spec documenting the risk and required mitigations.

### 3. Node 10.15 is EOL — FIXED (docs)
**File:** `docs/migration-plan.md:93`
**Type:** potential_issue

The API runs on Node 10 (EOL April 2021). Production security risk with unpatched vulnerabilities. The `nvm exec` workaround is temporary for local testing but doesn't address the production risk.

**Recommendation:** Upgrade the API to a maintained Node LTS version.

**Fix:** Added EOL date and security risk note to migration plan, with reference to Phase 10.

### 4. Analytics bugs documented but unfixed — no change needed
**File:** `docs/specs/10-analytics-error-tracking.md:39-60`
**Type:** potential_issue

- `isProduction` used as function reference (always truthy), not called as `isProduction()`
- `process.envs` typo (should be `process.env`)
- Sentry functions lacking production checks

Already well-documented as known bugs in the spec. Code fix deferred to Phase 7 (Monitoring upgrade).

### 5. WebKit-prefixed visibility API — FIXED (docs)
**File:** `docs/specs/07-pwa.md:34`
**Type:** potential_issue

Uses `webkitvisibilitychange`/`webkitHidden` instead of standard `visibilitychange`/`document.hidden`. Breaks on Firefox.

**Fix:** Added note about browser compatibility limitation and recommended fix in spec, marked as known bug in edge cases.

## Potential Issues

### 6. Playwright trace never captured
**File:** `playwright.config.ts:7`
**Type:** potential_issue — not a markdown file, skipped

`trace: 'on-first-retry'` with `retries: 0` means traces are never generated.

**Fix options:**
- Change `retries: process.env.CI ? 1 : 0`
- Or change `trace: 'retain-on-failure'`

### 7. Hardcoded service worker path
**File:** `src/registerServiceWorker.js:12`
**Type:** potential_issue — not a markdown file, skipped

`/service-worker.js` won't work for subpath deployments.

**Fix:** Use `${process.env.PUBLIC_URL || ''}/service-worker.js`

### 8. Localhost detection broken — FIXED (docs)
**File:** `docs/specs/03-market-category-sorting.md:42-44` / `src/api/MarketCategories.js:8`
**Type:** potential_issue

`location == 'http://localhost/'` doesn't match dev server at `:3000`.

**Fix:** Clarified as known bug in spec with recommended fix (`location.hostname === 'localhost'`). Code fix deferred to Phase 8.

### 9. DOMContentLoaded race condition — FIXED (docs)
**File:** `docs/specs/05-recipe-scraping.md:68`
**Type:** potential_issue

Share target handler may miss if `DOMContentLoaded` already fired.

**Fix:** Marked as known bug in spec with recommended `document.readyState` check.

### 10. `isEnabled()` throws if element missing
**File:** `e2e/speech-recognition.spec.ts:11-14`
**Type:** potential_issue — not a markdown file, skipped

If the "Tyhjenna" button is not in the DOM, `isEnabled()` throws.

**Fix:** Check `isVisible()` first or use `count()` to verify existence.

### 11. Wrong item selector in persistence test
**File:** `e2e/persistence.spec.ts:13-14`
**Type:** potential_issue — not a markdown file, skipped

`.items-container` counts the container element, not individual items inside it.

**Fix:** Use `.items-container .item-container` or similar child selector.

### 12. Empty transcript bug — FIXED (docs)
**File:** `docs/specs/02-speech-recognition.md:110-115`
**Type:** potential_issue

`tokenizeWords("")` returns `[{ name: "", collected: false }]` instead of `[]`.

**Fix:** Marked as known bug in spec.

### 13. Theme-color mismatch — FIXED (docs)
**File:** `docs/specs/07-pwa.md:64`
**Type:** potential_issue

HTML meta uses `#000000`, manifest uses `#2F3BA2`. Should be aligned.

**Fix:** Noted as known inconsistency in spec acceptance criteria.

### 14. Automatic reload UX — FIXED (docs)
**File:** `docs/specs/07-pwa.md:36`
**Type:** potential_issue

1-second forced page reload after SW update could interrupt users mid-interaction. Consider a toast notification instead.

**Fix:** Added UX concern note to spec.

### 15. Data loss on shared list load — FIXED (docs)
**File:** `docs/specs/04-sharing.md:31`
**Type:** potential_issue

`ITEMS_LIST_LOADED` replaces entire `shoppingItems` array without confirmation. User's current list is lost.

**Fix:** Added data loss warning note to spec.

### 16. Tokenizer algorithm inconsistency — FIXED (docs)
**File:** `docs/specs/02-speech-recognition.md:99-108`
**Type:** potential_issue

Algorithm description and acceptance criteria disagree on "puoli kiloa mansikoita" output. Algorithm produces `["kg mansikoita"]` but criteria expect `["1/2 kiloa mansikoita"]`.

**Fix:** Added clarifying note to acceptance criterion explaining that the prepended item `"1/2 kiloa"` is no longer a raw quantity word, so `mansikoita` is not affected.

### 17. Collect/uncollect index edge case — FIXED (docs)
**File:** `docs/specs/01-shopping-list-management.md:79`
**Type:** potential_issue

Collecting the last uncollected item sets `index = state.length` (out-of-bounds). May be a bug documented as a feature.

**Fix:** Clarified that while technically out-of-bounds, the item sorts to the end as intended.

### 18. Outdated browser reference in share alert — FIXED (docs)
**File:** `docs/specs/04-sharing.md:22`
**Type:** potential_issue

Alert mentions "Chrome 61 Android!!" (2017). Web Share API is now widely supported.

**Fix:** Added note to spec that the message is outdated.

### 19. Fuse.js async initialization edge case — FIXED (docs)
**File:** `docs/specs/03-market-category-sorting.md:70`
**Type:** potential_issue

`getItemOrder()` may throw if called before Fuse.js initialization completes. Expected behavior is undocumented.

**Fix:** Documented expected behavior: should return `UNKNOWN_ITEM_ORDER` (99999) when not initialized.

## Test Quality Issues

### 20. Unused import
**File:** `e2e/i18n.spec.ts:1` — not a markdown file, skipped

`clearAppState` imported but never used.

**Fix:** `import { test, expect } from './fixtures/test-fixtures'`

### 21. Flaky menu test
**File:** `e2e/i18n.spec.ts:44-61` — not a markdown file, skipped

After clicking language item, menu may auto-close. Second language switch needs menu reopened. Also uses `waitForTimeout` instead of auto-waiting assertions.

### 22. Test name mismatch
**File:** `e2e/settings-menu.spec.ts:36-47` — not a markdown file, skipped

Test named "shows commit hash and date" only checks label text ('Versio', 'Julkaistu'), not actual hash or date format.

### 23. Loose assertion in speech test
**File:** `e2e/speech-recognition.spec.ts:43-50` — not a markdown file, skipped

Regex `/kiloa|kg/` accepts multiple outcomes. Comments indicate uncertainty about expected behavior. Should assert exact output.

### 24. Silent null pass
**File:** `e2e/shopping-list.spec.ts:48-66` — not a markdown file, skipped

`firstItemName` from `textContent()` could be null, causing test to silently skip verification. Also uses brittle `locator('span').last()` for trash icon.

### 25. Unverified precondition
**File:** `e2e/shopping-list.spec.ts:82-89` — not a markdown file, skipped

"duplicate items are not added" test assumes "banaani" exists after `clearAppState`.

### 26. Dead conditional
**File:** `e2e/offline-mode.spec.ts:61-65` — not a markdown file, skipped

Button re-enablement assertion never exercised because no items are added and `.items-container` counts the container, not items.

### 27. Fragile selector and non-null assertion
**File:** `e2e/shopping-list.spec.ts:34-46` — not a markdown file, skipped

`.items-container` with `.last()` may select container rather than last item. Non-null assertion `firstItemName!` unsafe.

## Documentation Issues

### 28. Typo: "Speechrecognition" — FIXED
**File:** `docs/specs/08-i18n.md:36`

Changed to "Speech recognition" (two words).

### 29. Wrong translation: "Empty" should be "Clear" — FIXED
**File:** `docs/specs/08-i18n.md:24`

Changed English translation from "Empty" to "Clear".

### 30. Offline text ignores i18n — FIXED (docs)
**File:** `docs/specs/08-i18n.md:77` / `src/InfoView.jsx:40-44`

Marked as known bug with note about language inconsistency for non-Finnish speakers.

### 31. Typo: "Automatially" — FIXED
**File:** `docs/specs/09-settings-menu.md:22`

Changed label to "Sort Automatically" with note that the translation key still has the typo (existing app code).

### 32. Migration log typos
**File:** `docs/migration-log.txt:1-28` — not a markdown file, skipped

Multiple typos: "apesiclizes", "betteR?", "doesn start", "oldew node", "through the proble", "test:2e2".

### 33. Invalid alias in Vite config example — FIXED
**File:** `docs/react-migration-tasks/phase-01-vite-typescript-setup.md:55-59`

Replaced invalid empty-string alias with comment explaining that `nodepathPlugin` was used instead.

### 34. Missing `useEffect` import — FIXED
**File:** `docs/react-migration-tasks/phase-06-dnd-kit-migration.md:51-66`

Added `import { useEffect } from 'react'` to the example code.

### 35. Husky pre-commit format incomplete — FIXED
**File:** `docs/react-migration-tasks/phase-08-remaining-deps.md:130-134`

Added shebang line and husky helper sourcing line.

### 36. Duplicate react-scripts removal — FIXED
**File:** `docs/temp-plan.md:33, 103`

Phase 1: clarified as "Remove react-scripts as build tool". Phase 9: clarified as "Remove any residual react-scripts dependency (kept for unit tests until Vitest migration)".

### 37. URL-encode space in Google Fonts link
**File:** `index.html:9` — not a markdown file, skipped

`Exo 2` should be `Exo+2` or `Exo%202`.

### 38. Test file extension convention unclear — FIXED
**File:** `docs/react-migration-tasks/phase-09-typescript-completion.md:29`

Clarified: rename to `.test.ts` or `.test.tsx` for files containing JSX.

### 39. Automatic JSX runtime attribution — FIXED
**File:** `docs/react-migration-tasks/phase-02b-react-19.md:20`

Added "(available since React 17)" to clarify this is not a React 19 feature.

### 40. Vitest config should merge with existing Vite config — FIXED
**File:** `docs/react-migration-tasks/phase-09-typescript-completion.md:117-129`

Added note and comment showing the `test` property should be added to existing config.

### 41. @dnd-kit does not require Zustand — FIXED
**File:** `docs/react-migration-tasks/README.md:25`

Updated dependency graph to show Phase 6 (@dnd-kit) as independent of Phase 5 (Zustand). Also updated `phase-06-dnd-kit-migration.md` prerequisites.

### 42. Spec ambiguities — FIXED
- `docs/specs/01-shopping-list-management.md:14` — Added explanation of automatic sorting behavior and toggle.
- `docs/specs/01-shopping-list-management.md:16` — Changed "capitalized as-is" to "displayed exactly as received from speech recognition."
- `docs/specs/01-shopping-list-management.md:27-28` — Clarified collect/uncollect positioning logic with details on `index` assignment.
- `docs/specs/01-shopping-list-management.md:34` — Added note that removal by name affects all items with same name.
- `docs/specs/02-speech-recognition.md:69-71` — Clarified that "1/2" is a mapped output, not a speech input.
- `docs/specs/06-offline-mode.md:11` — Changed to "'online' and 'offline' events on the window object."
