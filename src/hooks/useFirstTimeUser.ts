import { useState, useEffect } from 'react';

export const useFirstTimeUser = (feature: string = 'general') => {
  const [isFirstTime, setIsFirstTime] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkFirstTime = () => {
      const storageKey = `firstTime_${feature}`;
      const hasSeenGuide = localStorage.getItem(storageKey);
      setIsFirstTime(!hasSeenGuide);
      setIsLoading(false);
    };
    
    // Breve delay per assicurarsi che la pagina sia caricata
    setTimeout(checkFirstTime, 500);
  }, [feature]);

  const markAsCompleted = () => {
    const storageKey = `firstTime_${feature}`;
    localStorage.setItem(storageKey, 'completed');
    setIsFirstTime(false);
  };

  const resetGuide = () => {
    const storageKey = `firstTime_${feature}`;
    localStorage.removeItem(storageKey);
    setIsFirstTime(true);
  };

  return {
    isFirstTime,
    isLoading,
    markAsCompleted,
    resetGuide
  };
};