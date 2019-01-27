import { shoppingItems } from './index.js'
import {
  ITEMS_LISTENED,
  REMOVE_ITEM,
  ITEMS_REORDERED,
  READY_PRESSED
} from 'actions'

const STATE_EMPTY  = []
const STATE_SIPULI_SAIPPUA_WCPAPERI = [
  { name: 'sipuli', collected: false },
  { name: 'saippua', collected: false },
  { name: 'wc-paperi', collected: false }
]

describe('shoppingApp', () => {
  describe('shoppingItems', () => { 
    it('defaults to empty list', () => {
      expect(shoppingItems(STATE_EMPTY, {}).length).toBe(0)
    })

    it('empties a list', () => {
      const emptyList = { type: READY_PRESSED }
      const newState = shoppingItems(STATE_SIPULI_SAIPPUA_WCPAPERI, emptyList)
      expect(newState.length).toBe(0)
    })

    it('adds items to empty state in given order when no sorting applied', () => {
      const addItems = {
        type: ITEMS_LISTENED,
        recognizedItems: [
          { name: 'pesuaine', collected: false },
          { name: 'banaani', collected: false },
          { name: 'talouspaperi', collected: false }
        ],
        sortAutomatically: false
      }
      const newState = shoppingItems(STATE_EMPTY, addItems)
      expect(newState.length).toBe(3)
      expect(newState[0].name).toBe('pesuaine')
      expect(newState[1].name).toBe('banaani')
      expect(newState[2].name).toBe('talouspaperi')
    })
    
    it('adds items to empty state in automatically sorted order when sorting applied', () => {
      const addItems = {
        type: ITEMS_LISTENED,
        recognizedItems: [
          { name: 'pesuaine', collected: false },
          { name: 'banaani', collected: false },
          { name: 'talouspaperi', collected: false }
        ],
        sortAutomatically: true
      }
      const newState = shoppingItems(STATE_EMPTY, addItems)
      expect(newState.length).toBe(3)
      expect(newState[0].name).toBe('banaani')
      expect(newState[1].name).toBe('pesuaine')
      expect(newState[2].name).toBe('talouspaperi')
    })

    it('removes one item from list', () => {
      const removeItem = {
        type: REMOVE_ITEM,
        item: { name: 'saippua', collected: false }
      }
      const newState = shoppingItems(STATE_SIPULI_SAIPPUA_WCPAPERI, removeItem)
      expect(newState.length).toBe(2)
      expect(newState[0].name).toBe('sipuli')
      expect(newState[1].name).toBe('wc-paperi')
    })

    it('reorders an item in a list', () => {
      const reOrderItems = {
        type: ITEMS_REORDERED,
        oldIndex: 2, 
        newIndex: 0 
      }

      const newState = shoppingItems(STATE_SIPULI_SAIPPUA_WCPAPERI, reOrderItems)
      expect(newState.length).toBe(3)
      expect(newState[0].name).toBe('wc-paperi')
      expect(newState[1].name).toBe('sipuli')
      expect(newState[2].name).toBe('saippua')
    })

  })
})