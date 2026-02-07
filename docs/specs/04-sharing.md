# 04 — Sharing

## Overview

Users can share their shopping list with others via the Web Share API. The list is stored on the backend with a UUID, and a shareable URL is generated. Recipients can load a shared list by visiting the URL.

## User-Facing Behavior

### Sharing a List (Outbound)

1. User taps the share icon (image) in the header bar.
2. A UUID v1 is generated as the list ID.
3. The list is POSTed to the backend: `POST /list/{uuid}` with the `shoppingItems` array as JSON body.
4. `navigator.share()` is called with:
   - **title**: `"Ostoslista {day}.{month}. kello {hours}.{minutes}"` (Finnish date format, minutes zero-padded).
   - **text**: Each item on its own line prefixed with `"- "`, followed by a newline.
   - **url**: `"https://www.juhani.mobi/l/{uuid}"`.

### Guards

- **Empty list**: If `shoppingItems` is empty or falsy, an `alert('Lisää ostoksia ennen listan jakamista!')` is shown. Share is aborted.
- **No Web Share API**: If `navigator.share` is not available, an `alert('Jako mahdollista vain selaimella: Chrome 61 Android!!')` is shown. Share is aborted.

### Loading a Shared List (Inbound)

1. User visits URL `/l/:id` (e.g., `https://www.juhani.mobi/l/abc-123`).
2. React Router matches the route `<Route path='/l/:id' component={App} />`.
3. `SortableList.componentDidMount()` checks `match.params.id`.
4. If an `id` exists, dispatches `fetchList(id)`.
5. `fetchList` does `GET /list/{id}` → response JSON → dispatches `ITEMS_LIST_LOADED`.
6. `ITEMS_LIST_LOADED` reducer **replaces** the entire `shoppingItems` array with the fetched items.

### Share Text Format Example

For items `["maito", "leipä", "juusto"]` shared on January 15 at 14:05:
```
Title: Ostoslista 15.1. kello 14.05
Text:
- maito
- leipä
- juusto

URL: https://www.juhani.mobi/l/{uuid}
```

## Key Source Files

| File | Role |
|------|------|
| `src/api/Share.js` | `shareList()` — guards, format, `navigator.share()` call |
| `src/containers/Header/Header.js` | Share icon click handler; generates UUID, dispatches `storeList`, calls `shareList` |
| `src/components/SortableList/SortableList.jsx` | `componentDidMount` fetches shared list by route param |
| `src/actions/index.js` | `storeList()` POSTs to API, `fetchList()` GETs from API |
| `api/src/routes.ts` | `GET /list/:id` and `POST /list/:id` endpoints |

## Acceptance Criteria

1. Tapping share icon with items generates a UUID, stores the list on the backend, and triggers `navigator.share()`.
2. Share title follows the Finnish date format.
3. Share text lists all items with `"- "` prefix, one per line.
4. Share URL points to `https://www.juhani.mobi/l/{uuid}`.
5. Empty list share shows an alert and aborts.
6. Missing `navigator.share` shows an alert and aborts.
7. Visiting `/l/:id` fetches and loads the shared list, replacing current items.

## Edge Cases

- Backend POST failure: Error is logged to console; share dialog may still open with the URL (the `shareList` call happens independently of the POST completion).
- Backend GET failure for shared list: Error logged to console; list remains unchanged.
- Shared list with empty items array from backend: replaces current list with `[]`.
- Minutes formatting: single-digit minutes are zero-padded (e.g., `14.05` not `14.5`).
- UUID v1 is time-based, so two shares in rapid succession get different IDs.
