import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../lib/i18n';

type Language = 'en' | 'tr';

interface LanguageState {
    language: Language;
    setLanguage: (language: Language) => void;
    isLoaded: boolean;
    setLoaded: (loaded: boolean) => void;
}

export const useLanguageStore = create<LanguageState>()(
    persist(
        (set) => ({
            language: 'en', // Default will be handled by i18n detection, but store needs a value
            isLoaded: false,
            setLanguage: (language) => {
                set({ language });
                i18n.changeLanguage(language);
            },
            setLoaded: (loaded) => set({ isLoaded: loaded }),
        }),
        {
            name: 'language-storage',
            storage: createJSONStorage(() => AsyncStorage),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.setLoaded(true);
                    if (state.language) {
                        i18n.changeLanguage(state.language);
                    }
                }
            },
        }
    )
);
