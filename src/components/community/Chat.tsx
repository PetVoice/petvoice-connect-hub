import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useUnifiedToast } from '@/hooks/use-unified-toast';
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
  reply_to_id: string | null;
}

export const Chat: React.FC<ChatProps> = ({ channelId, channelName }) => {
  const { user } = useAuth();
  const { showToast } = useUnifiedToast();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [showSingleDeleteDialog, setShowSingleDeleteDialog] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Funzione per iniziare una chat privata (stessa logica del Pet Matching)
  const startPrivateChat = async (targetUserId: string, targetUserName: string) => {
    if (!user || targetUserId === user.id) return;

    try {
      // Check if chat already exists between these users
      const { data: existingChat } = await supabase
        .from('private_chats')
        .select('id, deleted_by_participant_1, deleted_by_participant_2, participant_1_id')
        .or(`and(participant_1_id.eq.${user.id},participant_2_id.eq.${targetUserId}),and(participant_1_id.eq.${targetUserId},participant_2_id.eq.${user.id})`)
        .eq('is_active', true)
        .maybeSingle();

      let chatId = null;

      if (existingChat) {
        const isParticipant1 = existingChat.participant_1_id === user.id;
        const isDeletedByCurrentUser = isParticipant1 ? existingChat.deleted_by_participant_1 : existingChat.deleted_by_participant_2;
        
        if (isDeletedByCurrentUser) {
          // Riattiva la chat per entrambi gli utenti
          const { error: reactivateError } = await supabase
            .from('private_chats')
            .update({ 
              deleted_by_participant_1: false,
              deleted_by_participant_2: false,
              last_message_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', existingChat.id);

          if (reactivateError) {
            console.error('Error reactivating chat:', reactivateError);
            throw reactivateError;
          }
        }
        
        chatId = existingChat.id;
      } else {
        // Create new chat if it doesn't exist
        const { data: newChat, error: chatError } = await supabase
          .from('private_chats')
          .insert({
            participant_1_id: user.id,
            participant_2_id: targetUserId,
            initiated_by: user.id
          })
          .select('id')
          .single();

        if (chatError) {
          console.error('Error creating chat:', chatError);
          throw chatError;
        }

        chatId = newChat.id;
      }

      // Send initial message
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', user.id)
        .single();

      const userName = userProfile?.display_name?.split(' ')[0] || user.user_metadata?.display_name?.split(' ')[0] || 'Utente';

      const { error: messageError } = await supabase
        .from('private_messages')
        .insert({
          chat_id: chatId,
          sender_id: user.id,
          recipient_id: targetUserId,
          content: `👋 Ciao ${targetUserName}! Ti ho visto nel gruppo ${channelName} e mi piacerebbe continuare la conversazione in privato.`,
          message_type: 'text',
          metadata: {
            connection_type: 'community_chat',
            source_channel: channelName,
            is_connection_request: true
          }
        });

      if (messageError) {
        console.error('Error sending message:', messageError);
        throw messageError;
      }

      // Log the activity
      await supabase
        .from('activity_log')
        .insert({
          user_id: user.id,
          activity_type: 'private_chat_started',
          activity_description: `Avviata chat privata con ${targetUserName} dal gruppo ${channelName}`,
          metadata: {
            target_user_id: targetUserId,
            target_user_name: targetUserName,
            source_channel: channelName,
            connection_type: 'community_chat'
          }
        });

      showToast({
        title: "Chat privata avviata!",
        description: `Reindirizzamento alla chat con ${targetUserName}...`,
        type: 'message'
      });

      // Redirect to Community page private chat section with specific chat
      setTimeout(() => {
        navigate(`/community?tab=private&chatId=${chatId}`);
      }, 1000);
    } catch (error) {
      console.error('Error starting private chat:', error);
      showToast({
        title: "Errore",
        description: "Non è stato possibile avviare la chat privata. Riprova.",
        type: 'error'
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToMessage = (messageId: string) => {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      messageElement.classList.add('bg-yellow-200', 'dark:bg-yellow-900');
      setTimeout(() => {
        messageElement.classList.remove('bg-yellow-200', 'dark:bg-yellow-900');
      }, 2000);
    }
  };

  useEffect(() => {
    loadMessages();
    loadUserNames();
    setupRealtimeSubscription();
  }, [channelId]);

  // Scroll automatico quando entro nel canale
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [channelId]);

  // Scroll automatico quando arrivano nuovi messaggi
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [messages.length]);

  const loadMessages = async () => {
    try {
      const userNamesMap = await loadUserNames();
      
      // Prima query: ottieni tutti i messaggi non eliminati per tutti
      const { data: allMessages, error: messagesError } = await supabase
        .from('community_messages')
        .select('*')
        .eq('channel_name', channelId)
        .eq('deleted_by_all', false)
        .order('created_at', { ascending: true })
        .limit(100);

      if (messagesError) throw messagesError;

      // Seconda query: ottieni i messaggi che l'utente ha eliminato per sé
      const { data: deletedByUser, error: deletionsError } = await supabase
        .from('community_message_deletions')
        .select('message_id')
        .eq('user_id', user?.id);

      if (deletionsError) throw deletionsError;

      // Filtra i messaggi eliminati dall'utente
      const deletedMessageIds = new Set(deletedByUser?.map(d => d.message_id) || []);
      const filteredMessages = allMessages?.filter(msg => !deletedMessageIds.has(msg.id)) || [];
      
      setMessages(filteredMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      showToast({
        title: "Errore",
        description: "Impossibile caricare i messaggi",
        type: 'error'
      });
    } finally {
      setLoading(false);
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
      
      return namesMap;
    } catch (error) {
      console.error('Error loading user names:', error);
      return {};
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
        async (payload) => {
          console.log('📨 New message received via real-time:', payload.new);
          const newMessage = payload.new as Message;
          
          setMessages(prev => {
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
        channel_id: crypto.randomUUID(),
        channel_name: channelId,
        content: content?.trim() || null,
        message_type: messageType,
        file_url: fileUrl || null,
        voice_duration: voiceDuration || null,
        reply_to_id: replyToMessage?.id || null,
        metadata: {}
      };

      console.log('🚀 Sending message:', messageData);

      const { data, error } = await supabase
        .from('community_messages')
        .insert([messageData])
        .select()
        .single();

      if (error) {
        console.error('❌ Error sending message:', error);
        throw error;
      }

      console.log('✅ Message sent successfully:', data);
      
      if (data) {
        setMessages(prev => {
          const exists = prev.some(msg => msg.id === data.id);
          if (exists) return prev;
          return [...prev, data];
        });
      }

      // Clear reply after sending
      setReplyToMessage(null);

    } catch (error) {
      console.error('Error sending message:', error);
      showToast({
        title: "Errore",
        description: "Impossibile inviare il messaggio",
        type: 'error'
      });
    }
  };

  const showDeleteDialog = (messageId: string) => {
    setMessageToDelete(messageId);
    setShowSingleDeleteDialog(true);
  };

  const deleteSingleMessageForMe = async () => {
    if (!messageToDelete) return;

    try {
      const { error } = await supabase
        .from('community_message_deletions')
        .insert([{
          message_id: messageToDelete,
          user_id: user?.id
        }]);

      if (error) throw error;

      setMessages(prev => prev.filter(msg => msg.id !== messageToDelete));
      setShowSingleDeleteDialog(false);
      setMessageToDelete(null);

      showToast({
        title: "Messaggio eliminato",
        description: "Il messaggio è stato eliminato solo per te",
        type: 'delete'
      });
    } catch (error) {
      console.error('Error deleting message for me:', error);
      showToast({
        title: "Errore",
        description: "Impossibile eliminare il messaggio",
        type: 'error'
      });
    }
  };

  const deleteSingleMessageForAll = async () => {
    if (!messageToDelete) return;

    try {
      const { error } = await supabase
        .from('community_messages')
        .update({ 
          deleted_by_all: true
        })
        .eq('id', messageToDelete)
        .eq('user_id', user?.id);

      if (error) throw error;

      setMessages(prev => prev.filter(msg => msg.id !== messageToDelete));
      setShowSingleDeleteDialog(false);
      setMessageToDelete(null);

      showToast({
        title: "Messaggio eliminato",
        description: "Il messaggio è stato eliminato per tutti",
        type: 'delete'
      });
    } catch (error) {
      console.error('Error deleting message for all:', error);
      showToast({
        title: "Errore",
        description: "Impossibile eliminare il messaggio",
        type: 'error'
      });
    }
  };

  const deleteMessage = async (messageId: string, deleteForAll: boolean = false) => {
    const message = messages.find(msg => msg.id === messageId);
    if (!message) return;

    const isMyMessage = message.user_id === user?.id;

    try {
      if (deleteForAll && isMyMessage) {
        // Solo i miei messaggi possono essere eliminati per tutti
        const { error } = await supabase
          .from('community_messages')
          .update({ 
            deleted_by_all: true
          })
          .eq('id', messageId)
          .eq('user_id', user?.id);

        if (error) throw error;
      } else {
        // Elimina solo per me - aggiungi alla tabella delle eliminazioni
        const { error } = await supabase
          .from('community_message_deletions')
          .insert([{
            message_id: messageId,
            user_id: user?.id
          }]);

        if (error) throw error;
      }

      setMessages(prev => prev.filter(msg => msg.id !== messageId));

      showToast({
        title: "Messaggio eliminato",
        description: deleteForAll && isMyMessage ? "Il messaggio è stato eliminato per tutti" : "Il messaggio è stato eliminato solo per te",
        type: 'delete'
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      showToast({
        title: "Errore",
        description: "Impossibile eliminare il messaggio",
        type: 'error'
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

      showToast({
        title: "Messaggio modificato",
        description: "Il messaggio è stato modificato con successo",
        type: 'success'
      });
    } catch (error) {
      console.error('Error editing message:', error);
      showToast({
        title: "Errore",
        description: "Impossibile modificare il messaggio",
        type: 'error'
      });
    }
  };

  const handleReply = (message: Message) => {
    setReplyToMessage(message);
  };

  const cancelReply = () => {
    setReplyToMessage(null);
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

  const deleteSelectedMessagesForMe = async () => {
    if (selectedMessages.length === 0) return;

    try {
      // Crea record di eliminazione per ogni messaggio selezionato
      const deletionRecords = selectedMessages.map(messageId => ({
        message_id: messageId,
        user_id: user?.id
      }));

      const { error } = await supabase
        .from('community_message_deletions')
        .insert(deletionRecords);

      if (error) throw error;

      setMessages(prev => prev.filter(msg => !selectedMessages.includes(msg.id)));
      setSelectedMessages([]);
      setIsSelectionMode(false);
      setShowBulkDeleteDialog(false);

      showToast({
        title: "Messaggi eliminati",
        description: `${selectedMessages.length} messaggi eliminati solo per te`,
        type: 'delete'
      });
    } catch (error) {
      console.error('Error deleting messages for me:', error);
      showToast({
        title: "Errore",
        description: "Impossibile eliminare i messaggi selezionati",
        type: 'error'
      });
    }
  };

  const deleteSelectedMessagesForAll = async () => {
    if (selectedMessages.length === 0) return;

    try {
      // Separa messaggi inviati da quelli ricevuti
      const selectedMessageObjects = messages.filter(msg => selectedMessages.includes(msg.id));
      const sentMessages = selectedMessageObjects.filter(msg => msg.user_id === user?.id);
      const receivedMessages = selectedMessageObjects.filter(msg => msg.user_id !== user?.id);

      // Elimina messaggi inviati per tutti
      if (sentMessages.length > 0) {
        const { error: sentError } = await supabase
          .from('community_messages')
          .update({ 
            deleted_by_all: true
          })
          .in('id', sentMessages.map(msg => msg.id));

        if (sentError) throw sentError;
      }

      // Messaggi ricevuti possono essere eliminati solo per me
      if (receivedMessages.length > 0) {
        const deletionRecords = receivedMessages.map(msg => ({
          message_id: msg.id,
          user_id: user?.id
        }));

        const { error: receivedError } = await supabase
          .from('community_message_deletions')
          .insert(deletionRecords);

        if (receivedError) throw receivedError;
      }

      setMessages(prev => prev.filter(msg => !selectedMessages.includes(msg.id)));
      setSelectedMessages([]);
      setIsSelectionMode(false);
      setShowBulkDeleteDialog(false);

      const sentCount = sentMessages.length;
      const receivedCount = receivedMessages.length;
      let description = "";
      
      if (sentCount > 0 && receivedCount > 0) {
        description = `${sentCount} messaggi eliminati per tutti, ${receivedCount} eliminati solo per te`;
      } else if (sentCount > 0) {
        description = `${sentCount} messaggi eliminati per tutti`;
      } else {
        description = `${receivedCount} messaggi eliminati solo per te`;
      }

      showToast({
        title: "Messaggi eliminati",
        description: description,
        type: 'delete'
      });
    } catch (error) {
      console.error('Error deleting messages for all:', error);
      showToast({
        title: "Errore",
        description: "Impossibile eliminare i messaggi selezionati",
        type: 'error'
      });
    }
  };

  // Helper per determinare il tipo di messaggi selezionati
  const getSelectedMessagesType = () => {
    const selectedMessageObjects = messages.filter(msg => selectedMessages.includes(msg.id));
    const sentCount = selectedMessageObjects.filter(msg => msg.user_id === user?.id).length;
    const receivedCount = selectedMessageObjects.filter(msg => msg.user_id !== user?.id).length;
    
    if (sentCount > 0 && receivedCount === 0) return 'sent'; // Solo messaggi inviati
    if (receivedCount > 0 && sentCount === 0) return 'received'; // Solo messaggi ricevuti
    return 'mixed'; // Misto
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
        
        <div className="flex-1 overflow-y-auto">
          <MessageList 
            messages={messages}
            currentUserId={user?.id || ''}
            userNames={userNames}
            onDeleteMessage={showDeleteDialog}
            onEditMessage={editMessage}
            onReply={handleReply}
            onScrollToMessage={scrollToMessage}
            onStartPrivateChat={startPrivateChat}
            isSelectionMode={isSelectionMode}
            selectedMessages={selectedMessages}
            onToggleSelection={toggleMessageSelection}
          />
          <div ref={messagesEndRef} className="h-1" />
        </div>
      </div>
      
      <MessageInput 
        onSendMessage={sendMessage} 
        replyToMessage={replyToMessage}
        onCancelReply={cancelReply}
        userNames={userNames}
      />

      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              {(() => {
                const messageType = getSelectedMessagesType();
                const selectedMessageObjects = messages.filter(msg => selectedMessages.includes(msg.id));
                const sentCount = selectedMessageObjects.filter(msg => msg.user_id === user?.id).length;
                const receivedCount = selectedMessageObjects.filter(msg => msg.user_id !== user?.id).length;
                
                if (messageType === 'sent') {
                  return `Come vuoi eliminare i ${sentCount} messaggi inviati selezionati?`;
                } else if (messageType === 'received') {
                  return `I ${receivedCount} messaggi ricevuti selezionati possono essere eliminati solo per te.`;
                } else {
                  return `Hai selezionato ${sentCount} messaggi inviati e ${receivedCount} messaggi ricevuti. I messaggi inviati possono essere eliminati per tutti, quelli ricevuti solo per te.`;
                }
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <Button
              variant="outline"
              onClick={deleteSelectedMessagesForMe}
              className="w-full sm:w-auto"
            >
              Elimina solo per me
            </Button>
            {getSelectedMessagesType() !== 'received' && (
              <AlertDialogAction
                onClick={deleteSelectedMessagesForAll}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
              >
                {getSelectedMessagesType() === 'sent' ? 'Elimina per tutti' : 'Elimina (misto)'}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Single Message Delete Dialog */}
      <AlertDialog open={showSingleDeleteDialog} onOpenChange={setShowSingleDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              {(() => {
                const message = messages.find(msg => msg.id === messageToDelete);
                const isMyMessage = message?.user_id === user?.id;
                
                if (isMyMessage) {
                  return "Come vuoi eliminare questo messaggio?";
                } else {
                  return "Questo messaggio può essere eliminato solo per te.";
                }
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <Button
              variant="outline"
              onClick={deleteSingleMessageForMe}
              className="w-full sm:w-auto"
            >
              Elimina solo per me
            </Button>
            {(() => {
              const message = messages.find(msg => msg.id === messageToDelete);
              const isMyMessage = message?.user_id === user?.id;
              
              if (isMyMessage) {
                return (
                  <AlertDialogAction
                    onClick={deleteSingleMessageForAll}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
                  >
                    Elimina per tutti
                  </AlertDialogAction>
                );
              }
              return null;
            })()}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};