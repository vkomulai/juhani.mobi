import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { withNamespaces } from 'react-i18next'
import robotWaiting from './robot-waiting.png'
import robotListening from './robot-listening.png'
import './InfoView.css'

export const InfoView = withNamespaces()(
  ({ emptyShoppingList, listening, isSpeechRecognitionSupported, isOnline, t }) => {
    const { mainText, subText } = getInfoText(listening, emptyShoppingList, isSpeechRecognitionSupported, isOnline, t)
    return (
      <div className="info-view">
        <div
          className={classNames('mui-panel info-area', {
            listening,
            'speech-not-supported': !isSpeechRecognitionSupported || !isOnline
          })}
        >
          <div className="icon-container">
            <img
              id="info-icon"
              alt="info-icon"
              className={listening ? 'info-icon-listening' : 'info-icon-normal'}
              src={listening ? robotListening : robotWaiting}
            />
          </div>
          <div className="info-text">
            {mainText}
            <br />
            {subText}
          </div>
        </div>
      </div>
    )
  }
)

const getInfoText = (listening, emptyShoppingList, isSpeechRecognitionSupported, isOnline, t) => {
  if (!isOnline) {
    return {
      mainText: 'Selaimesi offline-tilassa!',
      subText: 'Puheentunnistus ei toimi'
    }
  } else if (!isSpeechRecognitionSupported) {
    return {
      mainText: t('infoView.mainText.iamJuhani'),
      subText: t('infoView.subText.speechReconigtionNotSupported')
    }
  } else if (!listening && emptyShoppingList) {
    return {
      mainText: t('infoView.mainText.iamJuhani'),
      subText: t('infoView.subText.tellMeWhatToAdd')
    }
  } else if (!listening && !emptyShoppingList) {
    return {
      mainText: t('infoView.mainText.congratsItWorked'),
      subText: t('infoView.subText.letsAddSomething')
    }
  } else if (listening) {
    return {
      mainText: t('infoView.mainText.iamListening'),
      subText: t('infoView.subText.tellMeWhatToAdd')
    }
  }
}

InfoView.propTypes = {
  emptyShoppingList: PropTypes.bool.isRequired,
  listening: PropTypes.bool.isRequired,
  isSpeechRecognitionSupported: PropTypes.bool.isRequired,
  isOnline: PropTypes.bool.isRequired,
  t: PropTypes.func
}
