import React from 'react'
import PropTypes from 'prop-types'
import './Menu.css'
import versionInfo from 'versionInfo.json'
import { slide as BurgerMenu } from 'react-burger-menu'

export const Menu = ({ sortAutomatically, onSortChange }) => (
  <BurgerMenu width={'280px'}>
    <span>ASETUKSET</span>
    <div className="item" onClick={() => onSortChange()}>
      <input type="checkbox" checked={sortAutomatically} readOnly />
      <span>Järjestä automaattisesti</span>
    </div>
    <div className="version item">
      <span>
        Build: {versionInfo.commit.substring(0, 6)} <br />
        Updated: {versionInfo.buildDate}
      </span>
    </div>
  </BurgerMenu>
)

Menu.propTypes = {
  sortAutomatically: PropTypes.bool.isRequired,
  onSortChange: PropTypes.func.isRequired
}
