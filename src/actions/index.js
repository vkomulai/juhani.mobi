export const ADD_ITEM_PRESSED = 'ADD_ITEM_PRESSED'
export const ITEMS_LISTENED = 'ITEMS_LISTENED'
export const ITEMS_REORDERED = 'ITEMS_REORDERED'
export const COLLECTED_ITEM_PRESSED = 'COLLECTED_ITEM_PRESSED'
export const READY_PRESSED = 'READY_PRESSED'
export const REMOVE_ITEM = 'REMOVE_ITEM'
export const ONBOARDING_COMPLETED = 'ONBOARDING_COMPLETED'
export const ONLINE_CHANGED = 'ONLINE_CHANGED'

export const addItemPressed = () => ({ type: ADD_ITEM_PRESSED })

export const itemsRecognized = (recognizedItems) => ({ type: ITEMS_LISTENED, recognizedItems })

export const itemsReOrdered = (oldIndex, newIndex) => ({ type: ITEMS_REORDERED, oldIndex, newIndex })

export const collectedItemPressed = (item) => ({ type: COLLECTED_ITEM_PRESSED, item })

export const removeItemPressed = (item) => ({ type: REMOVE_ITEM, item })

export const readyPressed = () => ({ type: READY_PRESSED })

export const onboardingCompleted = () => ({ type: ONBOARDING_COMPLETED })

export const listenToWindowEvent = (eventName) => {
  return (dispatch) => window.addEventListener(eventName, () => {
    return dispatch({ type: ONLINE_CHANGED, payload: navigator.onLine })
  })
}