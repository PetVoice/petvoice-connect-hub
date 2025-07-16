import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { CheckSquare, Square, Trash2, X } from 'lucide-react';

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
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
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
    console.log('🔄 Setting up real-time subscription for channel:', channelId);
    
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
          console.log('📨 New message received via real-time:', payload.new);
          const newMessage = payload.new as Message;
          setMessages(prev => {
            // Evita duplicati controllando se il messaggio esiste già
            const exists = prev.some(msg => msg.id === newMessage.id);
            if (exists) {
              console.log('⚠️ Message already exists, skipping:', newMessage.id);
              return prev;
            }
            console.log('✅ Adding new message to state:', newMessage.id);
            return [...prev, newMessage];
          });
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
          console.log('📝 Message updated via real-time:', payload.new);
          const updatedMessage = payload.new as Message;
          setMessages(prev => 
            prev.map(msg => 
              msg.id === updatedMessage.id ? updatedMessage : msg
            )
          );
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status for', channelId, ':', status);
      });

    return () => {
      console.log('🔌 Removing real-time subscription for channel:', channelId);
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (content: string, messageType: string = 'text', fileUrl?: string, voiceDuration?: number) => {
    if (!user || (!content?.trim() && !fileUrl)) return;

    try {
      const messageData = {
        user_id: user.id,
        channel_id: crypto.randomUUID(), // Generiamo un UUID temporaneo per compatibilità
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
    const userMessages = messages.filter(msg => msg.user_id === user?.id);
    const allUserMessageIds = userMessages.map(msg => msg.id);
    setSelectedMessages(allUserMessageIds);
  };

  const deselectAllMessages = () => {
    setSelectedMessages([]);
  };

  const deleteSelectedMessages = async () => {
    if (selectedMessages.length === 0) return;

    try {
      const { error } = await supabase
        .from('community_messages')
        .update({ deleted_at: new Date().toISOString() })
        .in('id', selectedMessages)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Remove from local state
      setMessages(prev => prev.filter(msg => !selectedMessages.includes(msg.id)));
      setSelectedMessages([]);
      setIsSelectionMode(false);
      setShowBulkDeleteDialog(false);

      toast({
        title: "Messaggi eliminati",
        description: `${selectedMessages.length} messaggi sono stati eliminati con successo`
      });
    } catch (error) {
      console.error('Error deleting messages:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare i messaggi selezionati",
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
        <div className="py-2 border-b bg-muted/20">
          {!isSelectionMode ? (
            <div className="flex items-center justify-between px-4">
              <div className="font-semibold">Chat: {channelName}</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSelectionMode}
                className="text-muted-foreground hover:text-foreground"
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Seleziona
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSelectionMode}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
                <span className="font-semibold">
                  {selectedMessages.length} selezionati
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectedMessages.length === messages.filter(msg => msg.user_id === user?.id).length ? deselectAllMessages : selectAllMessages}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {selectedMessages.length === messages.filter(msg => msg.user_id === user?.id).length ? (
                    <Square className="h-4 w-4 mr-2" />
                  ) : (
                    <CheckSquare className="h-4 w-4 mr-2" />
                  )}
                  {selectedMessages.length === messages.filter(msg => msg.user_id === user?.id).length ? 'Deseleziona' : 'Seleziona tutto'}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowBulkDeleteDialog(true)}
                  disabled={selectedMessages.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Elimina ({selectedMessages.length})
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <MessageList 
          messages={messages}
          currentUserId={user?.id || ''}
          onDeleteMessage={deleteMessage}
          onEditMessage={editMessage}
          isSelectionMode={isSelectionMode}
          selectedMessages={selectedMessages}
          onToggleSelection={toggleMessageSelection}
        />
        
        <div ref={messagesEndRef} />
      </div>
      
      <MessageInput onSendMessage={sendMessage} />

      {/* Bulk delete confirmation dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare {selectedMessages.length} messaggi selezionati? Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteSelectedMessages}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Elimina {selectedMessages.length} messaggi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};