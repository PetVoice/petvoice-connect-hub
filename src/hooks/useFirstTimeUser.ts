import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useFirstTimeUser = () => {
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkFirstTimeStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Controlla se l'utente ha già visto la guida
        const { data, error } = await supabase
          .from('user_preferences')
          .select('has_seen_guide')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Errore nel controllo guida:', error);
          setLoading(false);
          return;
        }

        // Se non esiste record o has_seen_guide è false, mostra la guida
        setIsFirstTime(!data?.has_seen_guide);
      } catch (error) {
        console.error('Errore inaspettato:', error);
      } finally {
        setLoading(false);
      }
    };

    checkFirstTimeStatus();
  }, [user]);

  const markGuideAsSeen = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          has_seen_guide: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Errore aggiornamento guida:', error);
      } else {
        setIsFirstTime(false);
      }
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