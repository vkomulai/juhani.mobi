import { connect } from 'react-redux'
import { Button} from 'components'
import { readyPressed } from 'actions'
import { sendEmptyButtonPressedEvent } from 'api/Analytics'

const mapStateToProps = state => ({
  enabled: state.shoppingItems.length > 0 && state.isOnline,
  title: 'Tyhjennä'
})

const mapDispatchToProps = dispatch => ({
  onClick: () => {
    sendEmptyButtonPressedEvent()
    dispatch(readyPressed())
  }
})

export const EmptyButton = connect(mapStateToProps, mapDispatchToProps)(Button)
