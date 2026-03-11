import { initReactI18next } from 'react-i18next'
import i18n from 'i18next'
import translations from 'translations.json'

i18n
  .use(initReactI18next)
  .init({
    resources: translations as Record<string, Record<string, Record<string, string>>>,
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

export const getLocaleLang = (): string => {
  return i18n.language === 'fi' ? 'fi-FI' : 'en-GB'
}

export default i18n
