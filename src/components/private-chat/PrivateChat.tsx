import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Send, ArrowLeft, User, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslatedToast } from '@/hooks/use-translated-toast';
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
  is_read: boolean;
  created_at: string;
  updated_at: string;
  metadata?: any;
  sender_name: string;
}

export const PrivateChat: React.FC = () => {
  console.log('🏗️ PrivateChat component loading...');
  const { user } = useAuth();
  const { showToast } = useTranslatedToast();
  const [chats, setChats] = useState<PrivateChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<PrivateChat | null>(null);
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.id) {
      loadChats();
    }
  }, [user?.id]);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id);
      markChatAsRead(selectedChat.id);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChats = async () => {
    try {
      setLoading(true);
      
      // Get all chats for the current user
      const { data: chatsData, error: chatsError } = await supabase
        .from('private_chats')
        .select(`
          *
        `)
        .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
        .eq('is_active', true)
        .order('last_message_at', { ascending: false });

      if (chatsError) {
        console.error('Error loading chats:', chatsError);
        return;
      }

      // For each chat, get the other user's info and last message
      const chatsWithDetails = await Promise.all(
        (chatsData || []).map(async (chat) => {
          const otherUserId = chat.participant_1_id === user.id 
            ? chat.participant_2_id 
            : chat.participant_1_id;

          // Get other user's profile
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('user_id, display_name, avatar_url')
            .eq('user_id', otherUserId)
            .maybeSingle();

          // Get last message
          const { data: lastMessage } = await supabase
            .from('private_messages')
            .select('content, sender_id, created_at')
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Count unread messages
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
              display_name: userProfile?.display_name?.split(' ')[0] || 'Utente Sconosciuto',
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
      showToast({
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
        .select(`
          *
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        return;
      }

      // Get sender names for each message
      const messagesWithNames = await Promise.all(
        (messagesData || []).map(async (message) => {
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('user_id', message.sender_id)
            .maybeSingle();

          return {
            ...message,
            sender_name: senderProfile?.display_name?.split(' ')[0] || 'Utente Sconosciuto'
          };
        })
      );

      setMessages(messagesWithNames);
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

    console.log('🚀 PrivateChat - Starting to send message:', newMessage.trim());
    console.log('📋 PrivateChat - Selected chat ID:', selectedChat?.id);

    try {
      setSendingMessage(true);


      const { error } = await supabase
        .from('private_messages')
        .insert({
          chat_id: selectedChat.id,
          sender_id: user.id,
          recipient_id: selectedChat.other_user.id,
          content: newMessage.trim(),
          message_type: 'text'
        });

      if (error) {
        console.error('Error sending message:', error);
        showToast({
          title: "Errore",
          description: "Impossibile inviare il messaggio",
          variant: "destructive"
        });
        return;
      }

      setNewMessage('');
      await loadMessages(selectedChat.id);
      await loadChats(); // Refresh chat list to update last message

    } catch (error) {
      console.error('Error sending message:', error);
      showToast({
        title: "Errore",
        description: "Impossibile inviare il messaggio",
        variant: "destructive"
      });
    } finally {
      setSendingMessage(false);
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
        <Card className="h-full bg-gradient-to-br from-violet-50/80 to-purple-50/60 border-violet-200/50 shadow-elegant hover:shadow-glow transition-all duration-300">
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
        <Card className="h-full bg-gradient-to-br from-sky-50/80 to-blue-50/60 border-sky-200/50 shadow-elegant hover:shadow-glow transition-all duration-300">
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
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_id === user.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-3 py-2 ${
                            message.sender_id === user.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className={`flex items-center gap-1 mt-1 ${
                            message.sender_id === user.id ? 'justify-end' : 'justify-start'
                          }`}>
                            <span className={`text-xs ${
                              message.sender_id === user.id 
                                ? 'text-primary-foreground/70' 
                                : 'text-muted-foreground'
                            }`}>
                              {formatDistanceToNow(new Date(message.created_at), {
                                addSuffix: true,
                                locale: it
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Scrivi un messaggio..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={sendingMessage}
                    />
                    <Button 
                      onClick={sendMessage} 
                      disabled={!newMessage.trim() || sendingMessage}
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
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