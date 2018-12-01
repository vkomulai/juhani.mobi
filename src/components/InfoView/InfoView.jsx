import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import './InfoView.css'

export const InfoView = ({ emptyShoppingList, listening, isSpeechRecognitionSupported, isOnline }) => {
  const { mainText, subText } = getInfoText(listening, emptyShoppingList, isSpeechRecognitionSupported, isOnline) 
  return (
    <div className='info-view' >
      <div className={classNames('mui-panel info-area', { listening, 'speech-not-supported': !isSpeechRecognitionSupported || !isOnline})} >
        <div className="icon-container">
          <img id="info-icon"
              alt="info-icon"
              className={listening ? 'info-icon-listening' : 'info-icon-normal'}
              src={listening ? 'icons/robot-listening.png' : 'icons/robot-waiting.png'} />
        </div>
        <div className="info-text">
          { mainText }<br/>
          { subText }
        </div>
      </div>
    </div>)
}


const getInfoText = (listening, emptyShoppingList, isSpeechRecognitionSupported, isOnline) => {
  if (!isOnline) {
    return {
      mainText: 'Selaimesi offline-tilassa!',
      subText: 'Puheentunnistus ei toimi'
    }
  } else if (!isSpeechRecognitionSupported) {
    return {
      mainText: 'Olen Juhani, ääniohjattu ostoslista',
      subText: 'Selaimesi EI tue puheentunnistusta'
    }
  } else if (!listening && emptyShoppingList) {
    return {
      mainText: 'Olen Juhani, ääniohjattu ostoslista',
      subText: 'Kerro ääneen mitä laitan listalle...'
    }
  } else if (!listening && !emptyShoppingList) {
    return {
      mainText: 'Hienoa, sait jo asioita listalle!',
      subText: 'Lisätäänpä vielä jotain...'
    }
  } else if (listening) {
    return {
      mainText: 'Kuuntelen!',
      subText: 'Kerro ääneen mitä laitan listalle...'
    }
  }
}

InfoView.propTypes = {
  emptyShoppingList: PropTypes.bool.isRequired,
  listening: PropTypes.bool.isRequired,
  isSpeechRecognitionSupported: PropTypes.bool.isRequired,
  isOnline: PropTypes.bool.isRequired
}
