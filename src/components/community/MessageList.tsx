import React from 'react';
import { MessageItem } from './MessageItem';
import { Message } from './Chat';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  userNames: Record<string, string>;
  onDeleteMessage: (messageId: string) => void;
  onEditMessage: (messageId: string, newContent: string) => void;
  onReply: (messageId: string, userName: string) => void;
  onContactUser: (userId: string, userName: string) => void;
  isSelectionMode?: boolean;
  selectedMessages?: string[];
  onToggleSelection?: (messageId: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  userNames,
  onDeleteMessage,
  onEditMessage,
  onReply,
  onContactUser,
  isSelectionMode = false,
  selectedMessages = [],
  onToggleSelection
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          Nessun messaggio ancora. Inizia la conversazione!
        </div>
      ) : (
        messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            isOwn={message.user_id === currentUserId}
            userName={userNames[message.user_id] || 'Utente sconosciuto'}
            onDelete={() => onDeleteMessage(message.id)}
            onEdit={(newContent) => onEditMessage(message.id, newContent)}
            onReply={onReply}
            onContactUser={onContactUser}
            isSelectionMode={isSelectionMode}
            isSelected={selectedMessages.includes(message.id)}
            onToggleSelection={() => onToggleSelection?.(message.id)}
          />
        ))
      )}
    </div>
  );
};