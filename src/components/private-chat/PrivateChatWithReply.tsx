import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Send, ArrowLeft, User, Clock, Reply, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface PrivateChat {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  initiated_by: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  is_active: boolean;
  other_user: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
  last_message?: {
    content: string;
    sender_id: string;
    created_at: string;
  };
  unread_count: number;
}

interface PrivateMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  message_type: string;
  reply_to_id: string | null;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  metadata?: any;
  sender_name: string;
}

export const PrivateChatWithReply: React.FC = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState<PrivateChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<PrivateChat | null>(null);
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyToMessage, setReplyToMessage] = useState<PrivateMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.id) {
      loadChats();
      setupRealtimeSubscription();
    }
  }, [user?.id]);

  useEffect(() => {
    if (selectedChat) {
      console.log('📱 Loading messages for chat:', selectedChat.id);
      loadMessages(selectedChat.id);
      markChatAsRead(selectedChat.id);
    }
  }, [selectedChat]);

  useEffect(() => {
    console.log('📜 Messages updated, count:', messages.length, 'hasUnreadMessages:', hasUnreadMessages);
    
    // Solo quando carico i messaggi per la prima volta (apertura chat)
    if (hasUnreadMessages && messages.length > 0) {
      scrollToFirstUnreadMessage();
    } else if (messages.length > 0 && !hasUnreadMessages) {
      // Scroll normale in fondo solo se non ci sono messaggi non letti
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [messages.length]); // Dipende solo dal numero di messaggi, non dall'array completo

  const scrollToBottom = () => {
    console.log('⬇️ Scrolling to bottom');
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToFirstUnreadMessage = () => {
    if (!selectedChat || !user) return;
    
    console.log('🔍 Looking for first unread message');
    const firstUnreadMessage = messages.find(
      msg => !msg.is_read && msg.recipient_id === user.id
    );
    
    if (firstUnreadMessage) {
      console.log('📍 Found first unread message:', firstUnreadMessage.id);
      setTimeout(() => {
        scrollToMessage(firstUnreadMessage.id);
        setHasUnreadMessages(false);
      }, 200);
    } else {
      console.log('📍 No unread messages found, scrolling to bottom');
      scrollToBottom();
      setHasUnreadMessages(false);
    }
  };

  const scrollToMessage = (messageId: string) => {
    console.log('🎯 Scrolling to message:', messageId);
    const messageElement = document.getElementById(`private-message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      messageElement.classList.add('bg-yellow-200', 'dark:bg-yellow-900');
      setTimeout(() => {
        messageElement.classList.remove('bg-yellow-200', 'dark:bg-yellow-900');
      }, 2000);
    } else {
      console.log('❌ Message element not found:', messageId);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('private-messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'private_messages'
        },
        (payload) => {
          const newMessage = payload.new as PrivateMessage;
          console.log('📨 Realtime message received:', newMessage.id, 'sender:', newMessage.sender_id);
          
          // Solo se il messaggio è per la chat selezionata
          if (selectedChat && newMessage.chat_id === selectedChat.id) {
            console.log('✅ Message is for current chat, processing...');
            
            // Aggiungi il messaggio con il nome del mittente
            const messageWithName = {
              ...newMessage,
              sender_name: newMessage.sender_id === user?.id ? 'Tu' : selectedChat.other_user.display_name
            };
            
            setMessages(prev => {
              // Evita duplicati
              if (prev.some(msg => msg.id === newMessage.id)) {
                console.log('⚠️ Duplicate message detected, skipping');
                return prev;
              }
              console.log('➕ Adding realtime message to UI');
              return [...prev, messageWithName];
            });
            
            // Se il messaggio NON è mio (messaggio ricevuto), scrolla
            if (newMessage.sender_id !== user?.id) {
              console.log('📬 Received message from other user, scrolling to bottom');
              setTimeout(() => scrollToBottom(), 50);
            }
          } else {
            console.log('ℹ️ Message not for current chat or no chat selected');
          }
          
          console.log('🔄 Updating chat list from realtime...');
          // Solo aggiorna l'ultimo messaggio senza ricaricare tutto
          updateLastMessageInChatList(newMessage);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const updateLastMessageInChatList = (newMessage: PrivateMessage) => {
    setChats(prevChats => 
      prevChats.map(chat => {
        if (chat.id === newMessage.chat_id) {
          return {
            ...chat,
            last_message: {
              content: newMessage.content,
              sender_id: newMessage.sender_id,
              created_at: newMessage.created_at
            },
            last_message_at: newMessage.created_at,
            // Aggiorna unread count solo se il messaggio non è mio
            unread_count: newMessage.sender_id === user?.id ? chat.unread_count : chat.unread_count + 1
          };
        }
        return chat;
      })
    );
  };

  const loadChats = async () => {
    try {
      setLoading(true);
      
      const { data: chatsData, error: chatsError } = await supabase
        .from('private_chats')
        .select('*')
        .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
        .eq('is_active', true)
        .order('last_message_at', { ascending: false });

      if (chatsError) {
        console.error('Error loading chats:', chatsError);
        return;
      }

      const chatsWithDetails = await Promise.all(
        (chatsData || []).map(async (chat) => {
          const otherUserId = chat.participant_1_id === user.id 
            ? chat.participant_2_id 
            : chat.participant_1_id;

          const { data: userProfile } = await supabase
            .from('profiles')
            .select('user_id, display_name, avatar_url')
            .eq('user_id', otherUserId)
            .single();

          const { data: lastMessage } = await supabase
            .from('private_messages')
            .select('content, sender_id, created_at')
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          const { count: unreadCount } = await supabase
            .from('private_messages')
            .select('*', { count: 'exact' })
            .eq('chat_id', chat.id)
            .eq('recipient_id', user.id)
            .eq('is_read', false);

          return {
            ...chat,
            other_user: {
              id: otherUserId,
              display_name: userProfile?.display_name || 'Utente Sconosciuto',
              avatar_url: userProfile?.avatar_url
            },
            last_message: lastMessage,
            unread_count: unreadCount || 0
          };
        })
      );

      setChats(chatsWithDetails);
    } catch (error) {
      console.error('Error loading chats:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le chat",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const { data: messagesData, error } = await supabase
        .from('private_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        return;
      }

      const messagesWithNames = await Promise.all(
        (messagesData || []).map(async (message) => {
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('user_id', message.sender_id)
            .single();

          return {
            ...message,
            sender_name: senderProfile?.display_name || 'Utente Sconosciuto'
          };
        })
      );

      setMessages(messagesWithNames);
      
      // Verifica se ci sono messaggi non letti quando carico i messaggi
      const hasUnread = messagesWithNames.some(
        msg => !msg.is_read && msg.recipient_id === user?.id
      );
      console.log('📊 Messages loaded, hasUnread:', hasUnread, 'total messages:', messagesWithNames.length);
      setHasUnreadMessages(hasUnread);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const markChatAsRead = async (chatId: string) => {
    try {
      await supabase
        .from('private_messages')
        .update({ is_read: true })
        .eq('chat_id', chatId)
        .eq('recipient_id', user.id)
        .eq('is_read', false);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || sendingMessage) return;

    console.log('🚀 Starting to send message:', newMessage.trim());
    
    try {
      setSendingMessage(true);

      console.log('📤 Inserting message to database...');
      const { data, error } = await supabase
        .from('private_messages')
        .insert({
          chat_id: selectedChat.id,
          sender_id: user.id,
          recipient_id: selectedChat.other_user.id,
          content: newMessage.trim(),
          message_type: 'text',
          reply_to_id: replyToMessage?.id || null
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error sending message:', error);
        toast({
          title: "Errore",
          description: "Impossibile inviare il messaggio",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Message inserted successfully:', data);
      setNewMessage('');
      setReplyToMessage(null);
      
      // Aggiungi immediatamente il messaggio alla UI per feedback istantaneo
      if (data) {
        console.log('📝 Adding message to UI immediately');
        const messageWithName = {
          ...data,
          sender_name: 'Tu'
        };
        
        setMessages(prev => {
          if (prev.some(msg => msg.id === data.id)) {
            console.log('⚠️ Message already exists in UI');
            return prev;
          }
          console.log('➕ Adding new message to UI');
          return [...prev, messageWithName];
        });
        
        // Scroll immediato
        setTimeout(() => {
          console.log('⬇️ Scrolling to bottom after UI update');
          scrollToBottom();
        }, 50);
      }
      
      console.log('🔄 NOT reloading chats to avoid component re-render');
      // NON chiamare loadChats() qui - causa il reload del componente

    } catch (error) {
      console.error('💥 Unexpected error sending message:', error);
      toast({
        title: "Errore",
        description: "Impossibile inviare il messaggio",
        variant: "destructive"
      });
    } finally {
      setSendingMessage(false);
      console.log('🏁 Send message completed');
    }
  };

  const handleReply = (message: PrivateMessage) => {
    setReplyToMessage(message);
  };

  const cancelReply = () => {
    setReplyToMessage(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    console.log('⌨️ Key pressed:', e.key, 'shiftKey:', e.shiftKey);
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      console.log('🎯 Enter pressed, preventing default and sending message');
      if (!newMessage.trim() || sendingMessage) return;
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <MessageCircle className="h-8 w-8 animate-pulse text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">Caricamento chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Chat List */}
      <div className="lg:col-span-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Chat Private ({chats.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {chats.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nessuna chat attiva</p>
                  <p className="text-sm mt-1">
                    Usa "Connetti" in Pet Matching per iniziare una conversazione
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {chats.map((chat) => (
                    <div
                      key={chat.id}
                      className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedChat?.id === chat.id ? 'bg-muted' : ''
                      }`}
                      onClick={() => setSelectedChat(chat)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={chat.other_user.avatar_url} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm truncate">
                              {chat.other_user.display_name}
                            </h4>
                            {chat.unread_count > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {chat.unread_count}
                              </Badge>
                            )}
                          </div>
                          {chat.last_message && (
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              {chat.last_message.sender_id === user.id ? 'Tu: ' : ''}
                              {chat.last_message.content}
                            </p>
                          )}
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(chat.last_message_at), {
                                addSuffix: true,
                                locale: it
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Chat Messages */}
      <div className="lg:col-span-2">
        <Card className="h-full">
          {selectedChat ? (
            <>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden"
                    onClick={() => setSelectedChat(null)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedChat.other_user.avatar_url} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{selectedChat.other_user.display_name}</h3>
                    <p className="text-xs text-muted-foreground">Chat privata</p>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="p-0 flex flex-col h-[500px]">
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isOwn = message.sender_id === user.id;
                      const replyToMessage = message.reply_to_id ? 
                        messages.find(m => m.id === message.reply_to_id) : null;

                      return (
                        <div
                          key={message.id}
                          id={`private-message-${message.id}`}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] rounded-lg px-3 py-2 ${
                            isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'
                          }`}>
                            {/* Reply Quote */}
                            {replyToMessage && (
                              <div 
                                className="mb-2 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => scrollToMessage(replyToMessage.id)}
                              >
                                <div className={`p-2 rounded border-l-2 ${
                                  isOwn 
                                    ? 'bg-primary-foreground/10 border-primary-foreground/30' 
                                    : 'bg-muted-foreground/10 border-muted-foreground/30'
                                }`}>
                                  <div className={`text-xs font-medium ${
                                    isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                  }`}>
                                    {replyToMessage.sender_id === user.id ? 'Tu' : selectedChat.other_user.display_name}
                                  </div>
                                  <div className={`text-xs ${
                                    isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground/80'
                                  }`}>
                                    {truncateText(replyToMessage.content || '', 50)}
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-end gap-2">
                              <div className="flex-1">
                                <p className="text-sm">{message.content}</p>
                                <div className={`flex items-center gap-1 mt-1 ${
                                  isOwn ? 'justify-end' : 'justify-start'
                                }`}>
                                  <span className={`text-xs ${
                                    isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                  }`}>
                                    {formatDistanceToNow(new Date(message.created_at), {
                                      addSuffix: true,
                                      locale: it
                                    })}
                                  </span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`h-6 w-6 p-0 ${
                                  isOwn 
                                    ? 'hover:bg-primary-foreground/20 text-primary-foreground/70' 
                                    : 'hover:bg-muted-foreground/20 text-muted-foreground'
                                }`}
                                onClick={() => handleReply(message)}
                              >
                                <Reply className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t">
                  {/* Reply Preview */}
                  {replyToMessage && (
                    <div className="mb-3 p-3 bg-muted/30 rounded border-l-2 border-primary">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-xs font-medium text-muted-foreground">
                          Rispondendo a {replyToMessage.sender_id === user.id ? 'te stesso' : selectedChat.other_user.display_name}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={cancelReply}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {truncateText(replyToMessage.content || '', 100)}
                      </div>
                    </div>
                  )}
                  
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('🚫 Form submit prevented');
                      if (!newMessage.trim() || sendingMessage) return;
                      sendMessage();
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      placeholder={replyToMessage ? "Rispondi..." : "Scrivi un messaggio..."}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={sendingMessage}
                      className="flex-1"
                    />
                    <Button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('🖱️ Send button clicked');
                        if (!newMessage.trim() || sendingMessage) return;
                        sendMessage();
                      }}
                      disabled={!newMessage.trim() || sendingMessage}
                      size="sm"
                      type="submit"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Seleziona una chat</h3>
                <p>Scegli una conversazione dalla lista per iniziare a chattare</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};