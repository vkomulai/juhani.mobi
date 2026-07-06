# 10 — Analytics & Error Tracking

## Overview

The app uses Google Analytics (via `react-ga`) for usage tracking and Sentry (via `raven-js`) for error reporting. Both are intended for production only, though there is a known bug in the initialization check.

## User-Facing Behavior

Analytics and error tracking are invisible to the user. They run in the background to help developers understand usage patterns and catch errors.

## Configuration

| Service | Config Value |
|---------|-------------|
| Google Analytics | `UA-113979141-1` |
| Sentry account | `90f802bdd8404cd3a97e2e37b55661c4` |
| Sentry project | `286831` |
| Hotjar ID | `778873` (configured but not used in code) |

## Analytics Events

| Event Name | Trigger | Source |
|-----------|---------|--------|
| `Application Loaded` | App startup | `index.js` |
| `AddButtonPressed` | Add button clicked | `AddButton.js` |
| `EmptyButtonPressed` | Empty button clicked | `EmptyButton.js` |
| `ItemOrderChanged` | Drag-and-drop reorder | `ShoppingList.js` |
| `ItemCollected` | Item checkbox toggled | `ShoppingList.js` |
| `ItemRemoved` | Trash icon clicked | `ShoppingList.js` |
| `ItemsRecognized` | Speech recognized items | `AddButton.js`, `actions/index.js` |

All events are sent under category `'UserInteraction'`.

## Error Tracking (Sentry)

- `sendClientError(error)`: Captures a message at `error` level.
- `sendUnknownItems(items)`: Reports unknown market category items at `info` level, format: `"Unknown items added to list: [item1,item2]"`.

## Production Check

### `sendAnalyticsEvent` (per-event check)

```javascript
const isProduction = () => location.hostname !== 'localhost'
```
This is a **function** and is called correctly: `if (isProduction()) { ... }`.

### `initializeAnalytics` (initialization check)

```javascript
if (isProduction || process.envs.REACT_APP_SIMULATE_ANALYTICS_PRODUCTION) {
```
**Known bug**: `isProduction` is referenced as a **variable** (function reference), not called as `isProduction()`. Since a function reference is always truthy, analytics and Sentry are **always initialized**, even on localhost.

Additionally, `process.envs` should be `process.env` (extra 's') — this would throw a TypeError in the OR branch, but it's never reached because `isProduction` (the function reference) is always truthy.

### Sentry Error Tracking

Sentry (`raven-js`) sends errors regardless of environment — `sendClientError()` and `sendUnknownItems()` do not check `isProduction`.

## Key Source Files

| File | Role |
|------|------|
| `src/api/Analytics.js` | All analytics and error tracking functions |
| `src/index.js` | Calls `initializeAnalytics()` and `sendApplicationLoadedEvent()` at startup |
| `src/containers/AddButton.js` | Sends `AddButtonPressed` and `ItemsRecognized` events |
| `src/containers/EmptyButton.js` | Sends `EmptyButtonPressed` event |
| `src/containers/ShoppingList.js` | Sends `ItemCollected`, `ItemRemoved`, `ItemOrderChanged` events |

## Acceptance Criteria

1. In production, Google Analytics receives all tracked events.
2. Sentry captures error messages and unknown item reports.
3. On localhost, `sendAnalyticsEvent` logs to console instead of sending to GA.
4. Analytics initialization occurs at app startup.

## Edge Cases

- **Known bug**: `initializeAnalytics` always initializes GA and Sentry due to function reference check (see above).
- **Known bug**: `process.envs` typo — the `REACT_APP_SIMULATE_ANALYTICS_PRODUCTION` env var check never works.
- Sentry calls (`sendClientError`, `sendUnknownItems`) have no production check — they send in all environments.
- `sendItemsRecognizedEvent` calls `items.toString()` on the recognized items array, which produces `"[object Object],[object Object]"` (items are objects, not strings).
