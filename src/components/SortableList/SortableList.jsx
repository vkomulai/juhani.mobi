import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useStore } from 'store'
import {
  sendItemCollectedEvent,
  sendItemRemovedEvent,
  sendItemOrderChangedEvent
} from 'api/Analytics'
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

import './SortableList.css'

/* eslint-disable react/prop-types */
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
          <span className={item.collected ? 'item-collected' : 'item-normal'}>{item.name}</span>
        </div>
        <span onClick={() => onRemove(item)}>&#x1f5d1;</span>
      </div>
    </li>
  )
}
/* eslint-enable react/prop-types */

export function SortableList() {
  const { id } = useParams()
  const shoppingItems = useStore((s) => s.shoppingItems)
  const removeItem = useStore((s) => s.removeItem)
  const collectedItemPressed = useStore((s) => s.collectedItemPressed)
  const itemsReOrdered = useStore((s) => s.itemsReOrdered)
  const fetchList = useStore((s) => s.fetchList)

  useEffect(() => {
    if (id) {
      fetchList(id)
    }
  }, [id, fetchList])

  const sensors = useSensors(
    useSensor(TouchSensor, { activationConstraint: { delay: 500, tolerance: 5 } }),
    useSensor(MouseSensor, { activationConstraint: { delay: 500, tolerance: 5 } })
  )

  const handleRemove = (item) => {
    sendItemRemovedEvent()
    removeItem(item)
  }

  const handleCollected = (item) => {
    sendItemCollectedEvent()
    collectedItemPressed(item)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      sendItemOrderChangedEvent()
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
                onCollected={handleCollected}
                onRemove={handleRemove}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  )
}
