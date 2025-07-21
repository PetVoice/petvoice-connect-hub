-- Aggiungere colonne mancanti per l'eliminazione delle chat private
ALTER TABLE private_chats 
ADD COLUMN deleted_by_participant_1 boolean DEFAULT false,
ADD COLUMN deleted_by_participant_2 boolean DEFAULT false,
ADD COLUMN deleted_at timestamp with time zone DEFAULT NULL;

-- Aggiungere deleted_at per i messaggi privati
ALTER TABLE private_messages 
ADD COLUMN deleted_at timestamp with time zone DEFAULT NULL;