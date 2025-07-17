import React, { createContext, useContext, useEffect, useState } from 'react';

interface AppearanceSettings {
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  units: string;
  currency: string;
}

interface AppearanceContextType {
  appearance: AppearanceSettings;
  setAppearance: (appearance: AppearanceSettings) => void;
  updateAppearance: (key: keyof AppearanceSettings, value: string) => void;
}

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

export const useAppearance = () => {
  const context = useContext(AppearanceContext);
  if (context === undefined) {
    throw new Error('useAppearance must be used within an AppearanceProvider');
  }
  return context;
};

interface AppearanceProviderProps {
  children: React.ReactNode;
  storageKey?: string;
}

export const AppearanceProvider: React.FC<AppearanceProviderProps> = ({
  children,
  storageKey = 'petvoice-appearance',
}) => {
  const [appearance, setAppearance] = useState<AppearanceSettings>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (error) {
          console.error('Error parsing appearance settings:', error);
        }
      }
    }
    return {
      timezone: 'Europe/Rome',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      units: 'metric',
      currency: 'EUR',
    };
  });

  const updateAppearance = (key: keyof AppearanceSettings, value: string) => {
    setAppearance(prev => {
      const newSettings = { ...prev, [key]: value };
      localStorage.setItem(storageKey, JSON.stringify(newSettings));
      return newSettings;
    });
  };

  const value = {
    appearance,
    setAppearance: (newAppearance: AppearanceSettings) => {
      localStorage.setItem(storageKey, JSON.stringify(newAppearance));
      setAppearance(newAppearance);
    },
    updateAppearance,
  };

  return (
    <AppearanceContext.Provider value={value}>
      {children}
    </AppearanceContext.Provider>
  );
};