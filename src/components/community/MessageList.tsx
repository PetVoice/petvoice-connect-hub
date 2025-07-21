import React from 'react';
import { MessageItem } from './MessageItem';
import { Message } from './Chat';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  userNames: Record<string, string>;
  onDeleteMessage: (messageId: string) => void;
  onEditMessage: (messageId: string, newContent: string) => void;
  onReply: (message: Message) => void;
  onScrollToMessage: (messageId: string) => void;
  onStartPrivateChat: (targetUserId: string, targetUserName: string) => void;
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
  onScrollToMessage,
  onStartPrivateChat,
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
            userName={userNames[message.user_id]?.split(' ')[0] || 'Utente sconosciuto'}
            currentUserId={currentUserId}
            onDelete={() => onDeleteMessage(message.id)}
            onEdit={(newContent) => onEditMessage(message.id, newContent)}
            onReply={onReply}
            onScrollToMessage={onScrollToMessage}
            onStartPrivateChat={(targetUserId, targetUserName) => onStartPrivateChat(targetUserId, targetUserName)}
            isSelectionMode={isSelectionMode}
            isSelected={selectedMessages.includes(message.id)}
            onToggleSelection={() => onToggleSelection?.(message.id)}
            messages={messages}
            userNames={userNames}
          />
        ))
      )}
    </div>
  );
};