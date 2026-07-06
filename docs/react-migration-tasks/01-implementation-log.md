# Phase 1: CRA → Vite + TypeScript Foundation — Implementation Log

## Date: 2026-02-09

## Steps Executed

### 1. Install dependencies
```
npm install --save-dev vite @vitejs/plugin-react vite-plugin-pwa --force
npm install --save-dev typescript --force
```
- Vite 7.3.1, @vitejs/plugin-react 5.1.3, vite-plugin-pwa 1.2.0 installed
- TypeScript 5.9.3 added (required because react-scripts detects `tsconfig.json` and demands it)

### 2. Created `vite.config.js`
Three custom plugins plus standard ones:

- **`nodepathPlugin`** — Custom Vite plugin that replaces `NODE_PATH=src/`. Resolves bare imports (e.g. `import { App } from 'App'`) by checking `src/` directory with extensions `.js`, `.jsx`, `.ts`, `.tsx`, `.json` and `index.*` fallback.
- **`treat-js-files-as-jsx`** — `enforce: 'pre'` plugin using `transformWithEsbuild` with `loader: 'jsx'` and `jsx: 'transform'`. Required because Vite/Rollup doesn't parse JSX in `.js` files by default.
- **`react({ jsxRuntime: 'classic' })`** — React 16 doesn't have `react/jsx-runtime`, so classic mode (`React.createElement`) is required.
- **`VitePWA`** — `registerType: 'prompt'`, `injectRegister: null`, workbox config, manifest with icons from original `public/manifest.json`.

