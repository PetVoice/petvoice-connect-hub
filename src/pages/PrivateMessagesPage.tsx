import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Send, User } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadMessages();
      loadOtherUser();
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

  const loadMessages = async () => {
    if (!userId || !user) return;
    
    try {
      const { data, error } = await supabase
        .from('private_messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${userId}),and(sender_id.eq.${userId},recipient_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
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
          filter: `or(and(sender_id.eq.${user.id},recipient_id.eq.${userId}),and(sender_id.eq.${userId},recipient_id.eq.${user.id}))`
        },
        (payload) => {
          const newMessage = payload.new as PrivateMessage;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-primary/20">
              <AvatarImage src={otherUser.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-primary/10 to-accent/10 text-primary font-medium">
                {otherUser.display_name?.charAt(0)?.toUpperCase() || <User className="h-5 w-5" />}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <h1 className="text-xl font-semibold text-foreground">
                {otherUser.display_name}
              </h1>
              <p className="text-sm text-muted-foreground">Messaggi privati</p>
            </div>
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