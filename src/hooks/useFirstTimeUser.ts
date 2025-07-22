import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useFirstTimeUser = () => {
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    console.log('🔍 useFirstTimeUser: Starting check, user:', user?.id);
    
    const checkFirstTimeStatus = async () => {
      if (!user) {
        console.log('❌ useFirstTimeUser: No user found');
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 useFirstTimeUser: Checking guide status for user:', user.id);
        
        // Per ora uso localStorage per testare - TODO: implementare con Supabase
        const hasSeenGuide = localStorage.getItem(`guide_seen_${user.id}`) === 'true';
        
        console.log('🔍 useFirstTimeUser: Has seen guide from localStorage:', hasSeenGuide);

        // Se non ha visto la guida, mostra la guida
        const shouldShowGuide = !hasSeenGuide;
        console.log('🔍 useFirstTimeUser: Should show guide:', shouldShowGuide);
        setIsFirstTime(shouldShowGuide);
      } catch (error) {
        console.error('❌ useFirstTimeUser: Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkFirstTimeStatus();
  }, [user]);

  const markGuideAsSeen = async () => {
    if (!user) return;
    
    console.log('✅ useFirstTimeUser: Marking guide as seen for user:', user.id);

    try {
      // Per ora salvo in localStorage - TODO: implementare con Supabase  
      localStorage.setItem(`guide_seen_${user.id}`, 'true');
      console.log('✅ useFirstTimeUser: Guide marked as seen in localStorage');
      setIsFirstTime(false);
    } catch (error) {
      console.error('❌ useFirstTimeUser: Error saving guide status:', error);
    }
  };

  return {
    isFirstTime,
    loading,
    markGuideAsSeen
  };
};