import { connect } from 'react-redux'
import { Button } from 'components'
import { startListening } from 'api/SpeechRecognitionAPI'
import {
  sendAddButtonPressedEvent,
  sendItemsRecognizedEvent
} from 'api/Analytics'
import {
  addItemPressed,
  itemsRecognized
} from 'actions'

const mapStateToProps = state => ({
  enabled: state.isSpeechRecognitionSupported && !state.listening && state.isOnline,
  labelKey: 'buttons.add'
})

const mapDispatchToProps = dispatch => ({
  onClick: () => {
    sendAddButtonPressedEvent()
    dispatch(addItemPressed())
    startListening(recognizedItems => {
      if (recognizedItems && recognizedItems.length > 0) {
        sendItemsRecognizedEvent(recognizedItems)
      }
      dispatch(itemsRecognized(recognizedItems))
    })
  }
})

export const AddButton = connect(mapStateToProps, mapDispatchToProps)(Button)
