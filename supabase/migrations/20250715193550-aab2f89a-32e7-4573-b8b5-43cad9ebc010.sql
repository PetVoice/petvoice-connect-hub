-- Fix RLS policy per permettere soft delete dei messaggi
DROP POLICY IF EXISTS "Users can delete own messages" ON public.community_messages;

-- Nuova policy che permette UPDATE per soft delete
CREATE POLICY "Users can soft delete own messages" 
ON public.community_messages 
FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);