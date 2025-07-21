import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { MessageCircle, Edit, Trash2, Reply, CheckSquare, Square, MoreVertical, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEdit();
    }
    if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  const handleReply = (message: PrivateMessage) => {
    onReply(message);
  };

  const handleQuoteClick = (replyToMessage: PrivateMessage) => {
    onScrollToMessage(replyToMessage.id);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const renderMessageContent = (message: PrivateMessage, isEditing: boolean) => {
    if (isEditing) {
      return (
        <div className="mt-2 space-y-2">
          <Input
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyPress={handleKeyPress}
            className="text-sm"
            autoFocus
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={saveEdit}>
              <Check className="h-3 w-3" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={cancelEdit}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-1">
        {message.content && (
          <p className="text-sm break-words">{message.content}</p>
        )}
        
        {message.updated_at !== message.created_at && (
          <div className="text-xs text-muted-foreground mt-1">
            (modificato)
          </div>
        )}
      </div>
    );
  };

  const handleSelectionClick = (messageId: string) => {
    if (isSelectionMode) {
      onToggleSelection(messageId);
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

        const userName = isOwn ? 'Tu' : otherUserName;

        return (
          <div 
            key={message.id}
            id={`private-message-${message.id}`}
            className="relative transition-all duration-200"
          >
            <div 
              className={`flex gap-3 p-3 rounded-lg transition-colors ${
                isOwn ? 'bg-primary/10 ml-12' : 'bg-muted/20 mr-12'
              } ${isSelectionMode ? 'cursor-pointer hover:bg-muted/30' : ''} ${
                isSelected ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleSelectionClick(message.id)}
            >
              <div className="flex-shrink-0">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {userName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-foreground">
                    {userName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(message.created_at), { 
                      addSuffix: true, 
                      locale: it 
                    })}
                  </span>
                </div>
                
                {/* Reply Quote */}
                {replyToMessage && (
                  <div 
                    className="mb-2 cursor-pointer hover:bg-muted/20 transition-colors"
                    onClick={() => handleQuoteClick(replyToMessage)}
                  >
                    <div className="flex items-center gap-2 p-2 bg-muted/30 rounded border-l-2 border-primary">
                      <Avatar className="h-4 w-4">
                        <AvatarFallback className="text-xs">
                          {(replyToMessage.sender_id === currentUserId ? 'Tu' : otherUserName).slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="text-xs font-medium text-muted-foreground">
                          {replyToMessage.sender_id === currentUserId ? 'Tu' : otherUserName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {truncateText(replyToMessage.content || '', 50)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {renderMessageContent(message, isEditing)}
              </div>
              
              {!isSelectionMode && (
                <div className="flex-shrink-0 flex items-center gap-1">
                  {/* Always show Reply button */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => handleReply(message)}
                  >
                    <Reply className="h-4 w-4" />
                  </Button>
                  
                  {/* Show Edit/Delete menu only for own messages */}
                  {isOwn && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => startEdit(message)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifica
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDeleteMessage(message.id)} className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Elimina
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};