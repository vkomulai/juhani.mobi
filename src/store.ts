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

//  Ugly haxxx for local env
const DEFAULT_ITEMS = location && location.hostname !== 'localhost' ? //  eslint-disable-line
  [] :
  [{
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

export const useStore = create(
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

      itemsRecognized: (recognizedItems) => {
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

      removeItem: (item) => set((state) => ({
        shoppingItems: state.shoppingItems.filter(v => v.name !== item.name)
      })),

      collectedItemPressed: (item) => set((state) => {
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
        }).sort((a, b) => a.index - b.index)
        return { shoppingItems: newItems }
      }),

      readyPressed: () => set({ shoppingItems: [] }),

      itemsReOrdered: (oldIndex, newIndex) => set((state) => ({
        shoppingItems: arrayMove(state.shoppingItems, oldIndex, newIndex)
      })),

      onBoardingComplete: () => set((state) => ({
        onBoardingCompleted: !state.onBoardingCompleted
      })),

      setOnline: (online) => set({ isOnline: online }),

      setSortAutomatically: () => set((state) => ({
        sortAutomatically: !state.sortAutomatically
      })),

      fetchList: (listId) => {
        fetch(`${getApiHost()}/list/${listId}`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        }).then((response) => {
          return response.json()
        }).then((items) => {
          set({ shoppingItems: items })
        }).catch(error =>
          // eslint-disable-next-line no-console
          console.error('Fetching list failed: ', error)
        )
      },

      storeList: (listId) => {
        const { shoppingItems } = get()
        fetch(`${getApiHost()}/list/${listId}`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(shoppingItems)
        }).catch(error =>
          // eslint-disable-next-line no-console
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
        // Handle migration from redux-storage format (no 'state' wrapper)
        // redux-storage stored: {"shoppingItems":[...],"listening":false,...}
        // zustand persist stores: {"state":{...},"version":0}
        // When zustand reads old format, persisted will be the raw object
        if (persisted && typeof persisted === 'object') {
          return { ...current, ...persisted }
        }
        return current
      }
    }
  )
)

// Window event listeners
export const setupWindowListeners = () => {
  window.addEventListener('offline', () => {
    useStore.getState().setOnline(navigator.onLine)
  })
  window.addEventListener('online', () => {
    useStore.getState().setOnline(navigator.onLine)
  })
}

export const setupShareTargetListener = () => {
  window.addEventListener('DOMContentLoaded', () => {
    const url = new URL(window.location)
    if (url.searchParams && url.searchParams.get('url')) {
      const paramUrl = url.searchParams && url.searchParams.get('url')
      const paramText = (url.searchParams && url.searchParams.get('text')) || ''
      const paramTitle = (url.searchParams && url.searchParams.get('title')) || ''
      const recipeUrl = paramUrl || findUrlFromText(paramText) || findUrlFromText(paramTitle)
      //  Clean the url from the share target content
      history.pushState({}, null, window.location.origin) //  eslint-disable-line no-restricted-globals
      /** https://bugs.chromium.org/p/chromium/issues/detail?id=789379  */
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

const findUrlFromText = (text) => {
  const match = text.match(/^[\S\s]*\s*(?<url>https?:\/\/[^\s]+)$/)
  return match && match.groups && match.groups.url
}
