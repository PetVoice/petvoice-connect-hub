import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Send, User, Reply } from 'lucide-react';
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
        .select('user_id, display_name, avatar_url')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setOtherUser(data);
    } catch (error) {
      console.error('Error loading other user:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i dati dell'utente",
        variant: "destructive"
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
        .or(`sender_id.eq.${user.id},sender_id.eq.${userId}`)
        .or(`recipient_id.eq.${userId},recipient_id.eq.${user.id}`)
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
      .channel(`private-messages-${userId}`)
        .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'private_messages',
          filter: `sender_id.in.(${user.id},${userId}),recipient_id.in.(${user.id},${userId})`
        },
        async (payload) => {
          const newMessage = payload.new as PrivateMessage;
          const processedMessage = await processMessageReply(newMessage);
          setMessages(prev => [...prev, processedMessage]);
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

  const sendMessage = async () => {
    if (!newMessage.trim() || !userId || !user) return;

    try {
      const { data, error } = await supabase
        .from('private_messages')
        .insert([{
          sender_id: user.id,
          recipient_id: userId,
          content: newMessage.trim(),
          message_type: 'text'
        }])
        .select()
        .single();

      if (error) throw error;

      setNewMessage('');
      setMessages(prev => [...prev, data]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Errore",
        description: "Impossibile inviare il messaggio",
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
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={otherUser.avatar_url || undefined} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <h1 className="text-xl font-semibold">
              Chat con {otherUser.display_name}
            </h1>
          </div>
        )}
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle>Messaggi Privati</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 mb-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.sender_id === user?.id
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {/* Nome utente sopra il messaggio se non è proprio */}
                    {message.sender_id !== user?.id && (
                      <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {userNames[message.sender_id] || 'Utente sconosciuto'}
                      </div>
                    )}
                    
                    {/* Messaggio a cui si sta rispondendo */}
                    {message.reply_to && (
                      <div className="text-xs text-muted-foreground mb-2 p-2 bg-muted/50 rounded border-l-2 border-primary/30">
                        <div className="flex items-center gap-1 mb-1">
                          <Reply className="h-3 w-3" />
                          Risposta a: {message.reply_to.user_name || 'Utente sconosciuto'}
                        </div>
                        <div className="truncate italic">"{message.reply_to.content || 'Messaggio multimediale'}"</div>
                      </div>
                    )}
                    
                    <div className="break-words">{message.content}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(message.created_at), { 
                        addSuffix: true, 
                        locale: it 
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Scrivi un messaggio..."
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivateMessagesPage;