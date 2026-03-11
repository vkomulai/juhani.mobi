import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { arrayMove } from '@dnd-kit/sortable'
import { supportSpeechRecognition } from 'api/SpeechRecognitionAPI'
import { getItemOrder, getItemsWithUnknownOrder } from 'api/MarketCategories'
import { getApiHost } from 'api/Utils'
import { scrapeRecipe } from 'api/RecipeScrapeAPI'
import {
  sendItemsRecognizedEvent,
  sendClientError,
  sendUnknownItems
} from 'api/Analytics'
import { ShoppingItem } from 'types'

interface StoreState {
  shoppingItems: ShoppingItem[]
  listening: boolean
  isSpeechRecognitionSupported: boolean
  onBoardingCompleted: boolean
  isOnline: boolean
  sortAutomatically: boolean
  addItemPressed: () => void
  itemsRecognized: (recognizedItems: ShoppingItem[]) => void
  removeItem: (item: ShoppingItem) => void
  collectedItemPressed: (item: ShoppingItem) => void
  readyPressed: () => void
  itemsReOrdered: (oldIndex: number, newIndex: number) => void
  onBoardingComplete: () => void
  setOnline: (online: boolean) => void
  setSortAutomatically: () => void
  fetchList: (listId: string) => void
  storeList: (listId: string) => void
}

//  Ugly haxxx for local env
const DEFAULT_ITEMS: ShoppingItem[] = location && location.hostname !== 'localhost'
  ? []
  : [{
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

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // State
      shoppingItems: DEFAULT_ITEMS,
      listening: false,
      isSpeechRecognitionSupported: supportSpeechRecognition(),
      onBoardingCompleted: false,
      isOnline: true,
      sortAutomatically: true,

      // Actions
      addItemPressed: () => set({ listening: true }),

      itemsRecognized: (recognizedItems: ShoppingItem[]) => {
        const { shoppingItems, sortAutomatically } = get()
        const existingNames = new Set(shoppingItems.map(i => i.name))
        const merged = [...shoppingItems, ...recognizedItems.filter(i => !existingNames.has(i.name))]
        const items = sortAutomatically
          ? merged.sort((a, b) => getItemOrder(a.name) - getItemOrder(b.name))
          : merged
        const unknownItems = getItemsWithUnknownOrder(recognizedItems)
        if (unknownItems.length > 0) {
          sendUnknownItems(unknownItems)
        }
        set({ shoppingItems: items, listening: false })
      },

      removeItem: (item: ShoppingItem) => set((state) => ({
        shoppingItems: state.shoppingItems.filter(v => v.name !== item.name)
      })),

      collectedItemPressed: (item: ShoppingItem) => set((state) => {
        const newItems = state.shoppingItems.map((current, idx) => {
          if (item && item.name === current.name) {
            let lastCollectedIndex = state.shoppingItems.findIndex(v => v.collected)
            if (lastCollectedIndex === -1) {
              lastCollectedIndex = state.shoppingItems.length
            }
            return {
              ...current,
              collected: !current.collected,
              index: lastCollectedIndex
            }
          } else {
            return {
              ...current,
              index: idx
            }
          }
        }).sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
        return { shoppingItems: newItems }
      }),

      readyPressed: () => set({ shoppingItems: [] }),

      itemsReOrdered: (oldIndex: number, newIndex: number) => set((state) => ({
        shoppingItems: arrayMove(state.shoppingItems, oldIndex, newIndex)
      })),

      onBoardingComplete: () => set((state) => ({
        onBoardingCompleted: !state.onBoardingCompleted
      })),

      setOnline: (online: boolean) => set({ isOnline: online }),

      setSortAutomatically: () => set((state) => ({
        sortAutomatically: !state.sortAutomatically
      })),

      fetchList: (listId: string) => {
        fetch(`${getApiHost()}/list/${listId}`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        }).then((response) => {
          return response.json()
        }).then((items: ShoppingItem[]) => {
          set({ shoppingItems: items })
        }).catch(error =>
          console.error('Fetching list failed: ', error)
        )
      },

      storeList: (listId: string) => {
        const { shoppingItems } = get()
        fetch(`${getApiHost()}/list/${listId}`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(shoppingItems)
        }).catch(error =>
          console.error('Storing list failed: ', error)
        )
      }
    }),
    {
      name: 'juhani.mobi',
      partialize: (state) => ({
        shoppingItems: state.shoppingItems,
        onBoardingCompleted: state.onBoardingCompleted,
        sortAutomatically: state.sortAutomatically
      }),
      merge: (persisted, current) => {
        if (persisted && typeof persisted === 'object') {
          return { ...(current as StoreState), ...(persisted as Partial<StoreState>) }
        }
        return current as StoreState
      }
    }
  )
)

// Window event listeners
export const setupWindowListeners = (): void => {
  window.addEventListener('offline', () => {
    useStore.getState().setOnline(navigator.onLine)
  })
  window.addEventListener('online', () => {
    useStore.getState().setOnline(navigator.onLine)
  })
}

export const setupShareTargetListener = (): void => {
  window.addEventListener('DOMContentLoaded', () => {
    const url = new URL(window.location.href)
    if (url.searchParams && url.searchParams.get('url')) {
      const paramUrl = url.searchParams.get('url')
      const paramText = url.searchParams.get('text') || ''
      const paramTitle = url.searchParams.get('title') || ''
      const recipeUrl = paramUrl || findUrlFromText(paramText) || findUrlFromText(paramTitle)
      history.pushState({}, '', window.location.origin)
      if (recipeUrl) {
        scrapeRecipe(recipeUrl)
          .then(items => {
            useStore.getState().itemsRecognized(items)
            sendItemsRecognizedEvent(items)
          })
          .catch(err => sendClientError(`Could not parse share data from url=${recipeUrl}, err=${err}`))
      } else {
        sendClientError('Could not parse share data from url=' + url)
      }
    }
  })
}

const findUrlFromText = (text: string): string | undefined => {
  const match = text.match(/^[\S\s]*\s*(?<url>https?:\/\/[^\s]+)$/)
  return match?.groups?.url
}
