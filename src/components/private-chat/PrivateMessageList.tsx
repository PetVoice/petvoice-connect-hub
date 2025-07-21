import React from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { MessageCircle, Edit2, Trash2, Reply, CheckSquare, Square, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export interface PrivateMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string | null;
  message_type: string;
  file_url: string | null;
  voice_duration: number | null;
  reply_to_id: string | null;
  is_read: boolean;
  deleted_by_sender: boolean;
  deleted_by_recipient: boolean;
  metadata: any;
  created_at: string;
  updated_at: string;
  chat_id: string;
  sender_name?: string;
}

interface PrivateMessageListProps {
  messages: PrivateMessage[];
  currentUserId: string;
  otherUserName: string;
  onDeleteMessage: (messageId: string) => void;
  onEditMessage: (messageId: string, newContent: string) => void;
  onReply: (message: PrivateMessage) => void;
  onScrollToMessage: (messageId: string) => void;
  isSelectionMode: boolean;
  selectedMessages: string[];
  onToggleSelection: (messageId: string) => void;
}

export const PrivateMessageList: React.FC<PrivateMessageListProps> = ({
  messages,
  currentUserId,
  otherUserName,
  onDeleteMessage,
  onEditMessage,
  onReply,
  onScrollToMessage,
  isSelectionMode,
  selectedMessages,
  onToggleSelection
}) => {
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const startEdit = (message: PrivateMessage) => {
    setEditingMessage(message.id);
    setEditContent(message.content || '');
  };

  const saveEdit = () => {
    if (editingMessage && editContent.trim()) {
      onEditMessage(editingMessage, editContent);
      setEditingMessage(null);
      setEditContent('');
    }
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setEditContent('');
  };

  const scrollToMessage = (messageId: string) => {
    const messageElement = document.getElementById(`private-message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      messageElement.classList.add('bg-yellow-200', 'dark:bg-yellow-900');
      setTimeout(() => {
        messageElement.classList.remove('bg-yellow-200', 'dark:bg-yellow-900');
      }, 2000);
    }
  };

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-center">
        <div>
          <MessageCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Nessun messaggio</p>
          <p className="text-sm text-muted-foreground mt-1">
            Inizia la conversazione!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const isOwn = message.sender_id === currentUserId;
        const isEditing = editingMessage === message.id;
        const isSelected = selectedMessages.includes(message.id);
        const replyToMessage = message.reply_to_id ? 
          messages.find(m => m.id === message.reply_to_id) : null;

        return (
          <div
            key={message.id}
            id={`private-message-${message.id}`}
            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[70%] rounded-lg px-3 py-2 relative group ${
              isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'
            } ${isSelected ? 'ring-2 ring-primary' : ''}`}>
              
              {/* Selection checkbox */}
              {isSelectionMode && isOwn && (
                <div className="absolute -top-2 -left-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 w-6 p-0 bg-background border-2"
                    onClick={() => onToggleSelection(message.id)}
                  >
                    {isSelected ? (
                      <CheckSquare className="h-3 w-3" />
                    ) : (
                      <Square className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              )}

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
                      {replyToMessage.sender_id === currentUserId ? 'Tu' : otherUserName}
                    </div>
                    <div className={`text-xs ${
                      isOwn ? 'text-primary-foreground/80' : 'text-foreground/80'
                    }`}>
                      {replyToMessage.content?.substring(0, 100)}
                      {replyToMessage.content && replyToMessage.content.length > 100 && '...'}
                    </div>
                  </div>
                </div>
              )}

              {/* Message content */}
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        saveEdit();
                      } else if (e.key === 'Escape') {
                        cancelEdit();
                      }
                    }}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={saveEdit}>
                      Salva
                    </Button>
                    <Button size="sm" variant="ghost" onClick={cancelEdit}>
                      Annulla
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="break-words">{message.content}</div>
                  
                  {/* Message actions */}
                  {!isSelectionMode && (
                    <div className={`flex items-center justify-between mt-2 text-xs ${
                      isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      <div>
                        {format(new Date(message.created_at), 'HH:mm', { locale: it })}
                        {message.updated_at !== message.created_at && (
                          <span className="ml-1">(modificato)</span>
                        )}
                      </div>
                      
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Reply button always visible */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => onReply(message)}
                        >
                          <Reply className="h-3 w-3" />
                        </Button>
                        
                        {/* Edit/Delete dropdown for own messages */}
                        {isOwn && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                              >
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => startEdit(message)}>
                                <Edit2 className="h-3 w-3 mr-2" />
                                Modifica
                              </DropdownMenuItem>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onSelect={(e) => e.preventDefault()}
                                  >
                                    <Trash2 className="h-3 w-3 mr-2" />
                                    Elimina
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Elimina messaggio</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Sei sicuro di voler eliminare questo messaggio? Questa azione non può essere annullata.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annulla</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => onDeleteMessage(message.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Elimina
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};