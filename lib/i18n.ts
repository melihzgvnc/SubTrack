import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from '../locales/en.json';
import tr from '../locales/tr.json';

const resources = {
    en: { translation: en },
    tr: { translation: tr },
};

const initI18n = async () => {
    let language = 'en';

    // Get device locale
    const deviceLocale = Localization.getLocales()[0]?.languageCode;
    if (deviceLocale === 'tr') {
        language = 'tr';
    }

    await i18n
        .use(initReactI18next)
        .init({
            resources,
            lng: language, // Initial language, will be overwritten by store if persisted
            fallbackLng: 'en',
            interpolation: {
                escapeValue: false, // react already safes from xss
            },
            compatibilityJSON: 'v3', // For Android compatibility
        });
};

// Initialize immediately but export for explicit calls if needed
initI18n();

export default i18n;
