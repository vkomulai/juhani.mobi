import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import './Header.css'
import shareIcon from './shareIcon.png'
import { shareList } from 'api/Share'

const HeaderComponent = ({shoppingItems}) => (<div className="header mui-appbar">
  <h3 className="title mui--text-center">Juhani.mobi</h3>
  <img src={shareIcon} alt="sharing is caring" onClick={() => shareList(shoppingItems)} />
</div>)

HeaderComponent.propTypes = {
  shoppingItems: PropTypes.array.isRequired
}

const mapStateToProps = state => ({
  shoppingItems: state.shoppingItems
})

export const Header = connect(mapStateToProps)(HeaderComponent)