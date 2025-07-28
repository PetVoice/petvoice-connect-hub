import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, X, Clock, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTranslatedToast } from '@/hooks/use-translated-toast';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface SupportTicket {
  id: string;
  ticket_number: string;
  category: string;
  priority: string;
  subject: string;
  description: string;
  status: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface TicketReply {
  id: string;
  ticket_id: string;
  user_id: string;
  content: string;
  is_staff_reply: boolean;
  created_at: string;
  updated_at: string;
}

interface SupportTicketDetailsProps {
  ticket: SupportTicket;
  onClose: () => void;
  onTicketUpdate: (ticket: SupportTicket) => void;
}

export const SupportTicketDetails: React.FC<SupportTicketDetailsProps> = ({
  ticket,
  onClose,
  onTicketUpdate
}) => {
  const [replies, setReplies] = useState<TicketReply[]>([]);
  const [newReply, setNewReply] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { showToast } = useTranslatedToast();

  // Carica le risposte del ticket
  useEffect(() => {
    if (ticket.id) {
      loadTicketReplies();
      setupRealtimeSubscription();
    }
  }, [ticket.id]);

  const loadTicketReplies = async () => {
    try {
      const { data, error } = await supabase
        .from('support_ticket_replies')
        .select('*')
        .eq('ticket_id', ticket.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setReplies(data || []);
    } catch (error) {
      console.error('Error loading ticket replies:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`ticket-replies-${ticket.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_ticket_replies',
          filter: `ticket_id=eq.${ticket.id}`
        },
        (payload) => {
          console.log('📨 New reply received:', payload.new);
          setReplies(prev => [...prev, payload.new as TicketReply]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'support_tickets',
          filter: `id=eq.${ticket.id}`
        },
        (payload) => {
          console.log('🔄 Ticket updated:', payload.new);
          onTicketUpdate(payload.new as SupportTicket);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const addReply = async () => {
    if (!newReply.trim() || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('support_ticket_replies')
        .insert({
          ticket_id: ticket.id,
          user_id: user.id,
          content: newReply.trim(),
          is_staff_reply: false
        });

      if (error) throw error;

      showToast({
        title: "Risposta inviata",
        description: "La tua risposta è stata aggiunta al ticket.",
        variant: "success"
      });

      setNewReply('');
    } catch (error) {
      console.error('Error adding reply:', error);
      showToast({
        title: "Errore",
        description: "Impossibile inviare la risposta. Riprova più tardi.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'urgent': return 'bg-red-500';
      case 'critical': return 'bg-red-700';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <h3 className="font-semibold text-lg">{ticket.subject}</h3>
            <Badge className={`${getStatusColor(ticket.status)} text-white`}>
              {ticket.status}
            </Badge>
            <Badge className={`${getPriorityColor(ticket.priority)} text-white`}>
              {ticket.priority}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Ticket Info */}
        <div className="mb-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-sm text-muted-foreground mb-2">
            Ticket #{ticket.ticket_number} • {ticket.category}
          </div>
          <p className="text-sm">{ticket.description}</p>
          <div className="text-xs text-muted-foreground mt-2">
            Creato {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true, locale: it })}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 mb-4">
          <div className="space-y-4">
            {replies.map((reply) => {
              const isOwn = reply.user_id === user?.id;
              const isStaff = reply.is_staff_reply;
              
              // Per l'utente: mostra "Tu" per i suoi messaggi, "Supporto" per lo staff
              const displayName = isOwn ? 'Tu' : 'Supporto';

              return (
                <div 
                  key={reply.id}
                  className={`flex gap-3 p-3 rounded-lg transition-colors ${
                    isOwn ? 'bg-primary/10 ml-12' : 'bg-green-50 mr-12'
                  }`}
                >
                  <div className="flex-shrink-0">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {displayName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground">
                        {displayName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(reply.created_at), { 
                          addSuffix: true, 
                          locale: it 
                        })}
                      </span>
                    </div>
                    
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {reply.content}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Reply Input */}
        {ticket.status !== 'closed' && (
          <div className="space-y-3">
            <Textarea
              placeholder="Scrivi la tua risposta..."
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              rows={3}
              disabled={loading}
            />
            <Button 
              onClick={addReply}
              disabled={!newReply.trim() || loading}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              Invia Risposta
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};