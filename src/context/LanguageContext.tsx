'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ja';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (en: string, ja: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Default to Japanese ('ja') as per previous requirements
  const [lang, setLang] = useState<Language>('ja');

  // Multi-line helper for translation
  const t = (en: string, ja: string) => (lang === 'ja' ? ja : en);

  // Persistence (Optional but good for UX)
  useEffect(() => {
    const saved = localStorage.getItem('levi_lang') as Language;
    if (saved && (saved === 'en' || saved === 'ja')) {
      setLang(saved);
    }
  }, []);

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('levi_lang', newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t }}>
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
