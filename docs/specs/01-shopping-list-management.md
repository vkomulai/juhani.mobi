# 01 — Shopping List Management

## Overview

The shopping list is the core feature of Juhani.mobi. Users add items via speech recognition, view them in a sortable list, mark items as collected, remove individual items, clear the entire list, and reorder items via drag-and-drop.

## User-Facing Behavior

### Adding Items

- Items are added via the speech recognition callback (not typed manually).
- Pressing the **Lisää** (Add) button starts listening; when speech ends, recognized items are dispatched to the store.
- New items are deduplicated against existing items by `name` using `_.unionBy(existingItems, newItems, 'name')`.
- If automatic sorting is enabled (default), items are sorted by market category order after adding.
- Each item has the shape `{ name: string, collected: boolean, index: number }`.
- Item names are displayed capitalized as-is from the speech recognition output.

### Viewing the List

- Items render in a `<ul>` as `<li>` elements inside the `.items` container.
- Each item row shows: a checkbox (read-only visual indicator), the item name, and a trash icon (🗑).
- Uncollected items appear with class `item-normal`; collected items have class `item-collected` (strikethrough styling).

### Marking Items as Collected

- Clicking anywhere on the item text/checkbox area toggles the `collected` flag.
- When an item is marked collected, it is repositioned to the end of the uncollected items (just before the first already-collected item, or at the end if no collected items exist).
- When an item is uncollected, it gets its current array index as its `index` and is re-sorted by `index`.
- The list re-sorts after every toggle via `Array.sort((a, b) => a.index - b.index)`.

### Removing Items

- Clicking the trash icon (🗑, Unicode `\u{1f5d1}`) removes the item from the list.
- Removal filters by `name`: `state.filter(v => v.name !== action.item.name)`.

### Clearing the List

- The **Tyhjennä** (Empty) button dispatches `READY_PRESSED`, which sets `shoppingItems` to `[]`.
- The button is **disabled** when:
  - The list is empty (`shoppingItems.length === 0`), OR
  - The app is offline (`isOnline === false`).

### Drag-and-Drop Reordering

- Uses `react-sortable-hoc` with `pressDelay={500}` (500ms long-press to initiate drag).
- On sort end, dispatches `ITEMS_REORDERED` with `oldIndex` and `newIndex`.
- Reducer uses `arrayMove(state, oldIndex, newIndex)` from `react-sortable-hoc`.

### Default Items (localhost only)

- On `localhost`, if localStorage is empty, 4 default items are loaded: `banaani`, `appelsiini`, `kiwi`, `kahvi` (all uncollected, indexed 0–3).
- On production, the default is an empty array.

## Key Source Files

| File | Role |
|------|------|
| `src/containers/AddButton.js` | Connects Add button; dispatches `addItemPressed()` then `startListening()` |
| `src/containers/EmptyButton.js` | Connects Empty button; enabled when items exist AND online |
| `src/containers/ShoppingList.js` | Connects `SortableList` component to Redux |
| `src/components/SortableList/SortableList.jsx` | Renders sortable list items with collected/remove handlers |
| `src/reducers/index.js` | All shopping list state mutations |
| `src/actions/index.js` | Action creators and thunks |

## Acceptance Criteria

1. Adding items via speech appends them to the list (deduplicated by name).
2. Collected items show strikethrough (`item-collected` class) and move below uncollected items.
3. Uncollecting an item moves it back into position among uncollected items.
4. Trash icon removes the specific item by name.
5. Empty button clears all items; disabled when list is empty or offline.
6. Long-press (500ms) initiates drag-and-drop reorder.
7. On localhost with empty state, 4 default items appear.

## Edge Cases

- Adding an item with the same name as an existing item: the duplicate is ignored (`_.unionBy` deduplication).
- Removing an item when multiple items share the same name: all items with that name are removed (filter by name, not index).
- Collecting the last uncollected item: it stays in place (index = state.length since `findIndex` returns -1, fallback to `state.length`).
- Empty button click while offline: button is disabled, no action possible.
- Drag-and-drop with only 1 item: no-op (oldIndex === newIndex).
