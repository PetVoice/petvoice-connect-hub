import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from './useNotifications';
// Translation system removed - Italian only

export function useCommunityNotifications() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  // Translation system removed - Italian only

  useEffect(() => {
    if (!user) return;

    // Cache per i profili nelle notifiche community
    const profileCache = new Map();

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
              title: 'Nuovo Messaggio Community',
              message: `Nuovo messaggio nel canale ${payload.new.channel_name}`,
              type: 'info',
              read: false,
              action_url: '/community'
            }, 'message');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesSubscription);
    };
  }, [user, addNotification]);
}