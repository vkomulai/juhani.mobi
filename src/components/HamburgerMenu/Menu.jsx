import React from 'react'
import PropTypes from 'prop-types'
import i18n from 'i18n'
import { slide as BurgerMenu } from 'react-burger-menu'
import { withNamespaces } from 'react-i18next'
import './Menu.css'
import versionInfo from 'versionInfo.json'

function changeLanguage() {
  i18n.changeLanguage(getNewLanguage())
}

function getNewLanguage() {
  return i18n.language === 'fi' ? 'en' : 'fi'
}

export const Menu = withNamespaces()(({ sortAutomatically, onSortChange, t }) => (
  <BurgerMenu width={'280px'}>
    <span className="label">{t('settings.title')}</span>
    <div className="item" onClick={() => onSortChange()}>
      <div className="row">
        <div>
          <input type="checkbox" checked={sortAutomatically} readOnly />
        </div>
        <div>{t('settings.sortAutomatially')}</div>
      </div>
    </div>
    <div className="item" onClick={() => changeLanguage()}>
      <div className="row">
        <div>{i18n.language.toUpperCase()}</div>
        <div>
          {t('settings.changeLanguage')} ({getNewLanguage().toUpperCase()})
        </div>
      </div>
    </div>
    <div className="version item">
      <span>
        {t('settings.commit')}: {versionInfo.commit.substring(0, 6)} <br />
        {t('settings.buildDate')}: {versionInfo.buildDate}
      </span>
    </div>
  </BurgerMenu>
))

Menu.propTypes = {
  sortAutomatically: PropTypes.bool.isRequired,
  onSortChange: PropTypes.func.isRequired,
  t: PropTypes.func
}
