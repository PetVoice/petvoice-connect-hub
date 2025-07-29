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

    // Subscription per nuovi messaggi privati con configurazione ottimizzata
    const privateMessagesSubscription = supabase
      .channel('private-messages-notifications', {
        config: {
          broadcast: { self: false },
          presence: { key: user.id }
        }
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'private_messages',
          filter: `recipient_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('🔔 Private message notification received:', payload);
          // Solo se il messaggio è per l'utente corrente e non è stato inviato da lui
          if (payload.new.recipient_id === user.id && payload.new.sender_id !== user.id) {
            // Ottimizzazione: usa la cache per evitare chiamate duplicate
            const profileCache = new Map();
            let senderName = 'Utente sconosciuto';
            
            if (profileCache.has(payload.new.sender_id)) {
              senderName = profileCache.get(payload.new.sender_id);
            } else {
              const { data: senderProfile } = await supabase
                .from('profiles')
                .select('display_name')
                .eq('user_id', payload.new.sender_id)
                .maybeSingle();
              
              senderName = senderProfile?.display_name?.split(' ')[0] || 'Utente sconosciuto';
              profileCache.set(payload.new.sender_id, senderName);
            }
            
            const messagePreview = payload.new.content?.substring(0, 50) || 'Messaggio multimediale';
            const finalPreview = payload.new.content?.length > 50 ? `${messagePreview}...` : messagePreview;
            
            addNotification({
              title: 'Nuovo Messaggio Privato',
              message: `${senderName}: ${finalPreview}`,
              type: 'info',
              read: false,
              action_url: '/community' // Porta alla tab chat private
            }, 'message');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(privateMessagesSubscription);
    };
  }, [user, addNotification]);
}