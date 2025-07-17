import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeft, Send, User, Reply, MoreVertical, Trash2, Archive } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface PrivateMessage {
  id: string;
  content: string | null;
  sender_id: string;
  recipient_id: string;
  created_at: string;
  is_read: boolean;
  message_type: string;
  file_url: string | null;
  voice_duration: number | null;
  deleted_by_sender: boolean;
  deleted_by_recipient: boolean;
  reply_to_id?: string | null;
  reply_to?: {
    id: string;
    content: string | null;
    user_name: string | null;
  } | null;
}

interface UserProfile {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
}

const PrivateMessagesPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Load draft from localStorage on mount
  useEffect(() => {
    if (userId) {
      const draft = localStorage.getItem(`private_message_draft_${userId}`);
      if (draft) {
        setNewMessage(draft);
      }
    }
  }, [userId]);

  // Auto-save draft
  useEffect(() => {
    if (userId && newMessage) {
      const timer = setTimeout(() => {
        localStorage.setItem(`private_message_draft_${userId}`, newMessage);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [newMessage, userId]);

  useEffect(() => {
    if (userId) {
      loadUserNames().then(() => {
        loadMessages();
        loadOtherUser();
      });
      setupRealtimeSubscription();
    }
  }, [userId]);

  const loadOtherUser = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('user_display_names')
        .select('user_id, display_name, avatar_url, is_online, last_seen')
        .eq('user_id', userId)
        .single();

      if (error) {
        // Fallback: try to get from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('user_id, display_name, avatar_url')
          .eq('user_id', userId)
          .single();
        
        if (profileError) throw profileError;
        
        setOtherUser({
          user_id: profileData.user_id,
          display_name: profileData.display_name || 'Utente',
          avatar_url: profileData.avatar_url
        });
      } else {
        setOtherUser(data);
      }
    } catch (error) {
      console.error('Error loading other user:', error);
      // Set minimal user info as fallback
      setOtherUser({
        user_id: userId,
        display_name: 'Utente',
        avatar_url: null
      });
    }
  };

  const loadUserNames = async () => {
    try {
      const { data, error } = await supabase
        .from('user_display_names')
        .select('user_id, display_name');

      if (error) throw error;
      
      const namesMap: Record<string, string> = {};
      data?.forEach(item => {
        namesMap[item.user_id] = item.display_name;
      });
      setUserNames(namesMap);
    } catch (error) {
      console.error('Error loading user names:', error);
    }
  };

  const loadMessages = async () => {
    if (!userId || !user) return;
    
    try {
      // Improved query for correct filtering
      const { data, error } = await supabase
        .from('private_messages')
        .select(`
          *,
          reply_to:private_messages!reply_to_id (
            id,
            content,
            sender_id
          )
        `)
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${userId}),and(sender_id.eq.${userId},recipient_id.eq.${user.id})`)
        .eq('deleted_by_sender', false)
        .eq('deleted_by_recipient', false)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Processa i messaggi per includere reply_to con user_name
      const processedMessages = data?.map(msg => {
        const replyToData = Array.isArray(msg.reply_to) ? msg.reply_to[0] : msg.reply_to;
        
        return {
          ...msg,
          reply_to: replyToData ? {
            id: replyToData.id,
            content: replyToData.content,
            user_name: userNames[replyToData.sender_id] || 'Utente sconosciuto'
          } : null
        };
      }) || [];
      
      setMessages(processedMessages);
      
      // Auto-scroll to bottom after loading messages
      setTimeout(() => {
        const scrollArea = document.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollArea) {
          scrollArea.scrollTop = scrollArea.scrollHeight;
        }
      }, 100);
      
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i messaggi",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!userId || !user) return;

    const channel = supabase
      .channel(`private-messages-${user.id}-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'private_messages',
          filter: `or(and(sender_id.eq.${user.id},recipient_id.eq.${userId}),and(sender_id.eq.${userId},recipient_id.eq.${user.id}))`
        },
        async (payload) => {
          console.log('📨 New private message received via real-time:', payload.new);
          const newMessage = payload.new as PrivateMessage;
          
          // Process the reply information if it exists
          const processedMessage = await processMessageReply(newMessage);
          
          // Add to messages if not already present
          setMessages(prev => {
            const exists = prev.find(m => m.id === processedMessage.id);
            if (exists) return prev;
            
            // Insert in chronological order
            const updated = [...prev, processedMessage].sort((a, b) => 
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
            
            console.log('✅ Adding new message to state:', processedMessage.id);
            return updated;
          });
          
          // Auto-scroll to bottom when new message arrives
          setTimeout(() => {
            const scrollArea = document.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollArea) {
              scrollArea.scrollTop = scrollArea.scrollHeight;
            }
          }, 100);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const processMessageReply = async (message: PrivateMessage): Promise<PrivateMessage> => {
    if (!message.reply_to_id) {
      return message;
    }

    // Cerca prima nei messaggi già caricati
    const existingReplyMessage = messages.find(m => m.id === message.reply_to_id);
    if (existingReplyMessage) {
      return {
        ...message,
        reply_to: {
          id: existingReplyMessage.id,
          content: existingReplyMessage.content,
          user_name: userNames[existingReplyMessage.sender_id] || 'Utente sconosciuto'
        }
      };
    }

    // Se non trovato, carica dal database
    try {
      const { data, error } = await supabase
        .from('private_messages')
        .select('id, content, sender_id')
        .eq('id', message.reply_to_id)
        .single();

      if (error) throw error;

      return {
        ...message,
        reply_to: {
          id: data.id,
          content: data.content,
          user_name: userNames[data.sender_id] || 'Utente sconosciuto'
        }
      };
    } catch (error) {
      console.error('Error loading reply message:', error);
      return message;
    }
  };

  const deleteConversation = async (deleteType: 'soft' | 'hard') => {
    if (!userId || !user) return;

    try {
      if (deleteType === 'hard') {
        // Hard delete: remove all messages completely
        const { error } = await supabase
          .from('private_messages')
          .delete()
          .or(`and(sender_id.eq.${user.id},recipient_id.eq.${userId}),and(sender_id.eq.${userId},recipient_id.eq.${user.id})`);

        if (error) throw error;
        
        toast({
          title: "Conversazione eliminata",
          description: "La conversazione è stata eliminata definitivamente"
        });
      } else {
        // Soft delete: mark as deleted for current user
        const { error } = await supabase
          .from('private_messages')
          .update({ 
            deleted_by_sender: true 
          })
          .eq('sender_id', user.id)
          .in('recipient_id', [userId]);

        if (error) throw error;

        // Also mark messages where current user is recipient
        const { error: error2 } = await supabase
          .from('private_messages')
          .update({ 
            deleted_by_recipient: true 
          })
          .eq('recipient_id', user.id)
          .in('sender_id', [userId]);

        if (error2) throw error2;

        toast({
          title: "Conversazione nascosta",
          description: "La conversazione è stata nascosta per te. Torna alla community se vuoi ripristinarla."
        });
      }

      // Navigate back to community
      navigate('/community');
      
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare la conversazione",
        variant: "destructive"
      });
    }
  };

  const undoDeleteConversation = async () => {
    if (!userId || !user) return;

    try {
      // Restore messages for current user
      const { error } = await supabase
        .from('private_messages')
        .update({ 
          deleted_by_sender: false 
        })
        .eq('sender_id', user.id)
        .in('recipient_id', [userId]);

      if (error) throw error;

      const { error: error2 } = await supabase
        .from('private_messages')
        .update({ 
          deleted_by_recipient: false 
        })
        .eq('recipient_id', user.id)
        .in('sender_id', [userId]);

      if (error2) throw error2;

      // Reload messages
      loadMessages();

      toast({
        title: "Conversazione ripristinata",
        description: "La conversazione è stata ripristinata"
      });
      
    } catch (error) {
      console.error('Error restoring conversation:', error);
      toast({
        title: "Errore",
        description: "Impossibile ripristinare la conversazione",
        variant: "destructive"
      });
    }
  };

  const sendMessage = async () => {
    const trimmedMessage = newMessage.trim();
    
    // Validazione
    if (!trimmedMessage || !userId || !user) return;
    if (trimmedMessage.length > 1000) {
      toast({
        title: "Errore",
        description: "Il messaggio è troppo lungo (max 1000 caratteri)",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('private_messages')
        .insert([{
          sender_id: user.id,
          recipient_id: userId,
          content: trimmedMessage,
          message_type: 'text'
        }])
        .select()
        .single();

      if (error) throw error;

      setNewMessage('');
      // Clear localStorage draft
      localStorage.removeItem(`private_message_draft_${userId}`);
      
      // Aggiunge il messaggio alla lista se non è già presente (real-time potrebbe averlo già aggiunto)
      setMessages(prev => {
        const exists = prev.find(m => m.id === data.id);
        return exists ? prev : [...prev, data];
      });

      // Success feedback
      toast({
        title: "Messaggio inviato",
        description: "Il tuo messaggio è stato inviato con successo"
      });

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Errore",
        description: "Impossibile inviare il messaggio. Riprova più tardi.",
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Caricamento chat privata...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/community')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Torna alla community
        </Button>
        {otherUser && (
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherUser.avatar_url || undefined} />
              <AvatarFallback className="text-sm font-semibold">
                {otherUser.display_name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-xl font-semibold">
                {otherUser.display_name}
              </h1>
              <div className="text-sm text-muted-foreground">
                Chat privata
              </div>
            </div>
            
            {/* Menu conversazione */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Archive className="h-4 w-4 mr-2" />
                      Nascondi conversazione
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Nascondere la conversazione?</AlertDialogTitle>
                      <AlertDialogDescription>
                        La conversazione sarà nascosta dalla tua lista ma non sarà eliminata definitivamente. 
                        Potrai ripristinarla in seguito.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annulla</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteConversation('soft')}>
                        Nascondi
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Elimina definitivamente
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Eliminare definitivamente?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Questa azione eliminerà definitivamente tutti i messaggi della conversazione. 
                        <strong className="text-destructive"> Questa azione non può essere annullata.</strong>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annulla</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => deleteConversation('hard')}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Elimina definitivamente
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle>Messaggi Privati</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 mb-4">
            <div className="space-y-2 px-2">
              {messages.map((message, index) => {
                const isOwn = message.sender_id === user?.id;
                const showAvatar = !isOwn && (index === 0 || messages[index - 1]?.sender_id !== message.sender_id);
                const showName = !isOwn && showAvatar;
                
                return (
                  <div
                    key={message.id}
                    data-message-id={message.id}
                    className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* Avatar per messaggi ricevuti */}
                    {!isOwn && (
                      <div className="flex-shrink-0">
                        {showAvatar ? (
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={otherUser?.avatar_url || undefined} />
                            <AvatarFallback className="text-xs">
                              {otherUser?.display_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-6 h-6" />
                        )}
                      </div>
                    )}
                    
                    <div className={`max-w-[70%] ${isOwn ? 'text-right' : 'text-left'}`}>
                      {/* Nome utente se necessario */}
                      {showName && (
                        <div className="text-xs text-muted-foreground mb-1 px-1">
                          {userNames[message.sender_id] || otherUser?.display_name || 'Utente sconosciuto'}
                        </div>
                      )}
                      
                      <div
                        className={`rounded-2xl px-4 py-2 break-words shadow-sm ${
                          isOwn
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-muted rounded-bl-md'
                        }`}
                      >
                        {/* Messaggio a cui si sta rispondendo */}
                        {message.reply_to && (
                          <div 
                            className={`text-xs mb-2 p-2 rounded-lg border-l-2 cursor-pointer transition-colors hover:bg-opacity-80 ${
                              isOwn 
                                ? 'bg-primary-foreground/20 border-primary-foreground/50 text-primary-foreground/80 hover:bg-primary-foreground/30'
                                : 'bg-muted-foreground/10 border-muted-foreground/30 text-muted-foreground hover:bg-muted-foreground/20'
                            }`}
                            onClick={() => {
                              // Scroll to original message
                              const originalElement = document.querySelector(`[data-message-id="${message.reply_to?.id}"]`);
                              if (originalElement) {
                                originalElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                // Highlight effect
                                originalElement.classList.add('animate-pulse');
                                setTimeout(() => {
                                  originalElement.classList.remove('animate-pulse');
                                }, 2000);
                              }
                            }}
                            title="Clicca per andare al messaggio originale"
                          >
                            <div className="flex items-center gap-1 mb-1">
                              <Reply className="h-3 w-3" />
                              Risposta a: {message.reply_to.user_name || 'Utente sconosciuto'}
                            </div>
                            <div className="truncate italic">"{message.reply_to.content || 'Messaggio multimediale'}"</div>
                          </div>
                        )}
                        
                        <div className="text-sm leading-relaxed">{message.content}</div>
                      </div>
                      
                      {/* Timestamp e status */}
                      <div className={`text-xs text-muted-foreground mt-1 px-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                        {formatDistanceToNow(new Date(message.created_at), { 
                          addSuffix: true, 
                          locale: it 
                        })}
                        {isOwn && (
                          <span className="ml-2">
                            ✓ Inviato
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Spacer per messaggi inviati */}
                    {isOwn && <div className="w-6" />}
                  </div>
                );
              })}
              
              {/* Typing indicator placeholder */}
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <div className="text-lg mb-2">💬</div>
                  <div>Nessun messaggio ancora</div>
                  <div className="text-sm">Inizia la conversazione!</div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="space-y-2">
            {/* Character count */}
            <div className="text-xs text-muted-foreground text-right">
              {newMessage.length}/1000 caratteri
              {newMessage.length > 900 && (
                <span className="text-destructive ml-2">
                  ({1000 - newMessage.length} rimanenti)
                </span>
              )}
            </div>
            
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Scrivi un messaggio... (Enter per inviare, Shift+Enter per andare a capo)"
                  className="min-h-[60px] max-h-[120px] resize-none"
                  maxLength={1000}
                />
                <div className="text-xs text-muted-foreground">
                  💡 Tip: Premi Enter per inviare, Shift+Enter per andare a capo
                </div>
              </div>
              
              <Button 
                onClick={sendMessage} 
                disabled={!newMessage.trim() || newMessage.length > 1000}
                size="lg"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivateMessagesPage;