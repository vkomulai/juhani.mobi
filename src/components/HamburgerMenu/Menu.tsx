import React from 'react'
import i18n from 'i18n'
import { slide as BurgerMenu } from 'react-burger-menu'
import { useTranslation } from 'react-i18next'
import { useStore } from 'store'
import './Menu.css'
import versionInfo from 'versionInfo.json'

function changeLanguage(): void {
  i18n.changeLanguage(getNewLanguage())
}

function getNewLanguage(): string {
  return i18n.language === 'fi' ? 'en' : 'fi'
}

export const Menu = () => {
  const { t } = useTranslation()
  const sortAutomatically = useStore((s) => s.sortAutomatically)
  const setSortAutomatically = useStore((s) => s.setSortAutomatically)

  return (
    <BurgerMenu width={'280px'}>
      <span className="label">{t('settings.title')}</span>
      <div className="item" onClick={() => setSortAutomatically()}>
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
          {t('settings.commit')}: {(versionInfo as { commit: string, buildDate: string }).commit.substring(0, 6)} <br />
          {t('settings.buildDate')}: {(versionInfo as { commit: string, buildDate: string }).buildDate}
        </span>
      </div>
    </BurgerMenu>
  )
}
