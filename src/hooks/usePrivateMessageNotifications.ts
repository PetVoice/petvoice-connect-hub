import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from './useNotifications';
// Translation system removed - Italian only

export function usePrivateMessageNotifications() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  // Translation system removed - Italian only

  useEffect(() => {
    if (!user) return;

    // Subscription per nuovi messaggi privati
    const privateMessagesSubscription = supabase
      .channel('private-messages-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'private_messages'
        },
        async (payload) => {
          // Solo se il messaggio è per l'utente corrente e non è stato inviato da lui
          if (payload.new.recipient_id === user.id && payload.new.sender_id !== user.id) {
            // Ottieni il nome del mittente
            const { data: senderProfile } = await supabase
              .from('profiles')
              .select('display_name')
              .eq('user_id', payload.new.sender_id)
              .maybeSingle();

            const senderName = senderProfile?.display_name?.split(' ')[0] || 'Utente sconosciuto';
            const messagePreview = payload.new.content?.substring(0, 50) || 'Messaggio multimediale';
            const finalPreview = payload.new.content?.length > 50 ? `${messagePreview}...` : messagePreview;
            
            addNotification({
              title: 'Nuovo Messaggio Privato',
              message: `${senderName}: ${finalPreview}`,
              type: 'info',
              read: false,
              action_url: '/community' // Porta alla tab chat private
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(privateMessagesSubscription);
    };
  }, [user, addNotification]);
}