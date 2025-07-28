import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MessageCircle, Send, X, Clock, User, Reply, Quote, Edit, Trash2, MoreVertical, CheckSquare, Square, Check } from 'lucide-react';
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
  reply_to_id?: string;
  quoted_content?: string;
  deleted_by_sender?: boolean;
  deleted_by_recipient?: boolean;
  deleted_at?: string;
  is_edited?: boolean;
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
  const [replyingTo, setReplyingTo] = useState<TicketReply | null>(null);
  const [quotedMessage, setQuotedMessage] = useState<TicketReply | null>(null);
  
  // Stati per modifica messaggi
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  
  // Stati per selezione multipla
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  
  // Stati per dialoghi di eliminazione
  const [showSingleDeleteDialog, setShowSingleDeleteDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  
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
      
      // Filtra i messaggi eliminati dall'utente corrente
      const filteredReplies = (data || []).filter(reply => {
        // Se l'utente è il sender, controlla se ha eliminato il messaggio
        if (reply.user_id === user?.id) {
          return !reply.deleted_by_sender;
        }
        // Se l'utente è il recipient (per messaggi del supporto), controlla se ha eliminato il messaggio
        else {
          return !reply.deleted_by_recipient;
        }
      });
      
      setReplies(filteredReplies);

      // Carica i profili degli utenti per i messaggi
      if (filteredReplies && filteredReplies.length > 0) {
        const userIds = [...new Set(filteredReplies.map(reply => reply.user_id))];
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

  const handleReplyToMessage = (reply: TicketReply) => {
    setReplyingTo(reply);
    setQuotedMessage(null);
    const authorName = reply.user_id === user?.id ? 'Tu' : (userProfiles[reply.user_id]?.display_name || 'Supporto');
    setNewReply(`@${authorName} `);
  };

  const handleQuoteMessage = (reply: TicketReply) => {
    setQuotedMessage(reply);
    setReplyingTo(null);
    const authorName = reply.user_id === user?.id ? 'Tu' : (userProfiles[reply.user_id]?.display_name || 'Supporto');
    setNewReply(`> ${authorName}: ${reply.content}\n\n`);
  };

  const clearReplyContext = () => {
    setReplyingTo(null);
    setQuotedMessage(null);
  };

  const addReply = async () => {
    if (!newReply.trim() || !user) return;

    setLoading(true);
    try {
      const replyData = {
        ticket_id: ticket.id,
        user_id: user.id,
        content: newReply.trim(),
        is_staff_reply: false
      };

      const { data, error } = await supabase
        .from('support_ticket_replies')
        .insert(replyData)
        .select()
        .single();

      if (error) throw error;

      // Non aggiungere manualmente - il realtime si occuperà di aggiornare la lista

      showToast({
        title: "Risposta inviata",
        description: "La tua risposta è stata aggiunta al ticket.",
        variant: "success"
      });

      // Reset unread count quando l'utente scrive
      setUnreadCount(0);
      setNewReply('');
      clearReplyContext();
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

  // Funzioni per modifica messaggi
  const startEdit = (reply: TicketReply) => {
    setEditingMessage(reply.id);
    setEditContent(reply.content || '');
  };

  const saveEdit = async () => {
    if (!editingMessage || !editContent.trim()) return;

    try {
      const { error } = await supabase
        .from('support_ticket_replies')
        .update({ 
          content: editContent.trim()
        })
        .eq('id', editingMessage)
        .eq('user_id', user?.id);

      if (error) throw error;

      setReplies(prev => 
        prev.map(reply => 
          reply.id === editingMessage 
            ? { ...reply, content: editContent.trim(), is_edited: true }
            : reply
        )
      );

      setEditingMessage(null);
      setEditContent('');

      showToast({
        title: "Messaggio modificato",
        description: "Il messaggio è stato modificato con successo",
        variant: "success"
      });
    } catch (error) {
      console.error('Error editing message:', error);
      showToast({
        title: "Errore",
        description: "Impossibile modificare il messaggio",
        variant: "destructive"
      });
    }
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setEditContent('');
  };

  // Funzioni per eliminazione messaggi
  const deleteMessage = (messageId: string) => {
    setMessageToDelete(messageId);
    setShowSingleDeleteDialog(true);
  };

  const deleteSingleMessageForMe = async () => {
    if (!messageToDelete) return;

    try {
      const messageToDeleteObj = replies.find(r => r.id === messageToDelete);
      const isOwn = messageToDeleteObj?.user_id === user?.id;

      const updateField = isOwn ? 'deleted_by_sender' : 'deleted_by_recipient';
      
      const { error } = await supabase
        .from('support_ticket_replies')
        .update({ 
          [updateField]: true,
          deleted_at: new Date().toISOString()
        })
        .eq('id', messageToDelete);

      if (error) throw error;

      setReplies(prev => prev.filter(reply => reply.id !== messageToDelete));
      setShowSingleDeleteDialog(false);
      setMessageToDelete(null);

      showToast({
        title: "Messaggio eliminato",
        description: "Il messaggio è stato eliminato solo per te",
        variant: "default"
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      showToast({
        title: "Errore",
        description: "Impossibile eliminare il messaggio",
        variant: "destructive"
      });
    }
  };

  const deleteSingleMessageForBoth = async () => {
    if (!messageToDelete) return;

    try {
      const { error } = await supabase
        .from('support_ticket_replies')
        .update({ 
          deleted_by_sender: true,
          deleted_by_recipient: true,
          deleted_at: new Date().toISOString()
        })
        .eq('id', messageToDelete)
        .eq('user_id', user?.id);

      if (error) throw error;

      setReplies(prev => prev.filter(reply => reply.id !== messageToDelete));
      setShowSingleDeleteDialog(false);
      setMessageToDelete(null);

      showToast({
        title: "Messaggio eliminato",
        description: "Il messaggio è stato eliminato per entrambi",
        variant: "default"
      });
    } catch (error) {
      console.error('Error deleting message for both:', error);
      showToast({
        title: "Errore",
        description: "Impossibile eliminare il messaggio",
        variant: "destructive"
      });
    }
  };

  // Funzioni per selezione multipla
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedMessages([]);
  };

  const toggleMessageSelection = (messageId: string) => {
    setSelectedMessages(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const selectAllMessages = () => {
    const userMessages = replies.filter(reply => reply.user_id === user?.id);
    const allUserMessageIds = userMessages.map(reply => reply.id);
    setSelectedMessages(allUserMessageIds);
  };

  const deselectAllMessages = () => {
    setSelectedMessages([]);
  };

  const deleteSelectedMessages = async () => {
    if (selectedMessages.length === 0) return;

    try {
      const selectedMessageObjects = replies.filter(reply => selectedMessages.includes(reply.id));
      const sentMessages = selectedMessageObjects.filter(reply => reply.user_id === user?.id);
      const receivedMessages = selectedMessageObjects.filter(reply => reply.user_id !== user?.id);

      if (sentMessages.length > 0) {
        const { error: sentError } = await supabase
          .from('support_ticket_replies')
          .update({ 
            deleted_by_sender: true,
            deleted_at: new Date().toISOString()
          })
          .in('id', sentMessages.map(reply => reply.id));

        if (sentError) throw sentError;
      }

      if (receivedMessages.length > 0) {
        const { error: receivedError } = await supabase
          .from('support_ticket_replies')
          .update({ 
            deleted_by_recipient: true,
            deleted_at: new Date().toISOString()
          })
          .in('id', receivedMessages.map(reply => reply.id));

        if (receivedError) throw receivedError;
      }

      setSelectedMessages([]);
      setIsSelectionMode(false);
      setShowBulkDeleteDialog(false);
      await loadTicketReplies();

      showToast({
        title: "Messaggi eliminati",
        description: `${selectedMessages.length} messaggi eliminati solo per te`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error deleting messages:', error);
      showToast({
        title: "Errore",
        description: "Impossibile eliminare i messaggi selezionati",
        variant: "destructive"
      });
    }
  };

  const deleteSelectedMessagesForBoth = async () => {
    if (selectedMessages.length === 0) return;

    try {
      const selectedMessageObjects = replies.filter(reply => selectedMessages.includes(reply.id));
      const sentMessages = selectedMessageObjects.filter(reply => reply.user_id === user?.id);
      const receivedMessages = selectedMessageObjects.filter(reply => reply.user_id !== user?.id);

      if (sentMessages.length > 0) {
        const { error: sentError } = await supabase
          .from('support_ticket_replies')
          .update({ 
            deleted_by_sender: true,
            deleted_by_recipient: true,
            deleted_at: new Date().toISOString()
          })
          .in('id', sentMessages.map(reply => reply.id));

        if (sentError) throw sentError;
      }

      if (receivedMessages.length > 0) {
        const { error: receivedError } = await supabase
          .from('support_ticket_replies')
          .update({ 
            deleted_by_recipient: true,
            deleted_at: new Date().toISOString()
          })
          .in('id', receivedMessages.map(reply => reply.id));

        if (receivedError) throw receivedError;
      }

      setSelectedMessages([]);
      setIsSelectionMode(false);
      setShowBulkDeleteDialog(false);
      await loadTicketReplies();

      const sentCount = sentMessages.length;
      const receivedCount = receivedMessages.length;
      let description = "";
      
      if (sentCount > 0 && receivedCount > 0) {
        description = `${sentCount} messaggi eliminati per entrambi, ${receivedCount} eliminati solo per te`;
      } else if (sentCount > 0) {
        description = `${sentCount} messaggi eliminati per entrambi`;
      } else {
        description = `${receivedCount} messaggi eliminati solo per te`;
      }

      showToast({
        title: "Messaggi eliminati",
        description: description,
        variant: "default"
      });
    } catch (error) {
      console.error('Error deleting messages for both:', error);
      showToast({
        title: "Errore",
        description: "Impossibile eliminare i messaggi selezionati",
        variant: "destructive"
      });
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
          <div className="flex items-center gap-2">
            {/* Pulsanti per selezione multipla */}
            {replies.length > 0 && (
              <>
                <Button
                  variant={isSelectionMode ? "default" : "outline"}
                  size="sm"
                  onClick={toggleSelectionMode}
                >
                  {isSelectionMode ? (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Annulla
                    </>
                  ) : (
                    <>
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Seleziona
                    </>
                  )}
                </Button>

                {isSelectionMode && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={selectAllMessages}
                      disabled={selectedMessages.length === replies.filter(r => r.user_id === user?.id).length}
                    >
                      Seleziona tutti
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={deselectAllMessages}
                      disabled={selectedMessages.length === 0}
                    >
                      Deseleziona
                    </Button>
                    {selectedMessages.length > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowBulkDeleteDialog(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Elimina ({selectedMessages.length})
                      </Button>
                    )}
                  </>
                )}
              </>
            )}

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
                const isEditing = editingMessage === reply.id;
                const isSelected = selectedMessages.includes(reply.id);
                
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

                return (
                  <div 
                    key={reply.id}
                    data-message-index={absoluteIndex}
                    className="relative transition-all duration-200"
                  >
                    <div 
                      className={`group relative flex gap-3 p-3 rounded-lg transition-colors ${
                        isOwn ? 'bg-primary/10 ml-12' : 'bg-muted/20 mr-12'
                      } ${isFirstUnread ? 'border-l-4 border-l-blue-500' : ''} ${
                        isSelectionMode ? 'cursor-pointer hover:bg-muted/30' : ''
                      } ${isSelected ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => isSelectionMode && toggleMessageSelection(reply.id)}
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
                          {reply.is_edited && (
                            <div className="text-xs text-muted-foreground">
                              (modificato)
                            </div>
                          )}
                        </div>
                        
                        {/* Contenuto del messaggio */}
                        {isEditing ? (
                          <div className="mt-2 space-y-2">
                            <Input
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  saveEdit();
                                }
                                if (e.key === 'Escape') {
                                  cancelEdit();
                                }
                              }}
                              className="text-sm"
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={saveEdit}>
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={cancelEdit}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-1">
                            <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                              {reply.content}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {!isSelectionMode && (
                        <div className="flex-shrink-0 flex items-center gap-1">
                          {/* Always show Reply button */}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleReplyToMessage(reply)}
                          >
                            <Reply className="h-4 w-4" />
                          </Button>
                          
                          {/* Show menu for both own and received messages */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleQuoteMessage(reply)}>
                                <Quote className="h-4 w-4 mr-2" />
                                Cita
                              </DropdownMenuItem>
                              {isOwn ? (
                                <>
                                  <DropdownMenuItem onClick={() => startEdit(reply)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Modifica
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => deleteMessage(reply.id)} className="text-destructive">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Elimina
                                  </DropdownMenuItem>
                                </>
                              ) : (
                                <DropdownMenuItem onClick={() => deleteMessage(reply.id)} className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Elimina solo per me
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
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
            {/* Contesto di risposta */}
            {(replyingTo || quotedMessage) && (
              <div className="p-3 bg-muted/30 rounded-lg border-l-4 border-l-primary">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {replyingTo && <Reply className="h-4 w-4 text-primary" />}
                    {quotedMessage && <Quote className="h-4 w-4 text-primary" />}
                    <span className="text-sm font-medium">
                      {replyingTo ? 'Rispondendo a' : 'Citando'} {
                        ((replyingTo || quotedMessage)?.user_id === user?.id) 
                          ? 'te stesso' 
                          : userProfiles[(replyingTo || quotedMessage)?.user_id || '']?.display_name || 'Supporto'
                      }
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearReplyContext}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {(replyingTo || quotedMessage)?.content}
                </p>
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
              Invia Risposta
            </Button>
          </div>
        )}
      </CardContent>

      {/* Dialog per eliminazione singolo messaggio */}
      <AlertDialog open={showSingleDeleteDialog} onOpenChange={setShowSingleDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Elimina messaggio</AlertDialogTitle>
            <AlertDialogDescription>
              Come vuoi eliminare questo messaggio?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={deleteSingleMessageForMe} className="bg-orange-500 hover:bg-orange-600">
              Solo per me
            </AlertDialogAction>
            {/* Mostra "per entrambi" solo se è il proprio messaggio */}
            {replies.find(r => r.id === messageToDelete)?.user_id === user?.id && (
              <AlertDialogAction onClick={deleteSingleMessageForBoth} className="bg-red-500 hover:bg-red-600 text-white">
                Per entrambi
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog per eliminazione multipla */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Elimina {selectedMessages.length} messaggi</AlertDialogTitle>
            <AlertDialogDescription>
              Come vuoi eliminare i messaggi selezionati?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={deleteSelectedMessages} className="bg-orange-500 hover:bg-orange-600">
              Solo per me
            </AlertDialogAction>
            <AlertDialogAction onClick={deleteSelectedMessagesForBoth} className="bg-red-500 hover:bg-red-600 text-white">
              Elimina (smart)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};