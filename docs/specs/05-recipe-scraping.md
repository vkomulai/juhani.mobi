# 05 — Recipe Scraping

## Overview

The app can receive recipe URLs via the Web Share Target API and scrape ingredient lists from supported recipe sites. Scraped ingredients are added to the shopping list.

## User-Facing Behavior

### Share Target Reception

1. Another app shares a URL to Juhani.mobi via Android's share intent.
2. The PWA receives the share via URL query parameters (defined in `manifest.json`'s `share_target`).
3. On `DOMContentLoaded`, the app reads query params: `url`, `text`, `title`.
4. The recipe URL is extracted from: `url` param first, or by regex-matching a URL from `text`, or from `title`.
5. The share target query params are cleaned from the URL via `history.pushState`.

### Recipe Scraping Flow

1. Frontend calls `GET /recipe?url={recipeUrl}` via `scrapeRecipe()`.
2. Backend checks DynamoDB `Recipes` table for a cached result.
3. If not cached, scrapes the URL with `scrape-it` library.
4. Scraped ingredients are saved to DynamoDB for future requests.
5. Response is an array of `{ amount, name }` objects.
6. Frontend maps to `{ name, collected: false }` and dispatches `itemsRecognized()`.

**Security note**: The backend does not validate or sanitize the user-provided URL before scraping. This could expose the backend to SSRF attacks (e.g., targeting internal services or cloud metadata endpoints). URL validation, rate limiting, and request timeouts should be added.

### Supported Recipe Sites

| Site | URL Pattern |
|------|-------------|
| Kotikokki.net | `https://www.kotikokki.net/*` |

Other sites throw an `'unknown source'` error.

### Scraping Mapping (Kotikokki.net)

- Ingredient list items: CSS selector `.ingredient`
- Amount: first `<span>` element
- Name: `.name span` first element

### URL Extraction from Text

The regex `^[\S\s]*\s*(?<url>https?:\/\/[^\s]+)$` extracts the last URL from shared text. This handles cases where apps share text like "Check this recipe https://example.com/recipe".

## Key Source Files

| File | Role |
|------|------|
| `src/api/RecipeScrapeAPI.js` | Frontend `scrapeRecipe()` — calls API, maps response |
| `src/actions/index.js` | `listenToShareTargetEvent()` — listens for DOMContentLoaded, extracts URL |
| `api/src/scraper.ts` | Backend scraping with `scrape-it`, only kotikokki.net supported |
| `api/src/routes.ts` | `GET /recipe?url=...` endpoint with DB caching |
| `public/manifest.json` | `share_target` configuration for receiving shares |

## Acceptance Criteria

1. Receiving a share with a kotikokki.net URL scrapes ingredients and adds them to the list.
2. Previously scraped recipes are served from DynamoDB cache.
3. Unsupported recipe sites return an error (handled gracefully).
4. URL extraction works from `url`, `text`, or `title` query params.
5. After processing, the share target params are cleaned from the browser URL.

## Edge Cases

- Missing `url` query param on API: returns `400` with error message.
- Network error during scraping: API returns `400`; frontend catches error, sends to Sentry, returns empty array.
- Share with no URL in any param: `recipeUrl` is null/undefined; error sent to Sentry analytics.
- Frontend API host: uses `https://api.juhani.mobi` in production, empty string (proxied) on localhost.
- **Known bug**: Race condition: `DOMContentLoaded` listener is registered in `index.js` at startup; if the event already fired, the listener never triggers. This could happen on slower networks or with service worker caching. Fix: check `document.readyState` before adding the listener and call the handler immediately if the document is not `'loading'`.
