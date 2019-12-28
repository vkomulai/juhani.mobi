import React from 'react'
import ReactDOM from 'react-dom'
import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom'
import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import * as storage from 'redux-storage'
import createEngine from 'redux-storage-engine-localstorage'
import { Provider } from 'react-redux'

import { register } from 'registerServiceWorker.js'
import { App } from 'App'
import shoppingApp from 'reducers'
import {
  initializeAnalytics,
  sendApplicationLoadedEvent
} from './api/Analytics'
import {
  listenToWindowEvent,
  listenToShareTargetEvent
} from './actions'

const engine = createEngine('juhani.mobi')
const middleware = storage.createMiddleware(engine)
const createStoreWithMiddleware = applyMiddleware(thunkMiddleware, middleware)(createStore)
const load = storage.createLoader(engine)

const reducer = storage.reducer(shoppingApp)
const store = createStoreWithMiddleware(reducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())
store.dispatch(listenToWindowEvent('offline'))
store.dispatch(listenToWindowEvent('online'))
store.dispatch(listenToShareTargetEvent())


load(store)
initializeAnalytics()
sendApplicationLoadedEvent()

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <Switch>
        <Route path='/l/:id' component={App} />
        <Route path='/' component={App} />
      </Switch>
    </Router>
  </Provider>,
  document.getElementById('root')
)

register()