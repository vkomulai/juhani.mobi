import { reactI18nextModule } from 'react-i18next'
import i18n from 'i18next'
import translations from 'translations.json'

i18n
  .use(reactI18nextModule) // passes i18n down to react-i18next
  .init({
    resources: translations,
    lng: 'fi',
    fallbackLng: 'fi',
    debug: false,
    keySeparator: false, // we do not use keys in form messages.welcome
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  })

export const getLocaleLang = () => {
  return i18n.language === 'fi' ? 'fi-FI' : 'en-GB'
}

export default i18n