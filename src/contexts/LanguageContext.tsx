import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'it' | 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
  defaultLanguage?: Language;
  storageKey?: string;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  defaultLanguage = 'it',
  storageKey = 'petvoice-language',
}) => {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(storageKey) as Language) || defaultLanguage;
    }
    return defaultLanguage;
  });

  const value = {
    language,
    setLanguage: (newLanguage: Language) => {
      localStorage.setItem(storageKey, newLanguage);
      setLanguage(newLanguage);
    },
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};