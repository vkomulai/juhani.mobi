# Phase 5: Redux → Zustand

**Size:** Large
**Prerequisites:** Phase 2 (React 18)
**Blocks:** Phase 6 (@dnd-kit)

## Overview

Replace Redux + redux-thunk + redux-storage with Zustand. Create a single store with `persist` middleware for localStorage (keeping the key `'juhani.mobi'`). Dissolve the container/component pattern — merge Redux `connect()` logic directly into components using `useStore()`. Handle localStorage data format migration from redux-storage format to Zustand persist format.

## Packages

### Remove
- `redux` — state management
- `react-redux` — React bindings
- `redux-thunk` — async middleware
- `redux-storage` — persistence middleware
- `redux-storage-engine-localstorage` — localStorage engine
- `lodash` — only used for `_.unionBy` in reducers and `_.get` in MarketCategories (replace with native)

### Add
- `zustand` — state management

## Current Redux State Shape

```js
{
  shoppingItems: Array<{ name: string, collected: boolean, index: number }>,
  listening: boolean,
  isSpeechRecognitionSupported: boolean,
  onBoardingCompleted: boolean,
  isOnline: boolean,
  sortAutomatically: boolean
}
```

Persisted to localStorage under key `'juhani.mobi'` via redux-storage.

## Files to Modify/Delete

| File | Change |
|---|---|
| **New:** `src/store.ts` | Create Zustand store |
| `src/index.js` | Remove Redux Provider, store setup, redux-storage loader |
| `src/reducers/index.js` | **Delete** — logic moves to store.ts |
| `src/reducers/index.test.js` | Rewrite as store.test.ts |
| `src/actions/index.js` | **Delete** — action creators become Zustand actions |
| `src/containers/AddButton.js` | **Delete** — merge into Button component |
| `src/containers/EmptyButton.js` | **Delete** — merge into Button component |
| `src/containers/InfoArea.js` | **Delete** — merge into InfoView component |
| `src/containers/ShoppingList.js` | **Delete** — merge into SortableList component |
| `src/containers/ApplicationMenu.js` | **Delete** — merge into Menu component |
| `src/containers/Header/Header.js` | **Delete** — merge into a Header component |
| `src/containers/index.js` | **Delete** — barrel file |
| `src/App.js` | Update imports (no more container imports) |
| `src/components/Button/Button.jsx` | Add store hooks for AddButton/EmptyButton logic |
| `src/components/InfoView/InfoView.jsx` | Add `useStore()` for state |
| `src/components/SortableList/SortableList.jsx` | Add `useStore()` for state + actions |
| `src/components/HamburgerMenu/Menu.jsx` | Add `useStore()` for state + actions |
| `src/api/MarketCategories.js` | Replace `_.get` with optional chaining |

## Step-by-Step Tasks

### 1. Create Zustand store (src/store.ts)

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supportSpeechRecognition } from 'api/SpeechRecognitionAPI'
import { getItemOrder } from 'api/MarketCategories'

interface ShoppingItem {
  name: string
  collected: boolean
  index: number
}

interface AppState {
  shoppingItems: ShoppingItem[]
  listening: boolean
  isSpeechRecognitionSupported: boolean
  onBoardingCompleted: boolean
  isOnline: boolean
  sortAutomatically: boolean

  // Actions
  addItemPressed: () => void
  itemsRecognized: (items: ShoppingItem[]) => void
  removeItem: (item: ShoppingItem) => void
  collectedItemPressed: (item: ShoppingItem) => void
  readyPressed: () => void
  itemsReOrdered: (oldIndex: number, newIndex: number) => void
  onBoardingComplete: () => void
  setOnline: (online: boolean) => void
  setSortAutomatically: () => void
  fetchList: (id: string) => Promise<void>
  storeList: (id: string) => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // State
      shoppingItems: [],
      listening: false,
      isSpeechRecognitionSupported: supportSpeechRecognition(),
      onBoardingCompleted: false,
      isOnline: true,
      sortAutomatically: true,

      // Actions (port from reducers + action creators)
      addItemPressed: () => set({ listening: true }),
      itemsRecognized: (recognizedItems) => set((state) => {
        // Port ITEMS_LISTENED reducer logic + unionBy
        const merged = unionBy(state.shoppingItems, recognizedItems)
        const items = state.sortAutomatically
          ? merged.sort((a, b) => getItemOrder(a.name) - getItemOrder(b.name))
          : merged
        return { shoppingItems: items, listening: false }
      }),
      // ... remaining actions
    }),
    {
      name: 'juhani.mobi',
      // Handle migration from redux-storage format
      migrate: (persisted) => { /* migration logic */ }
    }
  )
)
```

### 2. Handle localStorage format migration

**Redux-storage format:**
```json
{"shoppingItems":[...],"listening":false,"isSpeechRecognitionSupported":true,...}
```

**Zustand persist format:**
```json
{"state":{"shoppingItems":[...],...},"version":0}
```

Write a `migrate` function in the persist config that detects the old format (no `state` wrapper) and wraps it.

### 3. Replace lodash with native code

**`_.unionBy(state, recognizedItems, 'name')`** → native:
```js
const existingNames = new Set(state.map(i => i.name))
const merged = [...state, ...recognizedItems.filter(i => !existingNames.has(i.name))]
```

**`_.get(match, '[0].item.order', UNKNOWN_ITEM_ORDER)`** → optional chaining:
```js
match[0]?.item?.order ?? UNKNOWN_ITEM_ORDER
```

### 4. Merge containers into components

For each container, move the `mapStateToProps` / `mapDispatchToProps` logic into the component using `useStore()`:

**Example — InfoView.jsx (was InfoArea container + InfoView component):**
```jsx
import { useStore } from 'store'

export const InfoView = () => {
  const { shoppingItems, listening, isSpeechRecognitionSupported, isOnline } = useStore()
  const emptyShoppingList = shoppingItems.length === 0
  // ... render
}
```

### 5. Update App.js imports
Remove container imports, import components directly.

### 6. Simplify index.js
Remove: `Provider`, `createStore`, `applyMiddleware`, `redux-storage` loader, all Redux imports.
Keep: Router, event listeners (move to store actions or useEffect).

### 7. Move window event listeners
The Redux `listenToWindowEvent` thunks for online/offline need to become Zustand actions or be set up in index.js using `useStore.getState()`.

### 8. Rewrite reducer unit tests
Port `src/reducers/index.test.js` to test Zustand store actions directly.

### 9. Delete old files
- `src/reducers/` directory
- `src/containers/` directory
- `src/actions/` directory

## Risks

- **localStorage migration:** Users with existing data must not lose their shopping lists. The migration function must handle the old redux-storage format.
- **Default items on localhost:** The reducer has a `DEFAULT_ITEMS` array for localhost. This logic must be preserved in the Zustand store or initial state.
- **Side effects in containers:** `AddButton` dispatches analytics + starts speech recognition in `mapDispatchToProps`. These side effects must be preserved when merging into components.
- **Share target event listener:** `listenToShareTargetEvent()` in index.js uses Redux dispatch. Must be wired to Zustand store.
- **Large change surface:** This phase touches almost every file. Run E2E tests frequently during migration.

## Verification

- Existing users' shopping lists survive the localStorage migration
- Add item via speech → items appear in list
- Toggle collected, remove, clear all work
- Sort automatically toggle works
- Share list generates URL, receiving shared list loads items
- Online/offline status detection works
- All 41 E2E tests pass
- All unit tests pass (rewritten)
