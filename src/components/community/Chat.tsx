import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { toast } from '@/hooks/use-toast';

interface ChatProps {
  channelId: string;
  channelName: string;
}

export interface Message {
  id: string;
  content: string | null;
  file_url: string | null;
  message_type: string;
  user_id: string;
  channel_id: string;
  channel_name: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  voice_duration: number | null;
  metadata: any;
  is_emergency: boolean | null;
}

export const Chat: React.FC<ChatProps> = ({ channelId, channelName }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    loadMessages();
    setupRealtimeSubscription();
  }, [channelId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('community_messages')
        .select('*')
        .eq('channel_name', channelId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
        .limit(100);

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
    const channel = supabase
      .channel(`chat-${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages',
          filter: `channel_name=eq.${channelId}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'community_messages',
          filter: `channel_name=eq.${channelId}`
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          setMessages(prev => 
            prev.map(msg => 
              msg.id === updatedMessage.id ? updatedMessage : msg
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (content: string, messageType: string = 'text', fileUrl?: string, voiceDuration?: number) => {
    if (!user || (!content?.trim() && !fileUrl)) return;

    try {
      const messageData = {
        user_id: user.id,
        channel_id: channelId, // Usa channelId invece di channel_name
        channel_name: channelId,
        content: content?.trim() || null,
        message_type: messageType,
        file_url: fileUrl || null,
        voice_duration: voiceDuration || null,
        metadata: {}
      };

      const { error } = await supabase
        .from('community_messages')
        .insert([messageData]);

      if (error) throw error;

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Errore",
        description: "Impossibile inviare il messaggio",
        variant: "destructive"
      });
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('community_messages')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', messageId)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Remove from local state
      setMessages(prev => prev.filter(msg => msg.id !== messageId));

      toast({
        title: "Messaggio eliminato",
        description: "Il messaggio è stato eliminato con successo"
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare il messaggio",
        variant: "destructive"
      });
    }
  };

  const editMessage = async (messageId: string, newContent: string) => {
    if (!newContent.trim()) return;

    try {
      const { error } = await supabase
        .from('community_messages')
        .update({ 
          content: newContent.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Messaggio modificato",
        description: "Il messaggio è stato modificato con successo"
      });
    } catch (error) {
      console.error('Error editing message:', error);
      toast({
        title: "Errore",
        description: "Impossibile modificare il messaggio",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Caricamento chat...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="text-center py-2 border-b bg-muted/20">
          <div className="font-semibold">Chat: {channelName}</div>
        </div>
        
        <MessageList 
          messages={messages}
          currentUserId={user?.id || ''}
          onDeleteMessage={deleteMessage}
          onEditMessage={editMessage}
        />
        
        <div ref={messagesEndRef} />
      </div>
      
      <MessageInput onSendMessage={sendMessage} />
    </div>
  );
};