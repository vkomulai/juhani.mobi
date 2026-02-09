# 07 — Progressive Web App (PWA)

## Overview

Juhani.mobi is a Progressive Web App with a manifest for installability, a service worker for caching, and automatic update detection.

## User-Facing Behavior

### Web App Manifest

The manifest (`public/manifest.json`) configures:

| Field | Value |
|-------|-------|
| `name` | `Juhani.mobi` |
| `short_name` | `Juhani.mobi` |
| `start_url` | `/index.html` |
| `display` | `standalone` |
| `background_color` | `#3E4EB8` |
| `theme_color` | `#2F3BA2` |
| `share_target.action` | `/` |
| `share_target.params` | `{ title, text, url }` |

Icons are provided for Android, iOS, Chrome, and Firefox in multiple sizes (16x16 to 1024x1024).

### Service Worker

- **Registration**: Only in production (`process.env.NODE_ENV === 'production'`).
- **Implementation**: CRA-generated service worker + custom `custom-sw.js` appended via `cra-append-sw` during build.
- **Custom SW behavior**: Listens for `SKIP_WAITING` message and calls `self.skipWaiting()` to activate immediately.

### Update Detection

1. **On visibility change**: When the app comes back to the foreground (via `webkitvisibilitychange` event), the service worker is re-registered and `reg.update()` is called to check for new content. **Note**: Uses WebKit-prefixed `webkitvisibilitychange`/`webkitHidden` instead of the standard `visibilitychange`/`document.hidden`. This only works in WebKit-based browsers (Chrome, Edge, Safari) and breaks on Firefox.
2. **On update found**: When a new service worker is installed:
   - If there's an existing controller (update scenario): Posts `SKIP_WAITING` to the new worker, then reloads the page after a 1-second delay. **UX concern**: This automatic reload could interrupt users mid-interaction. Consider showing a toast/prompt instead.
   - If no controller (first install): Logs "Content is cached for offline use."

### Update Flow

```
App comes to foreground
  → webkitvisibilitychange fires
  → reg.update() checks for new SW
  → If new SW found: onupdatefound → onstatechange
  → installingWorker posts SKIP_WAITING
  → custom-sw.js calls self.skipWaiting()
  → Page reloads after 1000ms
```

## Key Source Files

| File | Role |
|------|------|
| `public/manifest.json` | PWA manifest with app metadata, icons, share_target |
| `src/registerServiceWorker.js` | SW registration, update detection, visibility change handler |
| `src/custom-sw.js` | Custom SW script for SKIP_WAITING support |
| `src/index.js` | Calls `register()` at startup |
| `public/index.html` | Links to manifest, sets theme-color meta tag |

## Acceptance Criteria

1. Manifest is accessible at `/manifest.json` with correct `name`, `display`, `share_target`.
2. HTML includes `<link rel="manifest">` and `<meta name="theme-color" content="#000000">`. **Known inconsistency**: theme-color in HTML is `#000000` but manifest's `theme_color` is `#2F3BA2` — these should be aligned to the same value.
3. Service worker registers in production only.
4. App checks for SW updates when returning from background.
5. New SW version triggers automatic page reload after 1 second.
6. Custom SW handles `SKIP_WAITING` message.

## Edge Cases

- **Known bug**: Visibility change event uses the webkit-prefixed `webkitvisibilitychange` and `webkitHidden` — only works in WebKit-based browsers (Chrome on Android, which is the target). Fix: use the standard `visibilitychange` event and `document.hidden` property, with a fallback to the webkit-prefixed versions.
- Service worker URL is constructed from `process.env.PUBLIC_URL` — if PUBLIC_URL is misconfigured, registration will fail.
- The `webkitvisibilitychange` listener is registered outside the `register()` function, so it runs even in development (though SW registration in it may fail gracefully).
- First-time visitors: No controller exists, so the "update" flow doesn't trigger; content is simply cached.
