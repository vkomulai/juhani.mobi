import * as Sentry from '@sentry/react'

const config = {
  sentry: {
    dsn: 'https://90f802bdd8404cd3a97e2e37b55661c4@sentry.io/286831'
  },
  ga4: {
    measurementId: 'G-XXXXXXXXXX' // TODO: Get from GA4 console
  }
}

const isProduction = () => location.hostname !== 'localhost' //  eslint-disable-line

const sendAnalyticsEvent = (eventName, eventValue) => {
  if (isProduction()) {
    try {
      window.gtag('event', eventName, { event_category: 'UserInteraction', value: eventValue })
    } catch (e) {
      console.log('sendAnalyticsEvent(): ', eventName, e) //  eslint-disable-line
    }
  } else {
    console.log('sendAnalyticsEvent(): ', eventName) //  eslint-disable-line
  }
}

export const sendClientError = (error) => {
  Sentry.captureMessage(error, 'error')
}

export const sendUnknownItems = (items) => {
  if (items && items.length > 0) {
    Sentry.captureMessage(`Unknown items added to list: [${items.join(',')}]`, 'info')
  }
}

export const initializeAnalytics = () => {
  if (isProduction() || process.env.REACT_APP_SIMULATE_ANALYTICS_PRODUCTION) {
    Sentry.init({ dsn: config.sentry.dsn })
    console.log('initializeAnalytics() : done') //  eslint-disable-line
  }
}

export const sendApplicationLoadedEvent = () => {
  sendAnalyticsEvent('Application Loaded')
}

export const sendAddButtonPressedEvent = () => {
  sendAnalyticsEvent('AddButtonPressed')
}

export const sendEmptyButtonPressedEvent = () => {
  sendAnalyticsEvent('EmptyButtonPressed')
}

export const sendItemOrderChangedEvent = () => {
  sendAnalyticsEvent('ItemOrderChanged')
}

export const sendItemCollectedEvent = () => {
  sendAnalyticsEvent('ItemCollected')
}

export const sendItemRemovedEvent = () => {
  sendAnalyticsEvent('ItemRemoved')
}

export const sendItemsRecognizedEvent = (items) => {
  sendAnalyticsEvent('ItemsRecognized', items.toString())
}
