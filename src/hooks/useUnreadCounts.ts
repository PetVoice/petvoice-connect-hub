import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UnreadCounts {
  privateMessages: number;
  supportTickets: number;
}

export function useUnreadCounts() {
  const { user } = useAuth();
  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({
    privateMessages: 0,
    supportTickets: 0
  });

  // Funzione per ottenere il conteggio dei messaggi privati non letti
  const fetchUnreadPrivateMessages = async () => {
    if (!user) return 0;

    try {
      const { data, error } = await supabase
        .from('private_messages')
        .select('id')
        .eq('recipient_id', user.id)
        .eq('is_read', false)
        .eq('deleted_by_recipient', false);

      if (error) {
        console.error('Error fetching unread private messages:', error);
        return 0;
      }

      return data?.length || 0;
    } catch (error) {
      console.error('Error in fetchUnreadPrivateMessages:', error);
      return 0;
    }
  };

  // Funzione per ottenere il conteggio dei ticket con risposte non lette
  const fetchUnreadTicketReplies = async () => {
    if (!user) return 0;

    try {
      // Ottieni i ticket dell'utente con risposte non lette
      const { data: unreadData, error } = await supabase
        .from('support_ticket_unread_counts')
        .select('unread_count')
        .eq('user_id', user.id)
        .gt('unread_count', 0);

      if (error) {
        console.error('Error fetching unread ticket replies:', error);
        return 0;
      }

      // Somma tutti i conteggi non letti
      const totalUnread = unreadData?.reduce((sum, item) => sum + item.unread_count, 0) || 0;
      return totalUnread;
    } catch (error) {
      console.error('Error in fetchUnreadTicketReplies:', error);
      return 0;
    }
  };

  // Carica i conteggi iniziali
  useEffect(() => {
    if (!user) return;

    const loadUnreadCounts = async () => {
      const [privateMessages, supportTickets] = await Promise.all([
        fetchUnreadPrivateMessages(),
        fetchUnreadTicketReplies()
      ]);

      setUnreadCounts({
        privateMessages,
        supportTickets
      });
    };

    loadUnreadCounts();
  }, [user]);

  // Setup real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscription per messaggi privati
    const privateMessagesChannel = supabase
      .channel('unread-private-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'private_messages'
        },
        async (payload) => {
          // Aggiorna il conteggio solo se il messaggio riguarda l'utente corrente
          if ((payload.new as any)?.recipient_id === user.id || (payload.old as any)?.recipient_id === user.id) {
            const count = await fetchUnreadPrivateMessages();
            setUnreadCounts(prev => ({ ...prev, privateMessages: count }));
          }
        }
      )
      .subscribe();

    // Subscription per ticket replies
    const ticketRepliesChannel = supabase
      .channel('unread-ticket-replies')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_ticket_unread_counts'
        },
        async (payload) => {
          // Aggiorna il conteggio solo se riguarda l'utente corrente
          if ((payload.new as any)?.user_id === user.id || (payload.old as any)?.user_id === user.id) {
            const count = await fetchUnreadTicketReplies();
            setUnreadCounts(prev => ({ ...prev, supportTickets: count }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(privateMessagesChannel);
      supabase.removeChannel(ticketRepliesChannel);
    };
  }, [user]);

  // Funzioni per marcare come letti
  const markPrivateMessagesAsRead = async () => {
    if (!user) return;
    
    try {
      // Marca tutti i messaggi privati non letti come letti
      await supabase
        .from('private_messages')
        .update({ is_read: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false);
      
      // Aggiorna il conteggio locale
      setUnreadCounts(prev => ({ ...prev, privateMessages: 0 }));
    } catch (error) {
      console.error('Error marking private messages as read:', error);
    }
  };

  const markTicketRepliesAsRead = async () => {
    if (!user) return;
    
    // Questa funzione sarà chiamata quando l'utente apre la pagina Support
    const count = await fetchUnreadTicketReplies();
    setUnreadCounts(prev => ({ ...prev, supportTickets: count }));
  };

  return {
    unreadCounts,
    markPrivateMessagesAsRead,
    markTicketRepliesAsRead,
    refreshCounts: async () => {
      if (!user) return;
      const [privateMessages, supportTickets] = await Promise.all([
        fetchUnreadPrivateMessages(),
        fetchUnreadTicketReplies()
      ]);
      setUnreadCounts({ privateMessages, supportTickets });
    }
  };
}