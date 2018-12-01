import _ from 'lodash'
import { combineReducers } from 'redux'
import { arrayMove } from 'react-sortable-hoc'
import { supportSpeechRecognition } from 'api/SpeechRecognitionAPI' 
import {
  ADD_ITEM_PRESSED,
  ITEMS_LISTENED,
  ITEMS_REORDERED,
  COLLECTED_ITEM_PRESSED,
  READY_PRESSED,
  REMOVE_ITEM,
  ONBOARDING_COMPLETED,
  ONLINE_CHANGED
} from '../actions'

//  Ugly haxxx for local env
const DEFAULT_ITEMS = location && location.hostname !== 'localhost' ? //  eslint-disable-line
  [] :  
  [ {
    name: 'banaani',
    collected: false,
    index: 0
  }, {
    name: 'appelsiini',
    collected: false,
    index: 1
  }, {
    name: 'kiwi',
    collected: false,
    index: 2
  }, {
    name: 'kahvi',
    collected: false,
    index: 3
  }]

const NOT_LISTENING = false

const listening = (state = NOT_LISTENING, action) => {
  switch (action.type) {
    case ADD_ITEM_PRESSED:
      return true
    case ITEMS_LISTENED:
      return false
    default:
      return state
  }
}

const isSpeechRecognitionSupported = () => supportSpeechRecognition()

const shoppingItems = (state = DEFAULT_ITEMS, action) => {
  switch (action.type) {
    case REMOVE_ITEM:
      return state.filter(v => v.name !== action.item.name)
    case READY_PRESSED:
      return []
    case COLLECTED_ITEM_PRESSED:
      return state.map((item, idx) => {
        if (action.item && action.item.name === item.name) {
          let lastCollectedIndex = state.findIndex(v => v.collected)
          if (lastCollectedIndex === -1) {
            lastCollectedIndex = state.length
          }
          return { 
            ...item, 
            collected: !item.collected, 
            index: lastCollectedIndex
          }
        } else {
          return { 
            ...item, 
            index: idx
          }
        }
      }).sort((a,b) => a.index - b.index)
    case ITEMS_REORDERED:
      return arrayMove(state, action.oldIndex, action.newIndex)
    case ITEMS_LISTENED:
      return _.unionBy(state, action.recognizedItems, 'name')
    default:
      return state
  }
}

const isOnline = (state = true, action) => {
  switch (action.type) {
    case ONLINE_CHANGED:
      return action.payload
  default:
    return state
  }
}

const onBoardingCompleted = (state = false, action) => {
  switch (action.type) {
    case ONBOARDING_COMPLETED:
      return !state
    default:
      return false
  }
}

const shoppingApp = combineReducers({
  shoppingItems,
  listening,
  isSpeechRecognitionSupported,
  onBoardingCompleted,
  isOnline
})
export default shoppingApp
