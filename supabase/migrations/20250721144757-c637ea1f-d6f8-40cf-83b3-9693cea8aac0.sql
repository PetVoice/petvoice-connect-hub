-- Rimuovere colonne non scalabili e creare tabella separata per eliminazioni utente
ALTER TABLE public.community_messages 
DROP COLUMN deleted_by_user,
DROP COLUMN user_deleted_at;

-- Creare tabella per tracciare eliminazioni per singolo utente
CREATE TABLE public.community_message_deletions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.community_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  deleted_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- Enable RLS  
ALTER TABLE public.community_message_deletions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can manage their own deletions"
ON public.community_message_deletions
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);