-- Aggiungere colonne per eliminazione differenziata nei gruppi community
ALTER TABLE public.community_messages 
ADD COLUMN deleted_by_user boolean DEFAULT false,
ADD COLUMN deleted_by_all boolean DEFAULT false,
ADD COLUMN user_deleted_at timestamp with time zone DEFAULT NULL;