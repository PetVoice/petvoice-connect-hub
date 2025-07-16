-- Aggiungi campo channel_name alla tabella community_messages
ALTER TABLE public.community_messages 
ADD COLUMN channel_name TEXT;

-- Crea indice per performance
CREATE INDEX idx_community_messages_channel_name 
ON public.community_messages(channel_name);

-- Aggiorna politiche RLS per usare channel_name
CREATE POLICY "Users can view messages by channel name" 
ON public.community_messages 
FOR SELECT 
USING (
  channel_name IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.user_channel_subscriptions 
    WHERE user_id = auth.uid() 
    AND channel_name = community_messages.channel_name
  )
);

CREATE POLICY "Users can insert messages by channel name" 
ON public.community_messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND channel_name IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.user_channel_subscriptions 
    WHERE user_id = auth.uid() 
    AND channel_name = community_messages.channel_name
  )
);