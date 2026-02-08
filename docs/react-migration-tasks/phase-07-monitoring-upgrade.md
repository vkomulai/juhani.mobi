# Phase 7: Monitoring & Analytics Upgrade

**Size:** Medium
**Prerequisites:** Phase 1 (Vite)
**Blocks:** None

## Overview

Replace deprecated monitoring libraries: `raven-js` → `@sentry/react`, `react-ga` (Universal Analytics) → GA4 via `gtag.js`. Fix two known bugs in `Analytics.js`: `isProduction` used as reference instead of function call, and `process.envs` typo.

## Packages

### Remove
- `raven-js` — deprecated Sentry SDK (replaced by @sentry/*)
- `react-ga` — Universal Analytics wrapper (UA is sunset)

### Add
- `@sentry/react` — modern Sentry SDK for React

## Files to Modify

| File | Change |
|---|---|
| `src/api/Analytics.js` → `src/api/Analytics.ts` | Full rewrite |
| `public/index.html` (or `index.html` after Phase 1) | Add GA4 gtag.js script |

## Current Bugs in Analytics.js

### Bug 1: `isProduction` not called (line 44)
```js
if (isProduction || process.envs.REACT_APP_SIMULATE_ANALYTICS_PRODUCTION) {
//  ^^^^^^^^^^^^  should be isProduction()
```
`isProduction` is a function reference — always truthy. Analytics initializes even on localhost.

### Bug 2: `process.envs` typo (line 44)
```js
process.envs.REACT_APP_SIMULATE_ANALYTICS_PRODUCTION
//     ^^^^^ should be process.env (singular)
```
This always evaluates to `undefined`, so the env var override never works.

## Step-by-Step Tasks

### 1. Replace raven-js with @sentry/react

**Before:**
```js
import Raven from 'raven-js'
Raven.config(`https://${config.sentry.account}@sentry.io/${config.sentry.project}`).install()
Raven.captureMessage(error, { level: 'error' })
```

**After:**
```ts
import * as Sentry from '@sentry/react'
Sentry.init({ dsn: `https://${config.sentry.account}@sentry.io/${config.sentry.project}` })
Sentry.captureMessage(error, 'error')
```

### 2. Replace react-ga with GA4 gtag.js

Universal Analytics (UA-113979141-1) is sunset. Replace with GA4:

**Add to index.html:**
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Replace ReactGA calls with gtag:**
```ts
// Before
ReactGA.event({ category: 'UserInteraction', action: eventName, value: eventValue })

// After
gtag('event', eventName, { event_category: 'UserInteraction', value: eventValue })
```

Note: The GA4 measurement ID needs to be obtained from Google Analytics console. If not available, use the config object to make it easy to add later.

### 3. Fix isProduction bug

**Before:**
```js
const isProduction = () => location.hostname !== 'localhost'

// Bug: reference instead of call
if (isProduction || process.envs.REACT_APP_SIMULATE_ANALYTICS_PRODUCTION) {
```

**After:**
```ts
const isProduction = (): boolean => location.hostname !== 'localhost'

if (isProduction() || import.meta.env.VITE_SIMULATE_ANALYTICS_PRODUCTION) {
```

### 4. Fix process.envs typo

Already fixed in step 3 — `process.envs` → `import.meta.env` (Vite convention from Phase 1).

### 5. Rewrite Analytics.ts

Complete rewrite incorporating all fixes:
```ts
import * as Sentry from '@sentry/react'

const config = {
  sentry: {
    dsn: 'https://90f802bdd8404cd3a97e2e37b55661c4@sentry.io/286831'
  },
  ga4: {
    measurementId: 'G-XXXXXXXXXX' // TODO: Get from GA4 console
  }
}

const isProduction = (): boolean => location.hostname !== 'localhost'

const sendAnalyticsEvent = (eventName: string, eventValue?: string): void => {
  if (isProduction()) {
    try {
      gtag('event', eventName, { event_category: 'UserInteraction', value: eventValue })
    } catch (e) {
      console.log('sendAnalyticsEvent(): ', eventName, e)
    }
  }
}

export const sendClientError = (error: string): void => {
  Sentry.captureMessage(error, 'error')
}

export const sendUnknownItems = (items: string[]): void => {
  if (items?.length > 0) {
    Sentry.captureMessage(`Unknown items added to list: [${items.join(',')}]`, 'info')
  }
}

export const initializeAnalytics = (): void => {
  if (isProduction() || import.meta.env.VITE_SIMULATE_ANALYTICS_PRODUCTION) {
    Sentry.init({ dsn: config.sentry.dsn })
  }
}

// ... remaining event exports unchanged
```

### 6. Remove Hotjar config

The config object includes Hotjar IDs but they're not used in the code. Remove from config.

## Risks

- **GA4 measurement ID:** Need to create a GA4 property and get the measurement ID. If not available, stub it out.
- **Sentry DSN format:** Modern @sentry/react uses a full DSN string vs the old account/project split. Verify the DSN is correct.
- **gtag global:** `gtag` is a global function injected by the script tag. TypeScript will need a `declare function gtag(...)` or `window.gtag` type declaration.

## Verification

- Analytics events fire in production (check GA4 real-time report, Sentry dashboard)
- No analytics calls on localhost (isProduction fix verified)
- Error reporting sends to Sentry correctly
- `sendUnknownItems` logs to Sentry as info level
- All 41 E2E tests pass
- All unit tests pass
