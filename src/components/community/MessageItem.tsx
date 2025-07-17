
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { MoreVertical, Edit, Trash2, Check, X } from 'lucide-react';
import { Message } from './Chat';

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  userName: string;
  currentUserId: string;
  onDelete: () => void;
  onEdit: (newContent: string) => void;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: () => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isOwn,
  userName,
  currentUserId,
  onDelete,
  onEdit,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelection
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content || '');

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
        
        {renderMessageContent()}
      </div>
      
      {!isSelectionMode && (
        <div className="flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwn && (
                <>
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Modifica
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDelete} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Elimina
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
};
