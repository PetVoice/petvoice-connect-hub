import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePets } from './PetContext';

type Theme = 'dark' | 'light';
type GenderTheme = 'male' | 'female' | 'default';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  genderTheme: GenderTheme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'light',
  storageKey = 'petvoice-theme',
}) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
    }
    return defaultTheme;
  });

  const { selectedPet } = usePets();
  
  // Attendiamo che il PetContext sia pronto
  const genderTheme: GenderTheme = selectedPet?.gender === 'male' ? 'male' : 
                                   selectedPet?.gender === 'female' ? 'female' : 'default';
  
  console.log('🔍 Pet e Gender Debug:', {
    selectedPetExists: !!selectedPet,
    selectedPetName: selectedPet?.name,
    selectedPetGender: selectedPet?.gender,
    genderThemeCalculated: genderTheme,
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'male-theme', 'female-theme');
    root.classList.add(theme);
    
    console.log('🐾 Theme Debug:', {
      selectedPet: selectedPet?.name,
      gender: selectedPet?.gender,
      genderTheme,
      themeClass: theme,
      appliedClasses: Array.from(root.classList)
    });
    
    // Applica il tema basato sul genere
    if (genderTheme === 'male') {
      root.classList.add('male-theme');
      console.log('🔵 Applicato tema maschio (azzurro)');
    } else if (genderTheme === 'female') {
      root.classList.add('female-theme');
      console.log('🌸 Applicato tema femmina (rosa)');
    } else {
      console.log('⚪ Tema neutro (default)');
    }
    
    console.log('🎨 Classi finali applicate:', Array.from(root.classList));
  }, [theme, genderTheme, selectedPet]);

  const value = {
    theme,
    genderTheme,
    setTheme: (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme);
      setTheme(newTheme);
    },
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};