import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { translateText, getCurrentLanguage, setCurrentLanguage, type LanguageCode, SUPPORTED_LANGUAGES } from '../services/translation';

interface TranslationContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (text: string) => Promise<string>;
  tSync: (text: string) => string;
  isLoading: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Cache for translations
const translationCache = new Map<string, string>();

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(getCurrentLanguage());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setCurrentLanguage(language);
    // Clear cache when language changes
    translationCache.clear();
  }, [language]);

  const t = useCallback(async (text: string): Promise<string> => {
    if (language === 'en') return Promise.resolve(text);
    
    const cacheKey = `${language}-${text}`;
    if (translationCache.has(cacheKey)) {
      return Promise.resolve(translationCache.get(cacheKey)!);
    }

    setIsLoading(true);
    try {
      const translated = await translateText(text, language, 'en');
      if (translated && translated !== text) {
        translationCache.set(cacheKey, translated);
      }
      return translated;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  const tSync = useCallback((text: string): string => {
    if (language === 'en') return text;
    const cacheKey = `${language}-${text}`;
    return translationCache.get(cacheKey) || text;
  }, [language]);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t, tSync, isLoading }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}

export { SUPPORTED_LANGUAGES };

