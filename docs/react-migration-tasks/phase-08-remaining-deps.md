# Phase 8: Remaining Frontend Dependencies

**Size:** Small
**Prerequisites:** Phase 1 (Vite)
**Blocks:** None

## Overview

Upgrade or replace remaining outdated frontend dependencies: fuse.js 3→7 (breaking API), lodash→native, uuid 3→latest, pre-commit→husky+lint-staged, stylelint 9→latest. Fix MarketCategories localhost detection bug. Remove unused packages.

## Packages

### Remove
- `lodash` — replaced with native JS in Phase 5 (if not already removed)
- `pre-commit` — replaced with husky
- `prop-types` — no longer needed with TypeScript
- `classnames` — verify if used, remove if not
- `codecov` — replace with modern coverage reporting
- `wtf_wikipedia` — devDependency, verify if used

### Upgrade
- `fuse.js` — ^3.3.0 → ^7 (breaking changes)
- `uuid` — ^3.3.3 → latest (import path change)
- `stylelint` — ^9.8.0 → latest
- `stylelint-config-standard` — ^18.2.0 → latest
- `react-burger-menu` — ^2.6.1 → latest (verify React 18 compat)

### Add
- `husky` — modern git hooks
- `lint-staged` — run linters on staged files

## Files to Modify

| File | Change |
|---|---|
| `src/api/MarketCategories.js` | Fix localhost bug, upgrade Fuse.js API |
| `src/containers/Header/Header.js` (or component after Phase 5) | Update uuid import |
| `package.json` | Update deps, replace pre-commit with husky+lint-staged |
| `.huskyrc` or `.husky/` | Create husky config |

## Step-by-Step Tasks

### 1. Upgrade Fuse.js 3 → 7

**Breaking API changes:**

**Before (v3):**
```js
import Fuse from 'fuse.js'
const options = {
  shouldSort: true,
  includeScore: true,
  threshold: 0.3,
  keys: ['items']
}
fuzzy = new Fuse(categories, options)
const match = fuzzy.search(item)
// Returns: [{ item: { order: 5, items: [...] }, score: 0.1 }]
_.get(match, '[0].item.order', UNKNOWN_ITEM_ORDER)
```

**After (v7):**
```js
import Fuse from 'fuse.js'
const options = {
  includeScore: true,
  threshold: 0.3,
  keys: ['items']
}
fuzzy = new Fuse(categories, options)
const match = fuzzy.search(item)
// Returns: [{ item: { order: 5, items: [...] }, score: 0.1, refIndex: 0 }]
match[0]?.item?.order ?? UNKNOWN_ITEM_ORDER
```

Note: Fuse.js v7 returns results in the same `{ item, score }` shape but some internal options changed. `shouldSort: true` is now the default. Verify the search results format.

### 2. Fix MarketCategories localhost detection bug

**Before (line 8):**
```js
if (location == 'http://localhost/') {
  return Promise.resolve(testData)
}
```

This never matches because CRA runs on `http://localhost:3000` and `location` is an object, not a string.

**After:**
```js
if (location.hostname === 'localhost') {
  return Promise.resolve(testData)
}
```

### 3. Update uuid import

**Before (v3):**
```js
import uuidv1 from 'uuid/v1'
```

**After (v9+):**
```js
import { v1 as uuidv1 } from 'uuid'
```

### 4. Replace pre-commit with husky + lint-staged

**Remove from package.json:**
```json
"pre-commit": ["eslint", "csslint", "test-ci"]
```

**Add husky:**
```bash
npx husky init
```

**Configure lint-staged in package.json:**
```json
{
  "lint-staged": {
    "src/**/*.{js,jsx,ts,tsx}": ["eslint --fix"],
    "src/**/*.css": ["stylelint --fix"]
  }
}
```

**Create `.husky/pre-commit`:**
```bash
npx lint-staged
npm run test-ci
```

### 5. Upgrade stylelint

```bash
npm install --save-dev stylelint@latest stylelint-config-standard@latest
```

Update `.stylelintrc` if config format changed.

### 6. Remove unused packages

Verify and remove:
- `prop-types` — will be replaced by TypeScript interfaces
- `classnames` — check if any component uses it
- `wtf_wikipedia` — check if used anywhere
- `codecov` — check if CI still uses it

## Risks

- **Fuse.js API change:** The search result format is similar but not identical between v3 and v7. Test fuzzy search thoroughly (add item "banaani" → check it gets sorted to correct category).
- **Pre-commit hook migration:** Ensure the new husky + lint-staged hooks run the same checks. Test by making a commit with a linting error.
- **stylelint config:** Major version bump may have new/changed rules. Run `npm run csslint` and fix any new violations.

## Verification

- Fuzzy search still categorizes items correctly (auto-sort by market aisle)
- On localhost, MarketCategories uses test data (fixed bug)
- UUID generation works for share list feature
- Pre-commit hooks run eslint, csslint on staged files
- All 41 E2E tests pass
- All unit tests pass
