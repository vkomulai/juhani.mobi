import { connect } from 'react-redux'
import { InfoView } from 'components'

const mapStateToProps = state => ({
  emptyShoppingList: state.shoppingItems.length === 0,
  listening: state.listening,
  isSpeechRecognitionSupported: state.isSpeechRecognitionSupported,
  isOnline: state.isOnline
})

export const InfoArea = connect(mapStateToProps)(InfoView)
