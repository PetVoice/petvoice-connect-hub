import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, X, Clock, User, MoreVertical, Edit2, Trash2, Reply } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
  onTicketClose: (ticket: SupportTicket) => void;
}

export const SupportTicketDetails: React.FC<SupportTicketDetailsProps> = ({
  ticket,
  onClose,
  onTicketUpdate,
  onTicketClose
}) => {
  const [replies, setReplies] = useState<TicketReply[]>([]);
  const [newReply, setNewReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [userProfiles, setUserProfiles] = useState<{ [key: string]: { display_name: string } }>({});
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasScrolledToUnread, setHasScrolledToUnread] = useState(false);
  const [showAllMessages, setShowAllMessages] = useState(false);
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<TicketReply | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const firstUnreadRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { showToast } = useTranslatedToast();

  // Carica le risposte del ticket e l'unread count
  useEffect(() => {
    if (ticket.id) {
      loadTicketReplies();
      loadUnreadCount();
      const cleanup = setupRealtimeSubscription();
      
      // Cleanup function per quando il componente viene smontato o ticket cambia
      return cleanup;
    }
  }, [ticket.id]);

  // Effect per gestire lo scroll quando i messaggi cambiano
  useEffect(() => {
    if (replies.length > 0 && !hasScrolledToUnread) {
      scrollToUnreadMessages();
    } else if (replies.length > 0) {
      scrollToBottom();
    }
  }, [replies]);

  const loadUnreadCount = async () => {
    try {
      const { data, error } = await supabase
        .from('support_ticket_unread_counts')
        .select('unread_count')
        .eq('ticket_id', ticket.id)
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setUnreadCount(data?.unread_count || 0);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToUnreadMessages = () => {
    if (unreadCount > 0 && replies.length >= unreadCount) {
      const firstUnreadIndex = replies.length - unreadCount;
      const element = document.querySelector(`[data-message-index="${firstUnreadIndex}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setHasScrolledToUnread(true);
        
        // Evidenzia il primo messaggio non letto per un breve momento
        element.classList.add('animate-pulse');
        setTimeout(() => {
          element.classList.remove('animate-pulse');
        }, 2000);
      }
    } else {
      scrollToBottom();
      setHasScrolledToUnread(true);
    }
  };

  const loadTicketReplies = async () => {
    try {
      const { data, error } = await supabase
        .from('support_ticket_replies')
        .select('*')
        .eq('ticket_id', ticket.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setReplies(data || []);

      // Carica i profili degli utenti per i messaggi
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(reply => reply.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name')
          .in('user_id', userIds);
        
        if (profiles) {
          const profilesMap = profiles.reduce((acc, profile) => {
            acc[profile.user_id] = { display_name: profile.display_name || 'Supporto' };
            return acc;
          }, {} as { [key: string]: { display_name: string } });
          setUserProfiles(profilesMap);
        }
      }
    } catch (error) {
      console.error('Error loading ticket replies:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    console.log('🔄 Setting up realtime subscription for ticket:', ticket.id);
    
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
          console.log('📨 New reply received via realtime:', payload.new);
          const newReply = payload.new as TicketReply;
          
          // Aggiungi immediatamente il messaggio
          setReplies(prev => {
            console.log('📝 Adding new reply to state. Current replies:', prev.length);
            return [...prev, newReply];
          });
          
          // Carica il profilo dell'utente in background se non lo abbiamo già
          if (!userProfiles[newReply.user_id]) {
            (async () => {
              try {
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('user_id, display_name')
                  .eq('user_id', newReply.user_id)
                  .single();
                
                if (profile) {
                  setUserProfiles(prev => ({
                    ...prev,
                    [profile.user_id]: { display_name: profile.display_name || 'Supporto' }
                  }));
                }
              } catch (error) {
                console.error('Error loading user profile:', error);
              }
            })();
          }
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
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status);
      });

    return () => {
      console.log('🔌 Cleaning up realtime subscription for ticket:', ticket.id);
      supabase.removeChannel(channel);
    };
  };

  const addReply = async () => {
    if (!newReply.trim() || !user) return;

    setLoading(true);
    try {
      let content = newReply.trim();
      
      // Se stiamo rispondendo a un messaggio, aggiungi il quote
      if (replyingTo) {
        content = `> ${replyingTo.content.split('\n').join('\n> ')}\n\n${content}`;
      }

      const replyData = {
        ticket_id: ticket.id,
        user_id: user.id,
        content,
        is_staff_reply: false
      };

      const { data, error } = await supabase
        .from('support_ticket_replies')
        .insert(replyData)
        .select()
        .single();

      if (error) throw error;

      showToast({
        title: "Risposta inviata",
        description: "La tua risposta è stata aggiunta al ticket.",
        variant: "success"
      });

      setUnreadCount(0);
      setNewReply('');
      setReplyingTo(null);
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

  const handleEditReply = async (replyId: string) => {
    if (!editContent.trim()) return;

    try {
      const { error } = await supabase
        .from('support_ticket_replies')
        .update({ content: editContent.trim() })
        .eq('id', replyId);

      if (error) throw error;

      setReplies(prev => prev.map(reply => 
        reply.id === replyId ? { ...reply, content: editContent.trim() } : reply
      ));

      setEditingReply(null);
      setEditContent('');

      showToast({
        title: "Messaggio modificato",
        description: "Il tuo messaggio è stato aggiornato.",
        variant: "success"
      });
    } catch (error) {
      console.error('Error editing reply:', error);
      showToast({
        title: "Errore",
        description: "Impossibile modificare il messaggio.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteReply = async (replyId: string, deleteForAll: boolean = false) => {
    try {
      if (deleteForAll) {
        // Elimina completamente il messaggio
        const { error } = await supabase
          .from('support_ticket_replies')
          .delete()
          .eq('id', replyId);

        if (error) throw error;

        setReplies(prev => prev.filter(reply => reply.id !== replyId));
      } else {
        // Marca come eliminato solo per l'utente corrente
        // Per ora eliminiamo completamente, in futuro si può implementare la soft deletion
        const { error } = await supabase
          .from('support_ticket_replies')
          .delete()
          .eq('id', replyId);

        if (error) throw error;

        setReplies(prev => prev.filter(reply => reply.id !== replyId));
      }

      showToast({
        title: "Messaggio eliminato",
        description: deleteForAll ? "Il messaggio è stato eliminato per tutti." : "Il messaggio è stato eliminato per te.",
        variant: "success"
      });
    } catch (error) {
      console.error('Error deleting reply:', error);
      showToast({
        title: "Errore",
        description: "Impossibile eliminare il messaggio.",
        variant: "destructive"
      });
    }
  };

  const startEdit = (reply: TicketReply) => {
    setEditingReply(reply.id);
    setEditContent(reply.content);
  };

  const cancelEdit = () => {
    setEditingReply(null);
    setEditContent('');
  };

  const startReply = (reply: TicketReply) => {
    setReplyingTo(reply);
    // Focus sulla textarea
    setTimeout(() => {
      const textarea = document.querySelector('textarea[placeholder="Scrivi la tua risposta..."]') as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
      }
    }, 100);
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
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
          <div className="flex items-center gap-2">
            {ticket.status !== 'closed' && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => onTicketClose(ticket)}
              >
                Chiudi Ticket
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
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
        <ScrollArea className="h-96 mb-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {/* Pulsante per mostrare tutti i messaggi se ce ne sono più di 5 */}
            {replies.length > 5 && !showAllMessages && (
              <div className="text-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAllMessages(true)}
                  className="text-xs"
                >
                  Mostra tutti i {replies.length} messaggi
                </Button>
              </div>
            )}
            
            {(() => {
              // Logica per determinare quali messaggi mostrare
              const messagesToShow = showAllMessages ? replies : replies.slice(-5);
              const startIndex = showAllMessages ? 0 : Math.max(0, replies.length - 5);
              
              return messagesToShow.map((reply, relativeIndex) => {
                const absoluteIndex = startIndex + relativeIndex;
                const isOwn = reply.user_id === user?.id;
                const isStaff = reply.is_staff_reply;
                const isFirstUnread = unreadCount > 0 && absoluteIndex === replies.length - unreadCount;
                
                // Logica per il nome: se è il proprio messaggio mostra "Tu", altrimenti mostra il nome dell'utente o "Supporto"
                let displayName = 'Supporto';
                if (isOwn) {
                  displayName = 'Tu';
                } else if (isStaff) {
                  displayName = 'Supporto';
                } else {
                  // Per i messaggi di altri utenti, mostra il nome dal profilo
                  displayName = userProfiles[reply.user_id]?.display_name || 'Supporto';
                }

                const isEditing = editingReply === reply.id;

                // Renderizza il contenuto del messaggio in base ai quote
                const renderMessageContent = () => {
                  if (isEditing) {
                    return (
                      <div className="space-y-2">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={3}
                          className="text-sm"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleEditReply(reply.id)}>
                            Salva
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit}>
                            Annulla
                          </Button>
                        </div>
                      </div>
                    );
                  }

                  // RISOLUZIONE IMMEDIATA delle quote
                  const messageText = reply.content;
                  
                  // Se il messaggio inizia con >, rimuovi tutti i > e formatta come quote
                  if (messageText.trim().startsWith('>')) {
                    // Separa per doppio newline, se presente
                    if (messageText.includes('\n\n')) {
                      const parts = messageText.split('\n\n');
                      const quotePart = parts[0];
                      const contentPart = parts.slice(1).join('\n\n');
                      
                      const cleanQuote = quotePart
                        .split('\n')
                        .map(line => line.replace(/^>\s*/g, ''))
                        .join(' ')
                        .trim();
                      
                      return (
                        <div>
                          <div className="mb-2 p-2 bg-muted/30 rounded border-l-2 border-primary">
                            <div className="text-xs font-medium text-muted-foreground mb-1">
                              Risposta a:
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {cleanQuote}
                            </div>
                          </div>
                          <p className="text-sm text-foreground whitespace-pre-wrap">
                            {contentPart}
                          </p>
                        </div>
                      );
                    } else {
                      // Messaggio tutto quote - rimuovi tutti i >
                      const cleanText = messageText
                        .replace(/^>\s*/gm, '')
                        .trim();
                      
                      return (
                        <div className="p-2 bg-muted/30 rounded border-l-2 border-primary">
                          <div className="text-xs font-medium text-muted-foreground mb-1">
                            Messaggio quotato:
                          </div>
                          <p className="text-sm text-foreground">
                            {cleanText}
                          </p>
                        </div>
                      );
                    }
                  }
                  
                  // Messaggio normale
                  return (
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {messageText}
                    </p>
                  );
                };

                return (
                  <div 
                    key={reply.id}
                    data-message-index={absoluteIndex}
                    className={`flex gap-3 p-3 rounded-lg transition-colors ${
                      isOwn ? 'bg-primary/10 ml-12' : 'bg-green-50 mr-12'
                    } ${isFirstUnread ? 'border-l-4 border-l-blue-500' : ''}`}
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
                        {isFirstUnread && (
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                            Primo non letto
                          </Badge>
                        )}
                      </div>
                      
                      {renderMessageContent()}
                    </div>

                    {/* Menu a 3 pallini */}
                    <div className="flex-shrink-0">
                      {isOwn ? (
                        // Menu per i propri messaggi: modifica ed elimina
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => startEdit(reply)}>
                              <Edit2 className="h-4 w-4 mr-2" />
                              Modifica
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteReply(reply.id, false)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Elimina per me
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteReply(reply.id, true)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Elimina per tutti
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        // Menu per i messaggi del supporto: solo risposta
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => startReply(reply)}>
                              <Reply className="h-4 w-4 mr-2" />
                              Rispondi
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                );
              });
            })()}
            
            {/* Riferimento per lo scroll finale */}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Reply Input */}
        {ticket.status !== 'closed' && (
          <div className="space-y-3">
            {/* Indicatore di risposta */}
            {replyingTo && (
              <div className="p-3 bg-muted/30 rounded border-l-2 border-primary">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Reply className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">
                      Rispondendo a {replyingTo.user_id === user?.id ? 'te stesso' : (replyingTo.is_staff_reply ? 'Supporto' : userProfiles[replyingTo.user_id]?.display_name || 'Supporto')}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={cancelReply}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  {truncateText(replyingTo.content, 100)}
                </div>
              </div>
            )}
            
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
              {replyingTo ? 'Invia Risposta' : 'Invia Risposta'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};