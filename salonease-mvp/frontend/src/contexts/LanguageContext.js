import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from '../i18n';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Try to get the language from localStorage, fallback to 'bg'
    return localStorage.getItem('language') || 'bg';
  });

  useEffect(() => {
    // When language changes, update i18n and localStorage
    i18n.changeLanguage(currentLanguage);
    localStorage.setItem('language', currentLanguage);
  }, [currentLanguage]);

  const changeLanguage = (langCode) => {
    setCurrentLanguage(langCode);
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
