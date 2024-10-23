import ReactGA from 'react-ga'
import Raven from 'raven-js'
const config = {
  ga: 'UA-113979141-1',
  sentry: {
    account: '90f802bdd8404cd3a97e2e37b55661c4',
    project: '286831'
  },
  hotjar: {
    id: '778873',
    version: '6'
  }
}

const isProduction = () => location.hostname !== 'localhost'//  eslint-disable-line

const sendAnalyticsEvent = (eventName, eventValue) => {
  if (isProduction()) {
    try {
      ReactGA.event({ category: 'UserInteraction', action: eventName, value: eventValue })
    } catch (e) {
      console.log('sendAnalyticsEvent(): ', eventName, e) //  eslint-disable-line
    }
  } else {
    console.log('sendAnalyticsEvent(): ', eventName) //  eslint-disable-line
  }
}

export const sendClientError = (error) => {
  Raven.captureMessage(error, {
    level: 'error' // one of 'info', 'warning', or 'error'
  })
}

export const sendUnknownItems = (items) => {
  Raven.captureMessage(`Unknown items added to list: [${items.join(',')}]`, {
    level: 'info' // one of 'info', 'warning', or 'error'
  })
}

export const initializeAnalytics = () => {
  if (isProduction || process.envs.REACT_APP_SIMULATE_ANALYTICS_PRODUCTION) {
    ReactGA.initialize(config.ga)
    Raven
      .config(`https://${config.sentry.account}@sentry.io/${config.sentry.project}`)
      .install()
    console.log('initializeAnalytics() : done')//  eslint-disable-line
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


