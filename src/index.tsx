import React from 'react'
import { createRoot } from 'react-dom/client'
import {
  BrowserRouter as Router,
  Route,
  Routes
} from 'react-router-dom'

import { register } from 'registerServiceWorker'
import { App } from 'App'
import {
  initializeAnalytics,
  sendApplicationLoadedEvent
} from './api/Analytics'
import { setupWindowListeners, setupShareTargetListener } from './store'

setupWindowListeners()
setupShareTargetListener()
initializeAnalytics()
sendApplicationLoadedEvent()

createRoot(document.getElementById('root')).render(
  <Router>
    <Routes>
      <Route path='/l/:id' element={<App />} />
      <Route path='/' element={<App />} />
    </Routes>
  </Router>
)

register()
