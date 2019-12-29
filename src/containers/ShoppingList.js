import { connect } from 'react-redux'
import { SortableList } from 'components'
import {
  removeItemPressed,
  collectedItemPressed,
  itemsReOrdered,
  fetchList
} from 'actions'
import {
  sendItemCollectedEvent,
  sendItemRemovedEvent,
  sendItemOrderChangedEvent
} from 'api/Analytics'

const mapStateToProps = state => ({
  shoppingItems: state.shoppingItems
})

const mapDispatchToProps = dispatch => ({
  removeItem: (item) => {
    sendItemRemovedEvent()
    dispatch(removeItemPressed(item))
  },
  collectedItem: (item) => {
    sendItemCollectedEvent()
    dispatch(collectedItemPressed(item))
  },
  onSortEnd: (event) => {
    sendItemOrderChangedEvent()
    dispatch(itemsReOrdered(event.oldIndex, event.newIndex))
  },
  fetchList: (id) => {
    dispatch(fetchList(id))
  }
})

export const ShoppingList = connect(mapStateToProps, mapDispatchToProps)(SortableList)
