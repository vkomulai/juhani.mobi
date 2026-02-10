import React from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import './Button.css'

export const Button = ({ enabled, labelKey, onClick }) => {
  const { t } = useTranslation()
  return (
    <button className="mui-btn mui-btn--raised app-button" disabled={!enabled} onClick={onClick}>
      {t(labelKey)}
    </button>
  )
}

Button.propTypes = {
  enabled: PropTypes.bool.isRequired,
  labelKey: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired
}
