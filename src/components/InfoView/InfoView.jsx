import React from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { useStore } from 'store'
import robotWaiting from './robot-waiting.png'
import robotListening from './robot-listening.png'
import './InfoView.css'

export const InfoView = () => {
  const { t } = useTranslation()
  const shoppingItems = useStore((s) => s.shoppingItems)
  const listening = useStore((s) => s.listening)
  const isSpeechRecognitionSupported = useStore((s) => s.isSpeechRecognitionSupported)
  const isOnline = useStore((s) => s.isOnline)
  const emptyShoppingList = shoppingItems.length === 0

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

const getInfoText = (listening, emptyShoppingList, isSpeechRecognitionSupported, isOnline, t) => {
  if (!isOnline) {
    return {
      mainText: t('infoView.mainText.offline'),
      subText: t('infoView.subText.speechReconigtionNotWorking')
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
