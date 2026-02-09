# Phase 1: CRA → Vite + TypeScript Foundation

**Size:** Large
**Prerequisites:** None
**Blocks:** Phases 2, 7, 8

## Overview

Replace Create React App (react-scripts 2.1.3) with Vite. Add TypeScript with `allowJs: true` so existing .js/.jsx files continue to work and new files can be written in TS. Replace `NODE_PATH=src/` bare imports with Vite path alias.

## Packages

### Remove
- `react-scripts` — CRA build tooling
- `cra-append-sw` — CRA service worker appender
- `babel-eslint` — deprecated ESLint parser (CRA dependency)

### Add
- `vite` — build tool
- `@vitejs/plugin-react` — React fast refresh + JSX transform
- `vite-plugin-pwa` — service worker + PWA manifest generation
- `typescript` — TypeScript compiler
- `@types/react` — React type definitions
- `@types/react-dom` — ReactDOM type definitions

## Files to Modify

| File | Change |
|---|---|
| `package.json` | Replace scripts, swap deps |
| `public/index.html` → `index.html` | Move to root, add `<script type="module" src="/src/index.js">` |
| **New:** `vite.config.ts` | Create with path alias `src/` → `@/` or resolve to `./src` |
| **New:** `tsconfig.json` | Create with `allowJs: true`, `jsx: react-jsx`, path aliases |
| `src/index.js` | No CRA-specific imports |
| `src/registerServiceWorker.js` | Replace with vite-plugin-pwa registration |
| `src/custom-sw.js` | Integrate into vite-plugin-pwa config |
| `playwright.config.ts` | Update `webServer.command` (remove `NODE_OPTIONS=--openssl-legacy-provider`) |
| `.eslintrc` | Replace `babel-eslint` parser |
| All source files | Replace `process.env.NODE_ENV` → `import.meta.env.MODE`, `process.env.REACT_APP_*` → `import.meta.env.VITE_*` |

## Step-by-Step Tasks

### 1. Create vite.config.ts
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({ /* manifest + SW config */ })
  ],
  // Note: A custom nodepathPlugin was used instead of aliases
  // to replicate NODE_PATH=src/ behavior for bare imports.
  // See the actual vite.config.js for the implementation.
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:4000'
    }
  }
})
```

### 2. Create tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "allowJs": true,
    "strict": false,
    "esModuleInterop": true,
    "baseUrl": "./src",
    "paths": { "*": ["./*"] },
    "outDir": "dist"
  },
  "include": ["src", "vite.config.ts"]
}
```

### 3. Move index.html
- Move `public/index.html` to project root
- Remove `%PUBLIC_URL%` references (Vite doesn't use them)
- Add `<script type="module" src="/src/index.js"></script>` before `</body>`
- Keep external CSS links (MUI, Google Fonts)

### 4. Update package.json scripts
```json
{
  "scripts": {
    "start": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "react-scripts test --env=jsdom",
    "test:e2e": "npx playwright test",
    "eslint": "eslint src/",
    "deploy": "npm run build && bash deploy-to-s3.sh"
  }
}
```

### 5. Replace service worker setup
- Configure `vite-plugin-pwa` with existing manifest.json values
- Port `custom-sw.js` SKIP_WAITING logic into SW config
- Remove `registerServiceWorker.js`, update import in `index.js`

### 6. Replace environment variables
- `process.env.NODE_ENV` → `import.meta.env.MODE`
- `process.env.REACT_APP_*` → `import.meta.env.VITE_*`
- Search all files for `process.env` references

### 7. Update bare imports (if needed)
- Vite path alias should handle `NODE_PATH=src/` bare imports
- Verify all imports resolve: `import shoppingApp from 'reducers'`, `import { App } from 'App'`, etc.

### 8. Update ESLint parser
- Replace `babel-eslint` with `@babel/eslint-parser` or remove parser entirely (Vite handles transpilation)

### 9. Update Playwright config
- Remove `NODE_OPTIONS=--openssl-legacy-provider` from webServer command
- Command becomes just `npm start` (which runs `vite`)
- Keep `baseURL: 'http://localhost:3000'`

## Risks

- **Bare import resolution:** `NODE_PATH=src/` is CRA-specific. Vite's `resolve.alias` or `tsconfig.json` `baseUrl` must replicate this exactly. Test every import path.
- **Service worker:** CRA's SW setup is deeply integrated. vite-plugin-pwa has different patterns. The SKIP_WAITING + auto-reload-on-update behavior must be preserved.
- **CSS imports:** CRA handles CSS imports automatically. Vite does too, but verify `.css` imports in components still work.
- **Public assets:** CRA uses `%PUBLIC_URL%`. Vite serves `/public` assets at root. Verify favicon, icons, manifest.json paths.

## Verification

- `npm start` launches dev server on port 3000
- All existing source files load without import errors
- `npm run build` produces production bundle in `dist/`
- PWA installs correctly (manifest, service worker)
- All 41 E2E tests pass
- All 25 unit tests pass
