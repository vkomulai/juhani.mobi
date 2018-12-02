import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import * as storage from 'redux-storage'
import createEngine from 'redux-storage-engine-localstorage'
import { Provider } from 'react-redux'

import registerServiceWorker from 'registerServiceWorker.js'
import { App } from 'App'
import shoppingApp from 'reducers'
import { 
  initializeAnalytics,
  sendApplicationLoadedEvent
 } from './api/Analytics'
import { listenToWindowEvent } from './actions'

const engine = createEngine('juhani.mobi')
const middleware = storage.createMiddleware(engine)
const createStoreWithMiddleware = applyMiddleware(thunkMiddleware, middleware)(createStore)
const load = storage.createLoader(engine)

const reducer = storage.reducer(shoppingApp)
const store = createStoreWithMiddleware(reducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())
store.dispatch(listenToWindowEvent('offline'))
store.dispatch(listenToWindowEvent('online'))

load(store)
initializeAnalytics()
sendApplicationLoadedEvent()

ReactDOM.render(
  <Provider store={ store }>
    <App />
  </Provider>,
  document.getElementById('root')
)

registerServiceWorker()