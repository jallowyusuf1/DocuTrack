import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en.json';
import ar from '../locales/ar.json';
import es from '../locales/es.json';
import fr from '../locales/fr.json';
import ur from '../locales/ur.json';

const resources = {
  en: { translation: en },
  ar: { translation: ar },
  es: { translation: es },
  fr: { translation: fr },
  ur: { translation: ur },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false, // Disable suspense for better compatibility
    },
  });

export default i18n;





