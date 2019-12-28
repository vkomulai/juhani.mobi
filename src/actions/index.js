import { scrapeRecipe } from 'api/RecipeScrapeAPI'
import {
  sendItemsRecognizedEvent,
  sendClientError,
  sendUnknownItems
} from 'api/Analytics'
import { getItemsWithUnknownOrder } from 'api/MarketCategories'


export const ADD_ITEM_PRESSED = 'ADD_ITEM_PRESSED'
export const ITEMS_LISTENED = 'ITEMS_LISTENED'
export const ITEMS_LIST_LOADED = 'ITEM_LIST_LOADED'
export const ANALYZE_ITEMS = 'ANALYZE_ITEMS'
export const ITEMS_REORDERED = 'ITEMS_REORDERED'
export const COLLECTED_ITEM_PRESSED = 'COLLECTED_ITEM_PRESSED'
export const READY_PRESSED = 'READY_PRESSED'
export const REMOVE_ITEM = 'REMOVE_ITEM'
export const ONBOARDING_COMPLETED = 'ONBOARDING_COMPLETED'
export const ONLINE_CHANGED = 'ONLINE_CHANGED'
export const SORT_CHANGED = 'SORT_CHANGED'
export const SHARE_TARGET_EVENT = 'SHARE_TARGET_EVENT'

export const addItemPressed = () => ({ type: ADD_ITEM_PRESSED })

export const itemsRecognized = (recognizedItems) => {
  return (dispatch, getState) => {
    const { sortAutomatically } = getState()
    dispatch({
      type: ITEMS_LISTENED,
      recognizedItems,
      sortAutomatically
    })
    const unknownItems = getItemsWithUnknownOrder(recognizedItems)
    if (unknownItems.length > 0) {
      sendUnknownItems(unknownItems)
    }
  }
}

export const itemsReOrdered = (oldIndex, newIndex) => ({ type: ITEMS_REORDERED, oldIndex, newIndex })

export const collectedItemPressed = (item) => ({ type: COLLECTED_ITEM_PRESSED, item })

export const removeItemPressed = (item) => ({ type: REMOVE_ITEM, item })

export const readyPressed = () => ({ type: READY_PRESSED })

export const onboardingCompleted = () => ({ type: ONBOARDING_COMPLETED })

export const sortAutomaticallyChanged = () => ({ type: SORT_CHANGED })

export const listenToWindowEvent = (eventName) => {
  return (dispatch) => window.addEventListener(eventName, () => {
    return dispatch({ type: ONLINE_CHANGED, payload: navigator.onLine })
  })
}

export const listenToShareTargetEvent = () => {
  return (dispatch) => window.addEventListener('DOMContentLoaded', () => {
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
            dispatch(itemsRecognized(items))
            sendItemsRecognizedEvent(items)
          })
          .catch(err => sendClientError(`Could not parse share data from url=${recipeUrl}, err=${err}`))
      } else (
        sendClientError('Could not parse share data from url=' + url)
      )
    }
  })
}

export const fetchList = (listId) => (dispatch) => {
  fetch(`/list/${listId}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  }).then((response) => {
    return response.json()
  }).then((items) => {
    dispatch({
      type: ITEMS_LIST_LOADED,
      items
    })
  }).catch(error =>
    // eslint-disable-next-line no-console
    console.error('Fetching list failed: ', error)
  )
}

export const storeList = (listId) => (dispatch, getState) => {
  const { shoppingItems } = getState()
  fetch(`/list/${listId}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(shoppingItems)
  }).then(() =>
    dispatch({ LIST_ID: listId })
  ).catch(error =>
    // eslint-disable-next-line no-console
    console.error('Storing list failed: ', error)
  )

}


const findUrlFromText = (text) => {
  const match = text.match(/^[\S\s]*\s*(?<url>https?:\/\/[^\s]+)$/)
  return match && match.groups && match.groups.url
}
