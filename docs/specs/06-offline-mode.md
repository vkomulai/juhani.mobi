# 06 — Offline Mode

## Overview

The app detects network connectivity changes via browser events and updates the UI accordingly. When offline, certain features are disabled and a visual indicator is shown.

## User-Facing Behavior

### Online/Offline Detection

- The app listens to both `'online'` and `'offline'` events on the `window` object (registered at startup in `index.js`).
- Each event dispatches `ONLINE_CHANGED` with `navigator.onLine` as the payload.
- The `isOnline` Redux state tracks connectivity (default: `true`).

### Offline UI

When `isOnline` is `false`:

1. **Info panel**: Shows a pink/red panel (CSS class `speech-not-supported`) with:
   - Main text: `"Selaimesi offline-tilassa!"` (hardcoded Finnish, NOT from i18n).
   - Sub text: `"Puheentunnistus ei toimi"` (hardcoded Finnish, NOT from i18n).
2. **Empty button**: Disabled (`enabled: state.shoppingItems.length > 0 && state.isOnline`).
3. **Add button**: Currently always enabled (the `enabled` prop is hardcoded to `true`, with the conditional check commented out).

### Known Limitation

The offline text in `InfoView.jsx` (lines 41–44) is hardcoded in Finnish regardless of the selected UI language. This is a known bug — switching to English and going offline still shows Finnish text:
```javascript
if (!isOnline) {
  return {
    mainText: 'Selaimesi offline-tilassa!',
    subText: 'Puheentunnistus ei toimi'
  }
}
```

### Online Recovery

- When the browser comes back online, the `online` event fires → `isOnline` becomes `true`.
- The info panel returns to its normal state.
- The Empty button becomes enabled again (if items exist).

## Key Source Files

| File | Role |
|------|------|
| `src/actions/index.js` | `listenToWindowEvent()` — registers online/offline listeners |
| `src/reducers/index.js` | `isOnline` reducer handles `ONLINE_CHANGED` |
| `src/components/InfoView/InfoView.jsx` | Offline info text (hardcoded Finnish, lines 40–44) |
| `src/containers/EmptyButton.js` | Disabled when offline |
| `src/containers/InfoArea.js` | Passes `isOnline` to `InfoView` |
| `src/index.js` | Dispatches `listenToWindowEvent('offline')` and `listenToWindowEvent('online')` |

## Acceptance Criteria

1. Going offline shows the pink info panel with Finnish offline text.
2. The Empty button is disabled when offline.
3. Coming back online restores normal UI state.
4. The Add button remains enabled when offline (current behavior, even though speech won't work).

## Edge Cases

- App starts while offline: `isOnline` defaults to `true` in Redux, so the offline state is not reflected until the first `offline` event fires. However, `redux-storage` may restore a previously saved `isOnline: false` from localStorage.
- Rapid online/offline toggling: Each event dispatch updates state; React re-renders handle the latest state.
- Offline text is hardcoded Finnish even in English mode (documented known bug).
