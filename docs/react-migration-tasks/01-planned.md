# Phase 1: CRA → Vite + TypeScript Foundation

## Context
CRA (react-scripts 2.1.3) is unmaintained and requires `NODE_OPTIONS=--openssl-legacy-provider` workaround. Migrating to Vite gives fast HMR, modern tooling, and unblocks all subsequent migration phases. This phase keeps all existing code working — no React/Redux/library changes.

## Steps

### 1. Install dependencies
```
npm install --save-dev vite @vitejs/plugin-react vite-plugin-pwa
```

### 2. Create `vite.config.js`
- `@vitejs/plugin-react` plugin
- `vite-plugin-pwa` with manifest from existing `public/manifest.json` + SKIP_WAITING behavior from `src/custom-sw.js`
- `resolve.alias`: map bare imports to `./src` (replaces `NODE_PATH=src/`)
- `server.port: 3000`, `server.proxy: { '/api': 'http://localhost:4000' }`
- `build.outDir: 'build'` (keeps `deploy-to-s3.sh` working)

### 3. Create `tsconfig.json`
- `allowJs: true`, `baseUrl: "./src"`, `jsx: "react-jsx"`, `strict: false`
- Path mapping `"*": ["./*"]` for bare imports

### 4. Move `public/index.html` → root `index.html`
- Remove `%PUBLIC_URL%` references (replace with `/`)
- Add `<script type="module" src="/src/index.js"></script>` before `</body>`
- Remove CRA HTML comments
- Keep external CSS links (Google Fonts, MUI CSS, index.css)

### 5. Fix `src/registerServiceWorker.js` — replace `process.env`
- `process.env.PUBLIC_URL` → `''`
- `process.env.NODE_ENV === 'production'` → `import.meta.env.PROD`

### 6. Fix `src/api/Analytics.js` — replace `process.env` (keep bugs)
- `process.envs.REACT_APP_SIMULATE_ANALYTICS_PRODUCTION` → `import.meta.envs.VITE_SIMULATE_ANALYTICS_PRODUCTION` (preserve the `.envs` typo — bug fix is Phase 7)

### 7. Update `package.json`
- Scripts: `start` → `vite`, `build` → `vite build`, `deploy` → `npm run build && ./deploy-to-s3.sh`
- Move `react-scripts` from dependencies to devDependencies (still needed for `test`/`test-ci`)
- Remove `cra-append-sw` from dependencies
- Remove `eject` script
- Keep `test`/`test-ci` using react-scripts for now

### 8. Update `playwright.config.ts`
- Remove `NODE_OPTIONS=--openssl-legacy-provider` from `webServer.command`

### 9. Clean up `.env`
- Remove `SKIP_PREFLIGHT_CHECK=true` (CRA-specific)

## Files created
- `vite.config.js`
- `tsconfig.json`
- `index.html` (root — moved from `public/index.html`)

## Files modified
- `package.json`
- `src/registerServiceWorker.js` (3 lines: process.env → import.meta.env)
- `src/api/Analytics.js` (1 line: process.envs → import.meta.envs, preserving typo)
- `playwright.config.ts` (webServer command)
- `.env`

## Files deleted
- `public/index.html` (moved to root)

## What stays unchanged
- All import paths (Vite alias handles bare imports)
- All React/Redux/router code
- All component files
- Unit test runner (react-scripts test)
- `deploy-to-s3.sh` (output dir stays `build/`)
- `src/custom-sw.js` (SKIP_WAITING logic moves into vite-plugin-pwa config)
- `.eslintrc` (babel-eslint comes from react-scripts devDep)

## Verification
1. `npm start` — dev server on :3000, app loads with default items
2. `npm run build` — produces `build/` directory
3. `npm test` — 25 unit tests pass
4. `npm run test:e2e` — 41 Playwright E2E tests pass
5. `npm run eslint` — no new violations
