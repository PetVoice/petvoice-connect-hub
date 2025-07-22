import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useFirstTimeUser = () => {
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkFirstTimeStatus = () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Usa localStorage temporaneamente fino a quando i tipi Supabase non si aggiornano
        const hasSeenGuide = localStorage.getItem(`guide_seen_${user.id}`);
        setIsFirstTime(!hasSeenGuide);
      } catch (error) {
        console.error('Errore nel controllo guida:', error);
      } finally {
        setLoading(false);
      }
    };

    checkFirstTimeStatus();
  }, [user]);

  const markGuideAsSeen = async () => {
    if (!user) return;

    try {
      // Salva nel localStorage temporaneamente
      localStorage.setItem(`guide_seen_${user.id}`, 'true');
      setIsFirstTime(false);
    } catch (error) {
      console.error('Errore nel salvataggio:', error);
    }
  };

  return {
    isFirstTime,
    loading,
    markGuideAsSeen
  };
};