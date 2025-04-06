
import { useState, useCallback } from 'react';
import translations from './translations';

type TranslationKey = keyof typeof translations.en;

interface AllTranslations {
  en: Record<string, string>;
  fr: Record<string, string>;
}

const allTranslations: AllTranslations = translations;

export function useLanguage() {
  const [language, setLanguage] = useState<string>(detectBrowserLanguage());

  const t = useCallback((key: string, replacements?: {[key: string]: any}) => {
    // Check if the language exists in our translations
    const translations = allTranslations[language as keyof AllTranslations] || allTranslations['en'];
    
    // Get the string or fall back to English if it doesn't exist in the current language
    let str = translations[key] || allTranslations['en'][key] || key;
    
    // Replace any tokens with their values
    if (replacements) {
      Object.keys(replacements).forEach(replaceKey => {
        str = str.replace(`{${replaceKey}}`, replacements[replaceKey]);
      });
    }
    
    return str;
  }, [language]);

  const setAndStoreLanguage = useCallback((newLanguage: string) => {
    // Store the language preference in localStorage
    localStorage.setItem('poultry-language', newLanguage);
    setLanguage(newLanguage);
  }, []);

  // Return both the raw setter and the persistent setter
  return { language, setLanguage: setAndStoreLanguage, t };
}

// Detect browser language and map it to our available translations
export function detectBrowserLanguage(): string {
  if (typeof navigator === 'undefined') return 'en'; // Default to English for SSR
  
  // First check if we have a stored preference
  const storedLang = localStorage.getItem('poultry-language');
  if (storedLang && (storedLang === 'en' || storedLang === 'fr')) {
    return storedLang;
  }
  
  // Get browser language (e.g. 'en-US', 'fr', 'fr-FR')
  const browserLang = navigator.language.toLowerCase().split('-')[0];
  
  // Check if we support this language, fallback to English if we don't
  return Object.keys(allTranslations).includes(browserLang) ? browserLang : 'en';
}
