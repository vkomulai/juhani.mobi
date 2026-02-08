# Phase 10: Backend API Modernization

**Size:** Large
**Prerequisites:** None (fully independent — can run in parallel with any frontend phase)
**Blocks:** None

## Overview

Modernize the backend API in `api/` directory: upgrade Node.js runtime from 10 to 20, TypeScript from 2.9 to 5+, AWS SDK from v2 to v3 modular clients, Serverless Framework from 1 to 3+, and replace webpack bundling with esbuild.

## Packages (all in `api/`)

### Remove
- `aws-sdk` — v2 monolithic SDK
- `webpack` + `webpack-node-externals` + `ts-loader` — replaced by esbuild
- `serverless-webpack` — replaced by serverless-esbuild
- `serverless-dynamodb-local` — verify compatibility or replace

### Upgrade
- `typescript` — ^2.9 → ^5
- `serverless` — ^1 → ^3+
- `express` — verify current version, upgrade if needed
- `serverless-http` — upgrade to latest
- `express-basic-auth` — upgrade to latest
- `serverless-offline` — upgrade to latest (for local dev)
- `serverless-domain-manager` — upgrade to latest
- `jest` + `ts-jest` — upgrade to latest
- All `@types/*` packages — upgrade to match new TS version

### Add
- `@aws-sdk/client-dynamodb` — v3 DynamoDB client
- `@aws-sdk/lib-dynamodb` — v3 DynamoDB document client
- `@aws-sdk/client-ssm` — v3 SSM client (for auth credentials)
- `serverless-esbuild` — esbuild bundling for Lambda
- `esbuild` — fast bundler

## Files to Modify

| File | Change |
|---|---|
| `api/package.json` | Update all deps, scripts, engine field |
| `api/tsconfig.json` | Update to TS 5 config |
| `api/serverless.yml` | Runtime → nodejs20.x, replace webpack plugin with esbuild |
| `api/.nvmrc` | 10.15 → 20 |
| `api/webpack.config.js` | **Delete** — replaced by esbuild |
| `api/src/app.ts` | Update AWS SDK imports, Express setup |
| `api/src/scraper.ts` | Update any deprecated APIs |
| `api/src/dynamodb.ts` (or equivalent) | Rewrite for AWS SDK v3 |
| All `api/src/**/*.ts` | Fix TS 5 type errors, update SDK usage |

## Step-by-Step Tasks

### 1. Update Node.js runtime

**`api/.nvmrc`:**
```
20
```

**`api/serverless.yml`:**
```yaml
provider:
  runtime: nodejs20.x
```

### 2. Upgrade TypeScript to 5+

**`api/tsconfig.json`:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "moduleResolution": "node",
    "outDir": "./dist",
    "sourceMap": true
  },
  "include": ["src/**/*"]
}
```

Fix all type errors from TS 5 stricter checks.

### 3. Migrate AWS SDK v2 → v3

**DynamoDB — Before (v2):**
```ts
import AWS from 'aws-sdk'
const dynamodb = new AWS.DynamoDB.DocumentClient()
await dynamodb.put({ TableName: 'Lists', Item: item }).promise()
await dynamodb.get({ TableName: 'Lists', Key: { id } }).promise()
```

**DynamoDB — After (v3):**
```ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

await docClient.send(new PutCommand({ TableName: 'Lists', Item: item }))
await docClient.send(new GetCommand({ TableName: 'Lists', Key: { id } }))
```

**SSM — Before (v2):**
```ts
import AWS from 'aws-sdk'
const ssm = new AWS.SSM()
const result = await ssm.getParameter({ Name: paramName, WithDecryption: true }).promise()
```

**SSM — After (v3):**
```ts
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'
const ssm = new SSMClient({})
const result = await ssm.send(new GetParameterCommand({ Name: paramName, WithDecryption: true }))
```

### 4. Replace webpack with esbuild

**Delete `api/webpack.config.js`**

**`api/serverless.yml`:**
```yaml
plugins:
  - serverless-esbuild   # replaces serverless-webpack
  - serverless-offline
  - serverless-dynamodb-local
  - serverless-domain-manager

custom:
  esbuild:
    bundle: true
    minify: false
    sourcemap: true
    target: node20
    platform: node
    exclude:
      - '@aws-sdk/*'   # SDK v3 is included in Lambda runtime
```

### 5. Upgrade Serverless Framework 1 → 3+

Key changes:
- `serverless.yml` syntax is mostly compatible
- Some plugin APIs changed — verify each plugin works with v3
- `variablesResolutionMode: 20210326` may be needed for new variable resolution
- Check `serverless-domain-manager` compatibility with v3

### 6. Update Express app

Verify `express` and `serverless-http` work with Node 20. Likely no code changes needed, just version bumps.

### 7. Update auth credentials

`express-basic-auth` credentials come from SSM. After migrating to SDK v3, verify the auth middleware still fetches credentials correctly.

### 8. Update tests

```bash
cd api && npm install jest@latest ts-jest@latest @types/jest@latest
```

Update `jest.config.js` if needed for new ts-jest version.

### 9. Update local development

- `serverless-offline` — upgrade for Node 20 + Serverless 3 compat
- `serverless-dynamodb-local` — may need replacement (`serverless-dynamodb` is the maintained fork)
- Verify `npm run start:local-api` still works on port 4000

## Risks

- **AWS SDK v3 behavior differences:** Some response shapes differ between v2 and v3. Test all endpoints (lists CRUD, categories, recipe scraping).
- **Serverless Framework 3 breaking changes:** Plugin compatibility is the main risk. Test deployment to dev stage before prod.
- **Local DynamoDB:** `serverless-dynamodb-local` may not work with Serverless 3. The community fork `serverless-dynamodb` is the replacement.
- **Lambda cold start:** AWS SDK v3 modular imports should reduce bundle size and cold start time. But esbuild bundling changes may affect this — test cold starts.
- **Node 20 breaking changes:** `url.parse()` deprecation, stricter `Buffer` handling, etc. These are unlikely to affect this small API but verify.

## Verification

- `cd api && npm test` — all backend tests pass
- `npm run start:local-api` — API starts on port 4000
- `npm run start:local-dynamodb` — local DynamoDB starts
- Frontend dev server proxies to local API correctly
- `npm run deploy:dev` — deploys to dev stage successfully
- All API endpoints work:
  - `GET /categories` — returns category data
  - `POST /lists` — stores a shopping list
  - `GET /lists/:id` — retrieves a shared list
  - Recipe scraping endpoint works
- All 41 frontend E2E tests pass (tests that hit the API use the proxy)
