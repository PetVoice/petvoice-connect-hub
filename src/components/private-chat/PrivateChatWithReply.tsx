import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MessageCircle, User, Clock, ArrowLeft, Send, X, Reply, CheckSquare, Square, Trash2, MoreVertical } from 'lucide-react';
import { useTranslatedToast } from '@/hooks/use-translated-toast';
import { useToastWithIcon } from '@/hooks/use-toast-with-icons';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { PrivateMessageList, PrivateMessage } from './PrivateMessageList';

interface PrivateChat {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  initiated_by: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  is_active: boolean;
  hiddenForUser?: boolean; // Campo locale per nascondere le chat eliminate dall'utente
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

interface PrivateChatWithReplyProps {
  chatId?: string | null;
}

export const PrivateChatWithReply: React.FC<PrivateChatWithReplyProps> = ({ chatId }) => {
  console.log('🏗️ PrivateChatWithReply component loading...');
  const { user } = useAuth();
  const { showToast } = useTranslatedToast();
  const { showToast: showIconToast } = useToastWithIcon();
  const [chats, setChats] = useState<PrivateChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<PrivateChat | null>(null);
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<PrivateMessage | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [showSingleDeleteDialog, setShowSingleDeleteDialog] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [showChatDeleteDialog, setShowChatDeleteDialog] = useState(false);
  
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.id) {
      loadChats();
      setupRealtimeSubscription();
    }
  }, [user?.id]);

  // Auto-select chat based on chatId prop
  useEffect(() => {
    if (chatId && chats.length > 0) {
      const targetChat = chats.find(chat => chat.id === chatId);
      if (targetChat) {
        console.log('🎯 Auto-selecting chat from URL:', chatId);
        setSelectedChat(targetChat);
      }
    }
  }, [chatId, chats]);

  useEffect(() => {
    if (selectedChat) {
      console.log('📱 Loading messages for chat:', selectedChat.id);
      loadMessages(selectedChat.id);
      markChatAsRead(selectedChat.id);
    }
  }, [selectedChat]);

  useEffect(() => {
    console.log('📜 Messages updated, count:', messages.length, 'hasUnreadMessages:', hasUnreadMessages);
    
    if (hasUnreadMessages && messages.length > 0) {
      scrollToFirstUnreadMessage();
    } else if (messages.length > 0 && !hasUnreadMessages) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [messages.length]);

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
    const messagesChannel = supabase
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
          
          // Se il messaggio è per la chat corrente selezionata
          if (selectedChat && newMessage.chat_id === selectedChat.id) {
            console.log('✅ Message is for current chat, processing...');
            
            const messageWithName = {
              ...newMessage,
              sender_name: newMessage.sender_id === user?.id ? 'Tu' : selectedChat.other_user.display_name
            };
            
            setMessages(prev => {
              if (prev.some(msg => msg.id === newMessage.id)) {
                console.log('⚠️ Duplicate message detected, skipping');
                return prev;
              }
              console.log('➕ Adding realtime message to UI');
              return [...prev, messageWithName];
            });
            
            if (newMessage.sender_id !== user?.id) {
              console.log('📬 Received message from other user, scrolling to bottom');
              setTimeout(() => scrollToBottom(), 50);
            }
          } 
          // Se non c'è chat selezionata ma il messaggio è per l'utente corrente (potrebbero aver eliminato la chat)
          else if (!selectedChat && newMessage.recipient_id === user?.id) {
            console.log('📱 Message received for user with no chat selected - checking if chat was reactivated');
            
            // Controlla se questo messaggio ha riattivato una chat
            setTimeout(async () => {
              try {
                const { data: reactivatedChat } = await supabase
                  .from('private_chats')
                  .select('*')
                  .eq('id', newMessage.chat_id)
                  .eq('deleted_by_participant_1', false)
                  .eq('deleted_by_participant_2', false)
                  .single();
                
                if (reactivatedChat) {
                  console.log('🔄 Found reactivated chat, auto-selecting and loading messages');
                  
                  // Ottieni il profilo dell'altro utente
                  const otherUserId = reactivatedChat.participant_1_id === user.id 
                    ? reactivatedChat.participant_2_id 
                    : reactivatedChat.participant_1_id;
                  
                  const { data: otherUserProfile } = await supabase
                    .from('profiles')
                    .select('display_name, avatar_url')
                    .eq('user_id', otherUserId)
                    .single();
                  
                  const chatToSelect = {
                    ...reactivatedChat,
                    other_user: {
                      id: otherUserId,
                      display_name: otherUserProfile?.display_name?.split(' ')[0] || 'Utente Sconosciuto',
                      avatar_url: otherUserProfile?.avatar_url
                    },
                    unread_count: 1
                  };
                  
                  // Ricarica le chat per aggiornare la lista
                  await loadChats();
                  
                  // Seleziona automaticamente la chat riattivata
                  setSelectedChat(chatToSelect);
                }
              } catch (error) {
                console.error('Error checking for reactivated chat:', error);
              }
            }, 100);
          } else {
            console.log('ℹ️ Message not for current chat or user');
          }
          
          console.log('🔄 Updating chat list from realtime...');
          updateLastMessageInChatList(newMessage);
        }
      )
      .subscribe();

    // Subscription per aggiornamenti alle chat (riattivazioni, ecc.)
    const chatsChannel = supabase
      .channel('private-chats-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'private_chats'
        },
        (payload) => {
          const updatedChat = payload.new as any;
          // Verifica se l'utente corrente partecipa a questa chat
          if (updatedChat.participant_1_id === user?.id || updatedChat.participant_2_id === user?.id) {
            console.log('🔄 Chat updated via realtime, reloading chats...');
            
            // Se la chat è stata riattivata (entrambi i deleted_by sono false) e l'utente non ha una chat selezionata,
            // seleziona automaticamente questa chat riattivata
            const wasReactivated = !updatedChat.deleted_by_participant_1 && !updatedChat.deleted_by_participant_2;
            const currentChatId = selectedChat?.id;
            
            loadChats().then(() => {
              // Se la chat è stata riattivata e non c'è una chat selezionata, selezionala automaticamente
              if (wasReactivated && !currentChatId) {
                console.log('🎯 Auto-selecting reactivated chat:', updatedChat.id);
                // Aspetta che loadChats finisca completamente, poi cerca la chat nella lista aggiornata
                setTimeout(() => {
                  setChats(prevChats => {
                    const reactivatedChat = prevChats.find(chat => chat.id === updatedChat.id);
                    if (reactivatedChat) {
                      console.log('✅ Found reactivated chat in list, selecting it');
                      setSelectedChat(reactivatedChat);
                    } else {
                      console.log('❌ Reactivated chat not found in updated list');
                    }
                    return prevChats;
                  });
                }, 500); // Aspetta mezzo secondo per essere sicuri che loadChats sia finito
              }
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(chatsChannel);
    };
  };

  const updateLastMessageInChatList = (newMessage: PrivateMessage) => {
    setChats(prevChats => 
      prevChats.map(chat => {
        if (chat.id === newMessage.chat_id) {
          return {
            ...chat,
            hiddenForUser: false, // Riattiva la chat se era nascosta
            last_message: {
              content: newMessage.content || '',
              sender_id: newMessage.sender_id,
              created_at: newMessage.created_at
            },
            last_message_at: newMessage.created_at,
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
      
      const isParticipant1 = (chat: any) => chat.participant_1_id === user.id;
      
      const { data: chatsData, error: chatsError } = await supabase
        .from('private_chats')
        .select('*')
        .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
        .eq('is_active', true)
        .order('last_message_at', { ascending: false });

      // Filter out deleted chats for the current user
      const filteredChats = (chatsData || []).filter(chat => {
        const isParticipant1 = chat.participant_1_id === user.id;
        return isParticipant1 
          ? !chat.deleted_by_participant_1 
          : !chat.deleted_by_participant_2;
      });

      if (chatsError) {
        console.error('Error loading chats:', chatsError);
        return;
      }

      const chatsWithDetails = await Promise.all(
        filteredChats.map(async (chat) => {
          const otherUserId = chat.participant_1_id === user.id 
            ? chat.participant_2_id 
            : chat.participant_1_id;

          const { data: userProfile } = await supabase
            .from('profiles')
            .select('user_id, display_name, avatar_url')
            .eq('user_id', otherUserId)
            .maybeSingle();

          const { data: lastMessage } = await supabase
            .from('private_messages')
            .select('content, sender_id, created_at')
            .eq('chat_id', chat.id)
            .not('deleted_by_sender', 'eq', true)
            .not('deleted_by_recipient', 'eq', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          const { count: unreadCount } = await supabase
            .from('private_messages')
            .select('*', { count: 'exact' })
            .eq('chat_id', chat.id)
            .eq('recipient_id', user.id)
            .eq('is_read', false)
            .not('deleted_by_recipient', 'eq', true);

          const displayName = userProfile?.display_name?.split(' ')[0] || 'Utente Sconosciuto';

          return {
            ...chat,
            other_user: {
              id: otherUserId,
              display_name: displayName,
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
          variant: 'destructive'
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

      // Filtra i messaggi eliminati dall'utente corrente
      const filteredMessages = (messagesData || []).filter(message => {
        // Se l'utente è il sender, controlla se ha eliminato il messaggio
        if (message.sender_id === user.id) {
          return !message.deleted_by_sender;
        }
        // Se l'utente è il recipient, controlla se ha eliminato il messaggio
        else {
          return !message.deleted_by_recipient;
        }
      });

      const messagesWithNames = await Promise.all(
        filteredMessages.map(async (message) => {
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('user_id', message.sender_id)
            .maybeSingle();

          const senderName = senderProfile?.display_name?.split(' ')[0] || 'Utente Sconosciuto';

          return {
            ...message,
            sender_name: senderName
          };
        })
      );

      setMessages(messagesWithNames);
      
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

  // Chat deletion functions
  const deleteChatForMe = async () => {
    if (!selectedChat) return;

    try {
      const isParticipant1 = selectedChat.participant_1_id === user.id;
      const updateData = isParticipant1 
        ? { deleted_by_participant_1: true }
        : { deleted_by_participant_2: true };

      const { error } = await supabase
        .from('private_chats')
        .update(updateData)
        .eq('id', selectedChat.id);

      if (error) throw error;

      // Remove chat from local state
      setChats(prev => prev.filter(chat => chat.id !== selectedChat.id));
      setSelectedChat(null);
      setShowChatDeleteDialog(false);

      showToast({
        title: "Chat eliminata",
        description: "La chat è stata eliminata solo per te",
        variant: 'default'
      });
    } catch (error) {
      console.error('Error deleting chat for me:', error);
      showToast({
        title: "Errore",
        description: "Impossibile eliminare la chat",
        variant: 'destructive'
      });
    }
  };

  const deleteChatForBoth = async () => {
    if (!selectedChat) return;

    try {
      const { error } = await supabase
        .from('private_chats')
        .update({ 
          deleted_by_participant_1: true,
          deleted_by_participant_2: true,
          deleted_at: new Date().toISOString()
        })
        .eq('id', selectedChat.id);

      if (error) throw error;

      // Remove chat from local state
      setChats(prev => prev.filter(chat => chat.id !== selectedChat.id));
      setSelectedChat(null);
      setShowChatDeleteDialog(false);

      showToast({
        title: "Chat eliminata",
        description: "La chat è stata eliminata per entrambi",
        variant: 'default'
      });
    } catch (error) {
      console.error('Error deleting chat for both:', error);
      showToast({
        title: "Errore",
        description: "Impossibile eliminare la chat",
        variant: 'destructive'
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || sendingMessage) return;

    console.log('🚀 Starting to send message:', newMessage.trim());
    console.log('📋 User ID:', user?.id);
    console.log('📋 Selected chat ID:', selectedChat?.id);
    console.log('📋 Selected chat participants:', selectedChat?.participant_1_id, selectedChat?.participant_2_id);
    
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
        showToast({
          title: "Errore",
          description: "Impossibile inviare il messaggio",
          variant: 'destructive'
        });
        return;
      }

      console.log('✅ Message inserted successfully:', data);
      
      setNewMessage('');
      setReplyToMessage(null);
      
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
        
        // Scroll sempre al messaggio appena inviato
        setTimeout(() => {
          console.log('⬇️ Scrolling to bottom after sending message');
          scrollToBottom();
        }, 100); // Timeout più lungo per assicurarsi che il DOM sia aggiornato
      }
      
      console.log('🔄 NOT reloading chats to avoid component re-render');

    } catch (error) {
      console.error('💥 Unexpected error sending message:', error);
      showToast({
        title: "Errore",
        description: "Impossibile inviare il messaggio",
        variant: 'destructive'
      });
    } finally {
      setSendingMessage(false);
      console.log('🏁 Send message completed');
    }
  };

  const handleReply = (message: PrivateMessage) => {
    console.log('💬 Reply button clicked, setting reply message and focusing input');
    setReplyToMessage(message);
    
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        console.log('🎯 Input focused for reply');
      }
    }, 100);
  };

  const cancelReply = () => {
    setReplyToMessage(null);
  };

  const deleteMessage = (messageId: string) => {
    setMessageToDelete(messageId);
    setShowSingleDeleteDialog(true);
  };

  const deleteSingleMessageForMe = async () => {
    if (!messageToDelete) return;

    try {
      const { error } = await supabase
        .from('private_messages')
        .update({ 
          deleted_by_sender: true,
          deleted_at: new Date().toISOString()
        })
        .eq('id', messageToDelete)
        .eq('sender_id', user.id);

      if (error) throw error;

      setMessages(prev => prev.filter(msg => msg.id !== messageToDelete));
      setShowSingleDeleteDialog(false);
      setMessageToDelete(null);

      showToast({
        title: "Messaggio eliminato",
        description: "Il messaggio è stato eliminato solo per te",
        variant: 'default'
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      showToast({
        title: "Errore",
        description: "Impossibile eliminare il messaggio",
        variant: 'destructive'
      });
    }
  };

  const deleteSingleMessageForBoth = async () => {
    if (!messageToDelete) return;

    try {
      const { error } = await supabase
        .from('private_messages')
        .update({ 
          deleted_by_sender: true,
          deleted_by_recipient: true,
          deleted_at: new Date().toISOString()
        })
        .eq('id', messageToDelete)
        .eq('sender_id', user.id);

      if (error) throw error;

      setMessages(prev => prev.filter(msg => msg.id !== messageToDelete));
      setShowSingleDeleteDialog(false);
      setMessageToDelete(null);

      showToast({
        title: "Messaggio eliminato",
        description: "Il messaggio è stato eliminato per entrambi",
        variant: 'default'
      });
    } catch (error) {
      console.error('Error deleting single message for both:', error);
      showToast({
        title: "Errore",
        description: "Impossibile eliminare il messaggio",
        variant: 'destructive'
      });
    }
  };

  const editMessage = async (messageId: string, newContent: string) => {
    if (!newContent.trim()) return;

    try {
      const { error } = await supabase
        .from('private_messages')
        .update({ 
          content: newContent.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) throw error;

      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: newContent.trim(), updated_at: new Date().toISOString() }
            : msg
        )
      );

      showToast({
        title: "Messaggio modificato",
        description: "Il messaggio è stato modificato con successo",
        variant: 'default'
      });
    } catch (error) {
      console.error('Error editing message:', error);
      showToast({
        title: "Errore",
        description: "Impossibile modificare il messaggio",
        variant: 'destructive'
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
    const userMessages = messages.filter(msg => msg.sender_id === user.id);
    const allUserMessageIds = userMessages.map(msg => msg.id);
    setSelectedMessages(allUserMessageIds);
  };

  const deselectAllMessages = () => {
    setSelectedMessages([]);
  };

  const deleteSelectedMessages = async () => {
    if (selectedMessages.length === 0) return;

    try {
      // Separa messaggi inviati da quelli ricevuti
      const selectedMessageObjects = messages.filter(msg => selectedMessages.includes(msg.id));
      const sentMessages = selectedMessageObjects.filter(msg => msg.sender_id === user.id);
      const receivedMessages = selectedMessageObjects.filter(msg => msg.sender_id !== user.id);

      // Elimina messaggi inviati per il sender
      if (sentMessages.length > 0) {
        const { error: sentError } = await supabase
          .from('private_messages')
          .update({ 
            deleted_by_sender: true,
            deleted_at: new Date().toISOString()
          })
          .in('id', sentMessages.map(msg => msg.id));

        if (sentError) throw sentError;
      }

      // Elimina messaggi ricevuti per il recipient
      if (receivedMessages.length > 0) {
        const { error: receivedError } = await supabase
          .from('private_messages')
          .update({ 
            deleted_by_recipient: true,
            deleted_at: new Date().toISOString()
          })
          .in('id', receivedMessages.map(msg => msg.id));

        if (receivedError) throw receivedError;
      }

      setSelectedMessages([]);
      setIsSelectionMode(false);
      setShowBulkDeleteDialog(false);
      await loadMessages(selectedChat.id);

      showToast({
        title: "Messaggi eliminati",
        description: `${selectedMessages.length} messaggi eliminati solo per te`,
        variant: 'default'
      });
    } catch (error) {
      console.error('Error deleting messages:', error);
      showToast({
        title: "Errore",
        description: "Impossibile eliminare i messaggi selezionati",
        variant: 'destructive'
      });
    }
  };

  const deleteSelectedMessagesForBoth = async () => {
    if (selectedMessages.length === 0) return;

    try {
      // Solo messaggi inviati dall'utente possono essere eliminati per entrambi
      const selectedMessageObjects = messages.filter(msg => selectedMessages.includes(msg.id));
      const sentMessages = selectedMessageObjects.filter(msg => msg.sender_id === user.id);
      const receivedMessages = selectedMessageObjects.filter(msg => msg.sender_id !== user.id);

      // Elimina messaggi inviati per entrambi
      if (sentMessages.length > 0) {
        const { error: sentError } = await supabase
          .from('private_messages')
          .update({ 
            deleted_by_sender: true,
            deleted_by_recipient: true,
            deleted_at: new Date().toISOString()
          })
          .in('id', sentMessages.map(msg => msg.id));

        if (sentError) throw sentError;
      }

      // Messaggi ricevuti possono essere eliminati solo per l'utente corrente
      if (receivedMessages.length > 0) {
        const { error: receivedError } = await supabase
          .from('private_messages')
          .update({ 
            deleted_by_recipient: true,
            deleted_at: new Date().toISOString()
          })
          .in('id', receivedMessages.map(msg => msg.id));

        if (receivedError) throw receivedError;
      }

      setSelectedMessages([]);
      setIsSelectionMode(false);
      setShowBulkDeleteDialog(false);
      await loadMessages(selectedChat.id);

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
        variant: 'default'
      });
    } catch (error) {
      console.error('Error deleting messages for both:', error);
      showToast({
        title: "Errore",
        description: "Impossibile eliminare i messaggi selezionati",
        variant: 'destructive'
      });
    }
  };
  
  // Helper per determinare il tipo di messaggi selezionati
  const getSelectedMessagesType = () => {
    const selectedMessageObjects = messages.filter(msg => selectedMessages.includes(msg.id));
    const sentCount = selectedMessageObjects.filter(msg => msg.sender_id === user.id).length;
    const receivedCount = selectedMessageObjects.filter(msg => msg.sender_id !== user.id).length;
    
    if (sentCount > 0 && receivedCount === 0) return 'sent'; // Solo messaggi inviati
    if (receivedCount > 0 && sentCount === 0) return 'received'; // Solo messaggi ricevuti
    return 'mixed'; // Misto
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
                       className={`p-4 cursor-pointer transition-colors relative ${
                         selectedChat?.id === chat.id 
                           ? 'bg-primary/10 border-r-2 border-primary shadow-sm' 
                           : 'hover:bg-muted/50'
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
                              <h4 className={`font-medium text-sm truncate ${
                                selectedChat?.id === chat.id ? 'text-primary font-semibold' : ''
                              }`}>
                                {chat.other_user.display_name}
                              </h4>
                              <div className="flex items-center gap-2">
                                 {chat.unread_count > 0 && selectedChat?.id !== chat.id && (
                                   <Badge variant="secondary" className="text-xs">
                                     {chat.unread_count}
                                   </Badge>
                                 )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedChat(chat);
                                      setShowChatDeleteDialog(true);
                                    }}
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 p-1 h-8 w-8 opacity-90 hover:opacity-100 transition-opacity"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                              </div>
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
                {!isSelectionMode ? (
                  <div className="flex items-center justify-between">
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
                  <div className="flex items-center justify-between">
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
                        onClick={selectedMessages.length === messages.filter(msg => msg.sender_id === user.id).length ? deselectAllMessages : selectAllMessages}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {selectedMessages.length === messages.filter(msg => msg.sender_id === user.id).length ? (
                          <Square className="h-4 w-4 mr-2" />
                        ) : (
                          <CheckSquare className="h-4 w-4 mr-2" />
                        )}
                        {selectedMessages.length === messages.filter(msg => msg.sender_id === user.id).length ? 'Deseleziona' : 'Seleziona tutto'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowBulkDeleteDialog(true)}
                        disabled={selectedMessages.length === 0}
                      >
                        Elimina ({selectedMessages.length})
                      </Button>
                    </div>
                  </div>
                )}
              </CardHeader>
              <Separator />
              <CardContent className="p-0 flex flex-col h-[500px]">
                 {/* Messages */}
                 <ScrollArea className="flex-1 p-4">
                   <PrivateMessageList
                     messages={messages}
                     currentUserId={user.id}
                     otherUserName={selectedChat.other_user.display_name}
                     onDeleteMessage={deleteMessage}
                     onEditMessage={editMessage}
                     onReply={handleReply}
                     onScrollToMessage={scrollToMessage}
                     isSelectionMode={isSelectionMode}
                     selectedMessages={selectedMessages}
                     onToggleSelection={toggleMessageSelection}
                   />
                   <div ref={messagesEndRef} className="h-1" />
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
                      ref={inputRef}
                      placeholder={replyToMessage ? "Rispondi..." : "Scrivi un messaggio..."}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={sendingMessage}
                      className="flex-1"
                    />
                    <Button 
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

      {/* Bulk Delete Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Elimina Messaggi</AlertDialogTitle>
            <AlertDialogDescription>
              {(() => {
                const messageType = getSelectedMessagesType();
                const selectedMessageObjects = messages.filter(msg => selectedMessages.includes(msg.id));
                const sentCount = selectedMessageObjects.filter(msg => msg.sender_id === user.id).length;
                const receivedCount = selectedMessageObjects.filter(msg => msg.sender_id !== user.id).length;
                
                if (messageType === 'sent') {
                  return `Come vuoi eliminare i ${sentCount} messaggi inviati selezionati?`;
                } else if (messageType === 'received') {
                  return `I ${receivedCount} messaggi ricevuti selezionati possono essere eliminati solo per te.`;
                } else {
                  return `Hai selezionato ${sentCount} messaggi inviati e ${receivedCount} messaggi ricevuti. I messaggi inviati possono essere eliminati per entrambi, quelli ricevuti solo per te.`;
                }
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <Button
              variant="outline"
              onClick={deleteSelectedMessages}
              className="w-full sm:w-auto"
            >
              Elimina solo per me
            </Button>
            {getSelectedMessagesType() !== 'received' && (
              <AlertDialogAction
                onClick={deleteSelectedMessagesForBoth}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
              >
                {getSelectedMessagesType() === 'sent' ? 'Elimina per entrambi' : 'Elimina (misto)'}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Single Message Delete Dialog */}
      <AlertDialog open={showSingleDeleteDialog} onOpenChange={setShowSingleDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Elimina Messaggio</AlertDialogTitle>
            <AlertDialogDescription>
              {(() => {
                const messageToDeleteObj = messageToDelete ? messages.find(m => m.id === messageToDelete) : null;
                const isOwnMessage = messageToDeleteObj?.sender_id === user?.id;
                
                if (isOwnMessage) {
                  return "Come vuoi eliminare questo messaggio?";
                } else {
                  return "Questo messaggio verrà eliminato solo per te.";
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
              const messageToDeleteObj = messageToDelete ? messages.find(m => m.id === messageToDelete) : null;
              const isOwnMessage = messageToDeleteObj?.sender_id === user?.id;
              
              if (isOwnMessage) {
                return (
                  <AlertDialogAction
                    onClick={deleteSingleMessageForBoth}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
                  >
                    Elimina per entrambi
                  </AlertDialogAction>
                );
              }
              return null;
            })()}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Chat Delete Dialog */}
      <AlertDialog open={showChatDeleteDialog} onOpenChange={setShowChatDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Elimina Chat</AlertDialogTitle>
            <AlertDialogDescription>
              Come vuoi eliminare questa conversazione?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <Button
              variant="outline"
              onClick={deleteChatForMe}
              className="w-full sm:w-auto"
            >
              Elimina solo per me
            </Button>
            <AlertDialogAction
              onClick={deleteChatForBoth}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
            >
              Elimina per entrambi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};