import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import uuidv1 from 'uuid/v1'

import './Header.css'
import { shareList } from 'api/Share'
import { storeList } from 'actions'
import shareIcon from './shareIcon.png'

const HeaderComponent = ({ shoppingItems, onClick }) => (<div className="header mui-appbar">
  <h3 className="title mui--text-center">Juhani.mobi</h3>
  <img src={shareIcon} alt="sharing is caring" onClick={() => onClick(shoppingItems)} />
</div>)

HeaderComponent.propTypes = {
  shoppingItems: PropTypes.array.isRequired,
  onClick: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
  shoppingItems: state.shoppingItems
})

const mapDispatchToProps = dispatch => ({
  onClick: (shoppingItems) => {
    const listId = uuidv1()
    dispatch(storeList(listId))
    shareList(listId, shoppingItems)
  }
})

export const Header = connect(mapStateToProps, mapDispatchToProps)(HeaderComponent)