import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from './useNotifications';

export function useReferralNotifications() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (!user) return;

    // Subscription per nuove conversioni di referral
    const referralSubscription = supabase
      .channel('referral-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'referrals',
          filter: `referrer_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.new.status === 'converted' && payload.old.status !== 'converted') {
            addNotification({
              title: 'Nuovo referral convertito!',
              message: `Il tuo referral ${payload.new.referred_email} si è abbonato! Hai guadagnato una commissione.`,
              type: 'success',
              read: false,
              action_url: '/affiliation'
            });
          }
        }
      )
      .subscribe();

    // Subscription per nuove commissioni
    const commissionSubscription = supabase
      .channel('commission-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'referral_commissions',
          filter: `referrer_id=eq.${user.id}`
        },
        (payload) => {
          const amount = payload.new.amount;
          const type = payload.new.commission_type;
          
          if (type === 'first_payment') {
            addNotification({
              title: 'Nuova commissione!',
              message: `Hai ricevuto €${amount.toFixed(2)} di commissione per un nuovo abbonamento`,
              type: 'success',
              read: false,
              action_url: '/affiliation'
            });
          } else if (type === 'recurring') {
            addNotification({
              title: 'Commissione ricorrente',
              message: `Hai ricevuto €${amount.toFixed(2)} di commissione mensile`,
              type: 'success',
              read: false,
              action_url: '/affiliation'
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(referralSubscription);
      supabase.removeChannel(commissionSubscription);
    };
  }, [user, addNotification]);
}