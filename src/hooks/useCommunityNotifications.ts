import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from './useNotifications';

export function useCommunityNotifications() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (!user) return;

    // Subscription per nuovi messaggi nei gruppi dell'utente
    const messagesSubscription = supabase
      .channel('community-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages'
        },
        async (payload) => {
          // Verifica se l'utente è iscritto al canale del messaggio
          const { data: subscriptions } = await supabase
            .from('user_channel_subscriptions')
            .select('channel_name')
            .eq('user_id', user.id)
            .eq('channel_name', payload.new.channel_name);

          if (subscriptions && subscriptions.length > 0 && payload.new.user_id !== user.id) {
            // L'utente è iscritto al canale e il messaggio non è suo
            addNotification({
              title: 'Nuovo messaggio community',
              message: `Nuovo messaggio nel gruppo ${payload.new.channel_name}`,
              type: 'info',
              read: false,
              action_url: '/community'
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesSubscription);
    };
  }, [user, addNotification]);
}