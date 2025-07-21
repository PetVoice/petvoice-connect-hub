-- Aggiungere colonne per supportare l'eliminazione delle chat private
ALTER TABLE private_chats 
ADD COLUMN deleted_by_participant_1 boolean DEFAULT false,
ADD COLUMN deleted_by_participant_2 boolean DEFAULT false,
ADD COLUMN deleted_at timestamp with time zone DEFAULT NULL;

-- Aggiungere colonne per supportare l'eliminazione dei messaggi privati (soft delete)
ALTER TABLE private_messages 
ADD COLUMN deleted_by_sender boolean DEFAULT false,
ADD COLUMN deleted_by_recipient boolean DEFAULT false,
ADD COLUMN deleted_at timestamp with time zone DEFAULT NULL;