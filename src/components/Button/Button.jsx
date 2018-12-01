import React from 'react'
import PropTypes from 'prop-types'
import './Button.css'

export const Button = ({enabled, title, onClick}) => (
  <button
    className='mui-btn mui-btn--raised app-button'
    disabled={!enabled}
    onClick={onClick}>{title}
  </button>
)

Button.propTypes = {
  enabled: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired
}