Additional config:
- `define`: Maps `process.env.PUBLIC_URL` → `''` and `process.envs` → `undefined` (see deviation #1 below)
- `optimizeDeps.esbuildOptions.loader`: `{ '.js': 'jsx' }` for dependency pre-bundling
- `server.port: 3000`, `server.proxy: { '/api': 'http://localhost:4000' }`
- `build.outDir: 'build'` (keeps `deploy-to-s3.sh` working)

### 3. Created `tsconfig.json`
Initial config with `baseUrl: "./src"` and `paths: { "*": ["./*"] }`, but react-scripts auto-modifies it on first test run to:
- Remove `baseUrl` and `paths` (not supported by react-scripts)
- Force `moduleResolution: "node"` and `jsx: "preserve"`
- Add `lib: ["dom", "dom.iterable", "esnext"]` and `allowSyntheticDefaultImports: true`

This is acceptable since Vite's `nodepathPlugin` handles bare import resolution independently of tsconfig.

### 4. Moved `public/index.html` → root `index.html`
- Removed `%PUBLIC_URL%` references (replaced with `/`)
- Added `<script type="module" src="/src/index.js"></script>` before `</body>`
- Removed CRA HTML comments
- Kept external CSS links (Google Fonts, MUI CSS, index.css)
- Deleted `public/index.html`

### 5. Source file changes (`process.env`)

**`src/registerServiceWorker.js`:**
- Line 12: `process.env.PUBLIC_URL` in swUrl template literal → hardcoded `'/service-worker.js'`
- Line 25: Kept `process.env.NODE_ENV === 'production'` (Vite replaces this via built-in define)
- Line 27: `process.env.PUBLIC_URL` → `process.env.PUBLIC_URL || ''` (Vite define provides `''`)

**`src/api/Analytics.js`:**
- No changes. Kept `process.envs.REACT_APP_SIMULATE_ANALYTICS_PRODUCTION` (preserving `.envs` typo bug). Vite `define` maps `process.envs` → `undefined` so it won't crash at runtime.

### 6. Updated `package.json`
- Scripts: `start` → `vite`, `build` → `vite build`, `deploy` → `./deploy-to-s3.sh`
- Removed `eject` script
- Moved `react-scripts` from dependencies to devDependencies
- Removed `cra-append-sw` from dependencies
- Removed `proxy` field (Vite handles via `server.proxy`)
- Added `overrides: { "cheerio": "1.0.0-rc.12" }` (see deviation #2)
- Test scripts unchanged (still use `react-scripts test`)

### 7. Updated `playwright.config.ts`
- `webServer.command`: Removed `NODE_OPTIONS=--openssl-legacy-provider` prefix

### 8. `.env` file
- Kept `SKIP_PREFLIGHT_CHECK=true` (still needed for react-scripts test runner with Vite's babel-loader in node_modules)

### 9. `deploy-to-s3.sh`
- No changes needed. The script already calls `npm run build` internally and handles versionInfo file. The `deploy` package.json script just calls `./deploy-to-s3.sh` directly.

## Deviations from Plan

### 1. `process.env` kept instead of `import.meta.env`
**Reason:** The old Jest bundled with react-scripts 2.x cannot parse `import.meta` syntax at all — it throws `SyntaxError: Cannot use 'import.meta' outside a module`. Since unit tests still run via react-scripts, all source files must be parseable by the old Babel/Jest pipeline.

**Solution:** Keep `process.env` in source code. Vite's `define` option replaces `process.env.PUBLIC_URL` → `''` and `process.envs` → `undefined` at build/serve time. Vite already replaces `process.env.NODE_ENV` automatically.

### 2. Added cheerio override to `1.0.0-rc.12`
**Reason:** Running `npm install --force` (needed for peer dep conflicts) caused npm to resolve `cheerio@1.2.0`, which depends on `parse5-parser-stream@7.1.2` that uses `node:stream` imports. The old Jest from react-scripts 2.x cannot resolve `node:`-prefixed imports, causing all 4 test suites to fail with `Cannot find module 'node:stream'`.

**Solution:** Added `"overrides": { "cheerio": "1.0.0-rc.12" }` to package.json to pin cheerio to a version without the `node:stream` dependency.

### 3. JSX-in-JS transform plugin required
**Reason:** Vite/Rollup production builds failed with `Expression expected` on JSX syntax in `.js` files. The `@vitejs/plugin-react` plugin doesn't transform `.js` files early enough — Rollup's parser runs first and chokes on JSX.

**Solution:** Added a custom `enforce: 'pre'` plugin that calls `transformWithEsbuild(code, id, { loader: 'jsx', jsx: 'transform' })` for all files matching `src/.*\.js$`. This runs before Rollup's parser.

### 4. `SKIP_PREFLIGHT_CHECK=true` kept in `.env`
**Reason:** Plan said to remove it, but react-scripts still requires it because Vite installed a different version of `babel-loader` (8.4.1) than what react-scripts expects (8.0.5).

### 5. `Analytics.js` not changed
**Reason:** Plan said to change `process.envs` → `import.meta.envs`, but since we kept `process.env` (deviation #1), the Analytics.js line stays unchanged. The Vite `define` option handles `process.envs` → `undefined` at build time.

### 6. react-scripts auto-modified `tsconfig.json`
**Reason:** react-scripts detects tsconfig.json and forces its own compiler options. It removes `baseUrl` and `paths`, changes `moduleResolution` to `"node"` and `jsx` to `"preserve"`. This happens on every `react-scripts test` run.

**Impact:** None. Vite's `nodepathPlugin` handles bare import resolution independently of tsconfig settings.

## Verification Results

| Check | Result |
|---|---|
| `npm start` (dev server on :3000) | Works, HTML served with Vite injections |
| `npm run build` (production build) | 559 modules transformed, built in 954ms, output in `build/` |
| `npm test` (25 unit tests) | 4 suites, 25 tests, all passing |
| `npm run test:e2e` (41 Playwright tests) | 41 passed (1.3m) |
| `npm run eslint` | Only pre-existing `no-unused-vars` on `AddButton.js:14` |

## Files Created
- `vite.config.js`
- `tsconfig.json`
- `index.html` (root)
- `src/react-app-env.d.ts` (auto-generated by react-scripts)

## Files Modified
- `package.json`
- `package-lock.json`
- `src/registerServiceWorker.js` (lines 12, 27)
- `playwright.config.ts` (webServer command)
- `.env` (kept SKIP_PREFLIGHT_CHECK)

## Files Deleted
- `public/index.html` (moved to root)

## Build Output
```
vite v7.3.1 building client environment for production...
✓ 559 modules transformed.
build/manifest.webmanifest                   0.71 kB
build/index.html                             0.96 kB │ gzip:   0.49 kB
build/assets/robot-waiting-CMm6UEzH.png     12.17 kB
build/assets/robot-listening-B0TUZPPW.png   34.86 kB
build/assets/shareIcon-D2mZYm2r.png         47.85 kB
build/assets/index-C7DKzoRM.css              2.15 kB │ gzip:   0.83 kB
build/assets/index-D692bD78.js             600.44 kB │ gzip: 201.49 kB
✓ built in 954ms

PWA v1.2.0
mode      generateSW
precache  11 entries (589.57 KiB)
files generated
  build/sw.js
  build/workbox-77c2ac8b.js
```

## Key Learnings

### 1. What was easy

- **Moving `index.html` to root** — Straightforward mechanical change. Remove `%PUBLIC_URL%`, add the module script tag, delete the old file. No surprises.
- **Updating `package.json` scripts** — Swapping `react-scripts start/build` for `vite/vite build` was trivial. Moving `react-scripts` to devDependencies and removing `cra-append-sw` was clean.
- **`vite-plugin-pwa` setup** — The PWA plugin accepted the manifest config directly and generated the service worker without issues. The `registerType: 'prompt'` + `injectRegister: null` combo correctly replaced the old `cra-append-sw` + `custom-sw.js` approach.
- **Playwright config** — Removing `NODE_OPTIONS=--openssl-legacy-provider` was a one-line change. Vite doesn't need it, and the E2E tests didn't care about the build tool switch at all — they just hit the running server.
- **The `nodepathPlugin`** — Writing a custom resolve plugin for bare imports was straightforward. The logic is simple (check if file exists in `src/` with various extensions), and it replaced `NODE_PATH=src/` perfectly for all 16 unique bare import paths.

### 2. What was hard

- **JSX in `.js` files** — This was the most painful issue. Vite's production build uses Rollup, which parses files before plugins transform them. The `@vitejs/plugin-react` plugin wasn't transforming `.js` files early enough. It took 5 build attempts and web research to land on the `enforce: 'pre'` plugin with `transformWithEsbuild`. The error message (`Expression expected`) was clear, but the fix wasn't obvious — you'd expect the React plugin to handle this out of the box.
- **Keeping two build systems happy simultaneously** — The core tension of this phase: Vite for dev/build, react-scripts for tests. Every change had to work in both worlds. `import.meta.env` works in Vite but breaks Jest. `process.env` works in Jest but needs Vite `define` mappings. The `tsconfig.json` gets rewritten by react-scripts on every test run. This dual-system constraint drove most of the complexity.
- **React 16's classic JSX runtime** — The `jsx: 'automatic'` default (used by the esbuild transform) inserts `import { jsx } from 'react/jsx-runtime'`, which doesn't exist in React 16. Had to use `jsx: 'transform'` (classic mode) and `jsxRuntime: 'classic'` on the React plugin. This was a quick fix once diagnosed, but the error (`Rollup failed to resolve import "react/jsx-runtime"`) could easily mislead you into thinking it's a missing package rather than a config issue.

### 3. What didn't go as planned

- **The `import.meta.env` strategy had to be abandoned entirely.** The plan called for replacing `process.env.NODE_ENV` → `import.meta.env.PROD` and `process.envs` → `import.meta.envs` in source files. This was impossible because react-scripts' Jest/Babel pipeline can't parse `import.meta` at all. The fix (Vite `define` for `process.env.*`) is arguably cleaner anyway — zero source changes needed for env vars.
- **`SKIP_PREFLIGHT_CHECK=true` couldn't be removed.** The plan assumed Vite would eliminate the need for it, but react-scripts still runs its preflight check for tests, and Vite's `babel-loader` (8.4.1) conflicts with what react-scripts expects (8.0.5).
- **cheerio broke all unit tests.** `npm install --force` (needed for peer dep conflicts) silently upgraded cheerio from a compatible version to 1.2.0, which pulls in `parse5-parser-stream` using `node:stream` imports. The old Jest can't resolve `node:` prefixed imports. This was completely unrelated to the migration itself — a transitive dependency landmine triggered by the install.
- **`tsconfig.json` gets hijacked by react-scripts.** The carefully crafted config with `baseUrl` and `paths` was immediately overwritten. This turned out to be fine (Vite doesn't use tsconfig for resolution), but it was unexpected and required understanding that the two tools use the file for different purposes.

### 4. What I would do differently next time

- **Run unit tests immediately after `npm install`, before any code changes.** The cheerio breakage was caused by the initial dependency install, not by any migration work. Catching it early would have saved debugging time and made it clear the fix (cheerio override) was a prerequisite, not a consequence.
- **Start with a "does JSX in .js work?" smoke test.** Before wiring up PWA, proxies, and everything else, just try to build a single JSX-in-JS file with Vite. The JSX transform issue was the fundamental blocker, and discovering it with a minimal config would have been faster than debugging it through layers of plugins.
- **Accept `process.env` from the start when react-scripts coexists.** The plan to use `import.meta.env` was doomed as long as react-scripts runs the test suite. Future phases should either migrate tests away from react-scripts first, or keep `process.env` with Vite `define` mappings.
- **Pin transitive dependencies preemptively.** Add the cheerio override *before* running `npm install --force`, based on knowing that enzyme + old Jest + `--force` is a fragile combination. The memory file already documented this issue — it should have been addressed in the plan.
- **Don't plan to remove `.env` contents until react-scripts is fully gone.** The `SKIP_PREFLIGHT_CHECK` removal was premature. Any config that exists for react-scripts compatibility should stay until react-scripts itself is removed (likely when migrating tests to Vitest in a future phase).
