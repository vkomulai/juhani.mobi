import React from 'react'
import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'

import './SortableList.css'
import { SortableContainer, SortableElement } from 'react-sortable-hoc'

const SortableItem = SortableElement(({ item, onCollected, onRemove }) => {
  return (
    <li key={item}>
      <div className="items-container">
        <div className="item-container" onClick={() => onCollected(item)}>
          <input type="checkbox" checked={item.collected} readOnly />
          <span className={item.collected ? 'item-collected' : 'item-normal'}>{item.name}</span>
        </div>
        <span onClick={() => onRemove(item)}>&#x1f5d1;</span>
      </div>
    </li>
  )
})

const Sortable = SortableContainer(({ shoppingItems, onCollected, onRemove }) => {
  return (
    <ul>
      {shoppingItems.map((value, index) => (
        <SortableItem key={`item-${index}`} index={index} item={value} onCollected={onCollected} onRemove={onRemove} />
      ))}
    </ul>
  )
})

class SortableListInner extends React.Component {
  static propTypes = {
    shoppingItems: PropTypes.array.isRequired,
    collectedItem: PropTypes.func.isRequired,
    removeItem: PropTypes.func.isRequired,
    onSortEnd: PropTypes.func.isRequired,
    fetchList: PropTypes.func.isRequired,
    listId: PropTypes.string
  }

  componentDidMount() {
    if (this.props.listId) {
      this.props.fetchList(this.props.listId)
    }
  }

  render() {
    return (
      <div className="items">
        <Sortable
          shoppingItems={this.props.shoppingItems}
          pressDelay={500}
          onCollected={this.props.collectedItem}
          onRemove={this.props.removeItem}
          onSortEnd={this.props.onSortEnd}
        />
      </div>
    )
  }
}

export function SortableList(props) {
  const { id } = useParams()
  return <SortableListInner {...props} listId={id} />
}
