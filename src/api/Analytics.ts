import * as Sentry from '@sentry/react'
import { ShoppingItem } from 'types'

const config = {
  sentry: {
    dsn: 'https://90f802bdd8404cd3a97e2e37b55661c4@sentry.io/286831'
  },
  ga4: {
    measurementId: 'G-XXXXXXXXXX' // TODO: Get from GA4 console
  }
}

const isProduction = (): boolean => location.hostname !== 'localhost'

const sendAnalyticsEvent = (eventName: string, eventValue?: string): void => {
  if (isProduction()) {
    try {
      window.gtag('event', eventName, { event_category: 'UserInteraction', value: eventValue })
    } catch (e) {
      console.log('sendAnalyticsEvent(): ', eventName, e)
    }
  } else {
    console.log('sendAnalyticsEvent(): ', eventName)
  }
}

export const sendClientError = (error: string): void => {
  Sentry.captureMessage(error, 'error')
}

export const sendUnknownItems = (items: string[]): void => {
  if (items && items.length > 0) {
    Sentry.captureMessage(`Unknown items added to list: [${items.join(',')}]`, 'info')
  }
}

export const initializeAnalytics = (): void => {
  if (isProduction() || process.env.REACT_APP_SIMULATE_ANALYTICS_PRODUCTION) {
    Sentry.init({ dsn: config.sentry.dsn })
    console.log('initializeAnalytics() : done')
  }
}

export const sendApplicationLoadedEvent = (): void => {
  sendAnalyticsEvent('Application Loaded')
}

export const sendAddButtonPressedEvent = (): void => {
  sendAnalyticsEvent('AddButtonPressed')
}

export const sendEmptyButtonPressedEvent = (): void => {
  sendAnalyticsEvent('EmptyButtonPressed')
}

export const sendItemOrderChangedEvent = (): void => {
  sendAnalyticsEvent('ItemOrderChanged')
}

export const sendItemCollectedEvent = (): void => {
  sendAnalyticsEvent('ItemCollected')
}

export const sendItemRemovedEvent = (): void => {
  sendAnalyticsEvent('ItemRemoved')
}

export const sendItemsRecognizedEvent = (items: ShoppingItem[]): void => {
  sendAnalyticsEvent('ItemsRecognized', items.toString())
}
