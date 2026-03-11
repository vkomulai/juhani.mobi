import { initReactI18next } from 'react-i18next'
import i18n from 'i18next'
import translations from 'translations.json'

i18n
  .use(initReactI18next)
  .init({
    resources: translations,
    lng: 'fi',
    fallbackLng: 'fi',
    debug: false,
    keySeparator: false,
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  })

export const getLocaleLang = () => {
  return i18n.language === 'fi' ? 'fi-FI' : 'en-GB'
}

export default i18n