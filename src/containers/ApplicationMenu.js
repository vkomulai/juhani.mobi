import { connect } from 'react-redux'
import { Menu } from 'components'
import { 
  sortAutomaticallyChanged
 } from 'actions'

const mapStateToProps = state => ({
  sortAutomatically: state.sortAutomatically
})

const mapDispatchToProps = dispatch => ({
  onSortChange: () => {
    dispatch(sortAutomaticallyChanged())
  }
})

export const ApplicationMenu = connect(mapStateToProps, mapDispatchToProps)(Menu)
