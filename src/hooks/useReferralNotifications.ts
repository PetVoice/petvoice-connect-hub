
import { useEffect } from 'react';
import { useNotifications } from './useNotifications';
import { useAuth } from '@/contexts/AuthContext';

export function useReferralNotifications() {
  const { addNotification } = useNotifications();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Controllo nuovi referral
    const checkReferralUpdates = () => {
      // Simula controllo referral
      const hasNewReferral = Math.random() > 0.95; // Molto raro
      
      if (hasNewReferral) {
        addNotification({
          title: 'Nuovo referral!',
          message: 'Un nuovo utente si è registrato tramite il tuo codice referral',
          type: 'success',
          read: false,
          action_url: '/affiliate'
        });
      }
    };

    // Controlla ogni 30 minuti
    const interval = setInterval(checkReferralUpdates, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [addNotification, user]);

  return null;
}
