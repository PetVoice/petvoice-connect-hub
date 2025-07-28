import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from './useNotifications';

export function useSupportTicketNotifications() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (!user) return;

    // Subscription per nuovi ticket (solo per admin)
    const ticketsSubscription = supabase
      .channel('support-tickets-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_tickets'
        },
        async (payload) => {
          // Solo gli admin ricevono notifiche per nuovi ticket
          const { data: userRoles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id);
            
          const isAdmin = userRoles?.some(r => r.role === 'admin');
          
          if (isAdmin) {
            // Ottieni il nome dell'utente che ha creato il ticket
            const { data: userProfile } = await supabase
              .from('profiles')
              .select('display_name')
              .eq('user_id', payload.new.user_id)
              .maybeSingle();

            const userName = userProfile?.display_name?.split(' ')[0] || 'Utente sconosciuto';
            const subject = payload.new.subject || 'Nuovo ticket';
            
            addNotification({
              title: 'Nuovo Ticket di Supporto',
              message: `${userName}: ${subject}`,
              type: 'info',
              read: false,
              action_url: '/admin/tickets'
            });
          }
        }
      )
      .subscribe();

    // Subscription per nuove risposte ai ticket
    const repliesSubscription = supabase
      .channel('support-replies-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_ticket_replies'
        },
        async (payload) => {
          const newReply = payload.new;
          
          // Ottieni informazioni sul ticket
          const { data: ticket } = await supabase
            .from('support_tickets')
            .select('user_id, subject')
            .eq('id', newReply.ticket_id)
            .single();

          if (!ticket) return;

          // Se la risposta non è dell'utente corrente
          if (newReply.user_id !== user.id) {
            // Ottieni il nome di chi ha risposto
            const { data: replyAuthor } = await supabase
              .from('profiles')
              .select('display_name')
              .eq('user_id', newReply.user_id)
              .maybeSingle();

            const authorName = replyAuthor?.display_name?.split(' ')[0] || 'Utente sconosciuto';
            const replyPreview = newReply.content?.substring(0, 50) || 'Nuova risposta';
            const finalPreview = newReply.content?.length > 50 ? `${replyPreview}...` : replyPreview;
            
            // Se l'utente corrente è il proprietario del ticket, riceve notifica
            if (ticket.user_id === user.id) {
              addNotification({
                title: 'Nuova Risposta al Ticket',
                message: `${authorName}: ${finalPreview}`,
                type: 'info',
                read: false,
                action_url: '/support'
              });
            } 
            // Se l'utente corrente è admin, riceve notifica per risposte di utenti normali
            else {
              const { data: userRoles } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', user.id);
                
              const isAdmin = userRoles?.some(r => r.role === 'admin');
              
              if (isAdmin && !newReply.is_staff_reply) {
                addNotification({
                  title: 'Nuova Risposta al Ticket',
                  message: `${authorName}: ${finalPreview}`,
                  type: 'info',
                  read: false,
                  action_url: '/admin/tickets'
                });
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ticketsSubscription);
      supabase.removeChannel(repliesSubscription);
    };
  }, [user, addNotification]);
}