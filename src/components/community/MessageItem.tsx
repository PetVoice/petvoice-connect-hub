import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreVertical, Edit, Trash2, Download, Play, Pause } from 'lucide-react';
import { Message } from './Chat';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  onDelete: () => void;
  onEdit: (newContent: string) => void;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: () => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isOwn,
  onDelete,
  onEdit,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelection
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content || '');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit(editContent);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content || '');
    setIsEditing(false);
  };

  const playVoiceMessage = () => {
    if (!message.file_url) return;
    
    if (isPlaying) {
      // Stop audio if playing
      const audioElements = document.querySelectorAll('audio');
      audioElements.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
      setIsPlaying(false);
    } else {
      // Play audio
      const audio = new Audio(message.file_url);
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);
      audio.play().catch(() => setIsPlaying(false));
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'} flex items-start gap-2`}>
        {/* Selection checkbox (only for own messages in selection mode) */}
        {isSelectionMode && isOwn && (
          <div className="mt-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onToggleSelection}
              className="h-4 w-4"
            />
          </div>
        )}
        
        <div
          className={`rounded-lg p-3 ${
            isOwn
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted'
          } ${isSelectionMode && isOwn ? 'flex-1' : ''}`}
        >
          {/* Message content */}
          {message.message_type === 'text' && (
            <div>
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleEdit();
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                    className="bg-background text-foreground"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleEdit}>
                      Salva
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                      Annulla
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="whitespace-pre-wrap break-words">
                  {message.content}
                  {message.updated_at !== message.created_at && (
                    <span className="text-xs opacity-70 ml-2">(modificato)</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Image message */}
          {message.message_type === 'image' && message.file_url && (
            <div className="space-y-2">
              <img
                src={message.file_url}
                alt="Messaggio immagine"
                className="max-w-full h-auto rounded-lg cursor-pointer"
                onClick={() => window.open(message.file_url!, '_blank')}
              />
              {message.content && (
                <div className="whitespace-pre-wrap break-words">
                  {message.content}
                </div>
              )}
            </div>
          )}

          {/* Voice message */}
          {message.message_type === 'voice' && message.file_url && (
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant={isOwn ? "secondary" : "default"}
                onClick={playVoiceMessage}
                className="h-8 w-8 p-0"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <div className="flex-1">
                <div className="text-sm">Messaggio vocale</div>
                {message.voice_duration && (
                  <div className="text-xs opacity-70">
                    {formatDuration(message.voice_duration)}
                  </div>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => window.open(message.file_url!, '_blank')}
                className="h-8 w-8 p-0"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Timestamp */}
          <div className={`text-xs mt-2 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
            {formatDistanceToNow(new Date(message.created_at), { 
              addSuffix: true, 
              locale: it 
            })}
          </div>
        </div>

        {/* Actions menu (only for own messages and not in selection mode) */}
        {isOwn && !isSelectionMode && (
          <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mt-1`}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isOwn ? "end" : "start"}>
                {message.message_type === 'text' && (
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Modifica
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Elimina
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questo messaggio? Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete();
                setShowDeleteDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};