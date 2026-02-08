# Phase 6: react-sortable-hoc → @dnd-kit

**Size:** Medium
**Prerequisites:** Phase 5 (Zustand)
**Blocks:** None

## Overview

Replace deprecated `react-sortable-hoc` with `@dnd-kit`. Convert `SortableList` from a class component to a functional component. Configure touch sensor with 500ms activation delay (matching current `pressDelay={500}`). The `arrayMove` utility from react-sortable-hoc used in reducers is already moved to Zustand store in Phase 5.

## Packages

### Remove
- `react-sortable-hoc` — deprecated drag-and-drop library

### Add
- `@dnd-kit/core` — core drag-and-drop primitives
- `@dnd-kit/sortable` — sortable preset
- `@dnd-kit/utilities` — CSS utilities

## Files to Modify

| File | Change |
|---|---|
| `src/components/SortableList/SortableList.jsx` | Full rewrite to @dnd-kit |
| `src/store.ts` | Replace `arrayMove` import from react-sortable-hoc with `@dnd-kit/sortable` |

## Step-by-Step Tasks

### 1. Replace arrayMove in store

**Before:**
```js
import { arrayMove } from 'react-sortable-hoc'
```

**After:**
```js
import { arrayMove } from '@dnd-kit/sortable'
```

### 2. Rewrite SortableList component

**Current structure:**
- `SortableItem` = `SortableElement(...)` HOC wrapper
- `Sortable` = `SortableContainer(...)` HOC wrapper
- `SortableList` = class component with `withRouter`, `componentDidMount`

**Target structure:**
```jsx
import { useParams } from 'react-router-dom'
import {
  DndContext,
  closestCenter,
  TouchSensor,
  MouseSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useStore } from 'store'

const SortableItem = ({ item, onCollected, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.name
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div className="items-container">
        <div className="item-container" onClick={() => onCollected(item)}>
          <input type="checkbox" checked={item.collected} readOnly />
          <span className={item.collected ? 'item-collected' : 'item-normal'}>
            {item.name}
          </span>
        </div>
        <span onClick={() => onRemove(item)}>🗑</span>
      </div>
    </li>
  )
}

export const SortableList = () => {
  const { id } = useParams()
  const { shoppingItems, collectedItem, removeItem, itemsReOrdered, fetchList } = useStore()

  useEffect(() => {
    if (id) fetchList(id)
  }, [id])

  const sensors = useSensors(
    useSensor(TouchSensor, { activationConstraint: { delay: 500, tolerance: 5 } }),
    useSensor(MouseSensor, { activationConstraint: { delay: 500, tolerance: 5 } })
  )

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      const oldIndex = shoppingItems.findIndex(i => i.name === active.id)
      const newIndex = shoppingItems.findIndex(i => i.name === over.id)
      itemsReOrdered(oldIndex, newIndex)
    }
  }

  return (
    <div className="items">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={shoppingItems.map(i => i.name)} strategy={verticalListSortingStrategy}>
          <ul>
            {shoppingItems.map(item => (
              <SortableItem
                key={item.name}
                item={item}
                onCollected={collectedItem}
                onRemove={removeItem}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  )
}
```

### 3. Update CSS

The `SortableList.css` may need updates for @dnd-kit's transform-based dragging vs react-sortable-hoc's approach. Key considerations:
- @dnd-kit uses CSS transforms for drag animation
- Add `touch-action: none` to sortable items for mobile
- Drag overlay styling (if using DragOverlay)

### 4. Update E2E drag-and-drop test

The Playwright E2E test for drag-and-drop reorder may need adjustment if the DOM structure or drag mechanism changes. @dnd-kit uses `aria-` attributes and transforms rather than cloning elements.

## Risks

- **Touch behavior:** `pressDelay` in react-sortable-hoc vs `delay` activation constraint in @dnd-kit may feel slightly different. Test on mobile.
- **Item identity:** @dnd-kit requires unique string IDs. Using `item.name` assumes no duplicate item names (which is enforced by `unionBy` in the store).
- **E2E test breakage:** Drag-and-drop E2E test simulates mouse drag events. @dnd-kit's sensor system may handle synthetic events differently.
- **CSS changes:** The visual appearance during drag may differ. Ensure the dragged item is visually distinguished.

## Verification

- Long-press (500ms) on an item initiates drag on mobile
- Mouse drag works on desktop
- Items can be reordered by dragging
- Reorder persists to localStorage
- Collect/remove buttons still work (not intercepted by drag)
- All 41 E2E tests pass (especially drag-reorder test)
- All unit tests pass
