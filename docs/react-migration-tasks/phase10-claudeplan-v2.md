# Phase 10: Backend API Modernization

## Context

The backend API in `api/` is severely outdated: Node 10.15 (EOL April 2021), TypeScript 2.9, AWS SDK v2, Serverless Framework 1.71, webpack 4, Jest 24, TSLint. AWS Lambda no longer supports `nodejs10.x`. This phase modernizes everything to current versions while preserving the existing Express + serverless-http architecture and all 5 API endpoints.

## Decisions

- **Node.js runtime:** 20 (nodejs20.x)
- **Serverless Framework:** v3 (last open-source version)
- **Bundler:** esbuild via serverless-esbuild (replaces webpack + ts-loader)
- **Scraper tests:** Keep as-is (live HTTP integration tests, just upgrade syntax)

## Approach: Incremental commits

Each step is a standalone commit verified before moving to the next.

---

## Step 1: Upgrade Node.js runtime + TypeScript

**Files:**
- `api/.nvmrc` — `v10.15` → `20`
- `api/tsconfig.json` — full rewrite for TS 5 with strict mode
- `api/serverless.yml` — `nodejs10.x` → `nodejs20.x`
- `api/package.json` — `typescript` ^2.9.2 → ^5.9, update `@types/node` to ^20

**tsconfig.json target:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "sourceMap": true,
    "outDir": "lib",
    "resolveJsonModule": true
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

---

## Step 2: Replace webpack with esbuild

**Delete:** `api/webpack.config.js`, `api/source-map-install.js`

**Remove from package.json:**
- `webpack`, `serverless-webpack`, `ts-loader`, `source-map-support`, `path-loader`

**Add to package.json:**
- `serverless-esbuild`, `esbuild`

**Update serverless.yml:**
- Plugin: `serverless-webpack` → `serverless-esbuild`
- Add `custom.esbuild` config:
```yaml
custom:
  esbuild:
    bundle: true
    minify: false
    sourcemap: true
    target: node20
    platform: node
    exclude:
      - '@aws-sdk/*'
```

---

## Step 3: Migrate AWS SDK v2 → v3

**Remove:** `aws-sdk` (^2.573.0)

**Add:**
- `@aws-sdk/client-dynamodb`
- `@aws-sdk/lib-dynamodb`

**Rewrite `api/src/database.ts`:**
- `DynamoDB.DocumentClient` → `DynamoDBDocumentClient` from `@aws-sdk/lib-dynamodb`
- `.put(params).promise()` → `.send(new PutCommand(params))`
- `.get(params).promise()` → `.send(new GetCommand(params))`
- `.scan(params).promise()` → `.send(new ScanCommand(params))`
- Local dev detection: same pattern (`NODE_ENV === 'development'` → custom endpoint)
- Remove `lodash` — only used for `_.get(result, 'Item.Ingredients', [])`, replace with optional chaining

**Remove:** `lodash`, `@types/lodash`

---

## Step 4: Upgrade Express + serverless-http + middleware

**Upgrade in package.json:**
- `express` ^4.17.1 → ^4.21 (stay on Express 4, stable)
- `serverless-http` ^2.3.0 → ^3
- `express-basic-auth` ^1.2.0 → ^1.2.1 (latest 1.x)
- `body-parser` — remove (use built-in `express.json()` and `express.urlencoded()`)

**Update `api/src/server.ts`:**
- Replace `const serverless = require('serverless-http')` → `import serverless from 'serverless-http'`
- Replace `import * as bodyParser from 'body-parser'` → use `express.json()` + `express.urlencoded()`
- Replace `import * as express from 'express'` → `import express from 'express'` (with esModuleInterop)

**Update `api/src/routes.ts`:**
- Replace `import * as express from 'express'` → `import express from 'express'`

**Update `api/src/auth.ts`:**
- Replace `import * as basicAuth from 'express-basic-auth'` → `import basicAuth from 'express-basic-auth'`
- Add null checks for env vars (strict TS)

---

## Step 5: Fix TypeScript strict mode errors across all files

With `strict: true` enabled, fix all errors:

