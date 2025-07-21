import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { MoreVertical, Edit, Trash2, Check, X, Reply } from 'lucide-react';
import { Message } from './Chat';

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  userName: string;
  currentUserId: string;
  onDelete: () => void;
  onEdit: (newContent: string) => void;
  onReply: (message: Message) => void;
  onScrollToMessage: (messageId: string) => void;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: () => void;
  messages: Message[];
  userNames: Record<string, string>;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isOwn,
  userName,
  currentUserId,
  onDelete,
  onEdit,
  onReply,
  onScrollToMessage,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelection,
  messages,
  userNames
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content || '');
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const replyToMessage = message.reply_to_id ? 
    messages.find(m => m.id === message.reply_to_id) : null;

  const handleEdit = () => {
    if (editContent.trim()) {
      onEdit(editContent.trim());
      setIsEditing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEdit();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditContent(message.content || '');
    }
  };

  const handleReply = () => {
    onReply(message);
  };

  const handleQuoteClick = () => {
    if (replyToMessage) {
      onScrollToMessage(replyToMessage.id);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Touch handlers for swipe-to-reply
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isSelectionMode) return;
    setStartX(e.touches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping || isSelectionMode) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - startX;
    
    // Only allow swipe right (positive delta)
    if (deltaX > 0) {
      setCurrentX(Math.min(deltaX, 80));
    }
  };

  const handleTouchEnd = () => {
    if (!isSwiping || isSelectionMode) return;
    
    if (currentX > 50) {
      handleReply();
    }
    
    setIsSwiping(false);
    setCurrentX(0);
  };

  const renderMessageContent = () => {
    if (message.message_type === 'image') {
      return (
        <div className="mt-2">
          <img 
            src={message.file_url} 
            alt="Shared image" 
            className="max-w-xs rounded-lg cursor-pointer hover:opacity-80"
            onClick={() => window.open(message.file_url, '_blank')}
          />
        </div>
      );
    }

    if (message.message_type === 'voice') {
      return (
        <div className="mt-2">
          <audio controls className="max-w-xs">
            <source src={message.file_url} type="audio/webm" />
            <source src={message.file_url} type="audio/mp4" />
            Il tuo browser non supporta l'elemento audio.
          </audio>
          {message.voice_duration && (
            <div className="text-xs text-muted-foreground mt-1">
              Durata: {message.voice_duration}s
            </div>
          )}
        </div>
      );
    }

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
            <Button size="sm" onClick={handleEdit}>
              <Check className="h-3 w-3" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => {
                setIsEditing(false);
                setEditContent(message.content || '');
              }}
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

  const handleSelectionClick = () => {
    if (isSelectionMode && onToggleSelection) {
      onToggleSelection();
    }
  };

  return (
    <div 
      id={`message-${message.id}`}
      className={`relative transition-all duration-200 ${
        isSwiping ? 'transform' : ''
      }`}
      style={{
        transform: isSwiping ? `translateX(${currentX}px)` : 'none'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Swipe indicator */}
      {isSwiping && currentX > 20 && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10">
          <div className={`p-2 rounded-full ${currentX > 50 ? 'bg-primary' : 'bg-muted'} transition-colors`}>
            <Reply className="h-4 w-4 text-white" />
          </div>
        </div>
      )}

      <div 
        className={`flex gap-3 p-3 rounded-lg transition-colors ${
          isOwn ? 'bg-primary/10 ml-12' : 'bg-muted/20 mr-12'
        } ${isSelectionMode ? 'cursor-pointer hover:bg-muted/30' : ''} ${
          isSelected ? 'ring-2 ring-primary' : ''
        }`}
        onClick={handleSelectionClick}
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
              onClick={handleQuoteClick}
            >
              <div className="flex items-center gap-2 p-2 bg-muted/30 rounded border-l-2 border-primary">
                <Avatar className="h-4 w-4">
                  <AvatarFallback className="text-xs">
                    {(userNames[replyToMessage.user_id] || 'U').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="text-xs font-medium text-muted-foreground">
                    {userNames[replyToMessage.user_id] || 'Utente'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {replyToMessage.message_type === 'image' ? (
                      <span className="italic">📷 Immagine</span>
                    ) : replyToMessage.message_type === 'voice' ? (
                      <span className="italic">🎤 Messaggio vocale</span>
                    ) : (
                      truncateText(replyToMessage.content || '', 50)
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {renderMessageContent()}
        </div>
        
        {!isSelectionMode && (
          <div className="flex-shrink-0 flex items-center gap-1">
            {/* Always show Reply button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={handleReply}
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
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Modifica
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDelete} className="text-destructive">
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
};