- **`api/src/routes.ts`:** `req.query.url` is `string | ParsedQs | ...` — needs type assertion. Change `String` → `string` (primitive).
- **`api/src/database.ts`:** Function params use `String` (wrapper) → `string` (primitive). Result access needs null checks.
- **`api/src/scraper.ts`:** `String` → `string`, type the `scrapeIt` response, type `dataMapping`.
- **`api/src/auth.ts`:** Null check on `process.env.BASIC_AUTH_USER` and `BASIC_AUTH_PASSWORD`. Type the `user` object.
- **`api/src/types.ts`:** Review if `ListItem extends Category` is correct — it probably should be its own interface.

---

## Step 6: Upgrade Serverless Framework 1 → 3

**Upgrade in package.json:**
- `serverless` ~1.71.3 → ^3
- `serverless-offline` ^4.10.6 → ^13 (Serverless v3 compatible)
- `serverless-domain-manager` ^2.6.13 → ^7
- `serverless-dynamodb-local` ^0.2.38 → replace with `serverless-dynamodb` (maintained community fork)
- `serverless-plugin-warmup` ^4.3.3-rc.1 → ^8 (Serverless v3 compatible)

**Update `api/serverless.yml` for Serverless v3:**
- `service.name: x` → `service: x` (v3 format)
- `iamRoleStatements` → `iam.role.statements` (v3 format)
- SSM syntax: `${ssm:/path~true}` → `${ssm:/path}` (decryption is default in v3)
- Plugin list: `serverless-dynamodb-local` → `serverless-dynamodb`
- Update `custom.dynamodb` config if needed for new plugin

**Update `@types/aws-lambda`** to latest.

---

## Step 7: Upgrade Jest + ts-jest, remove TSLint

**Upgrade in package.json:**
- `jest` ^24.1.0 → ^29
- `ts-jest` ^23.10.5 → ^29
- `@types/jest` ^24.0.5 → ^29

**Update `api/jest.config.js`** for ts-jest v29 (may need `transform` config update).

**Delete:** `api/tslint.json`
**Remove:** `tslint`, `tslint-config-standard` from devDependencies

**Remove:** `dynamodb-admin` from devDependencies (GUI tool, not needed in package.json — install globally if desired)

---

## Step 8: Update scraper dependency

**scrape-it** kept at ^5.2.0 — v6 was tested but the kotikokki.net site has changed its HTML
structure (ingredients no longer server-rendered), so both v5 and v6 produce the same empty
results. Upgrading to v6 would introduce API changes with no benefit.

The scraper uses `scrapeIt(url, mapping)` which returns a promise with `{ data, response, body }`.
This API is unchanged in v5.x.

---

## Files to modify (critical list)

| File | Action |
|---|---|
| `api/package.json` | Major dep changes, script updates |
| `api/package-lock.json` | Regenerated |
| `api/.nvmrc` | v10.15 → 20 |
| `api/tsconfig.json` | Full rewrite for TS 5 strict |
| `api/serverless.yml` | Runtime, plugins, IAM format, SSM syntax |
| `api/webpack.config.js` | **Delete** |
| `api/source-map-install.js` | **Delete** |
| `api/tslint.json` | **Delete** |
| `api/jest.config.js` | Update for Jest 29 |
| `api/src/server.ts` | ES import style, Express built-in middleware |
| `api/src/database.ts` | Full rewrite for AWS SDK v3, remove lodash |
| `api/src/routes.ts` | Fix types (String → string, strict null checks) |
| `api/src/auth.ts` | Fix types, null checks |
| `api/src/scraper.ts` | Fix types (String → string) |
| `api/src/types.ts` | Review ListItem type |
| `api/src/scraper.test.ts` | Fix comma-expression syntax (same issue as frontend Phase 9) |

---

## Verification

After each step:
1. `cd api && npx tsc --noEmit` — no TypeScript errors
2. `cd api && npm test` — scraper tests pass (requires network)
3. `cd api && npx sls package` — Serverless packages without errors

After all steps:
4. `cd api && npm run start:local-api` — API starts on port 4000 (if local DynamoDB available)
5. Frontend E2E tests that use API proxy should still pass
