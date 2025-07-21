-- Rimuoviamo la politica errata se esiste
DROP POLICY IF EXISTS "Users can view display names for chats" ON public.profiles;

-- Creiamo una politica che permette di vedere solo display_name e avatar_url degli altri utenti
-- ma solo se sono coinvolti in chat private insieme
CREATE POLICY "Users can view display names for chats" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() != user_id AND (
    EXISTS (
      SELECT 1 FROM private_chats 
      WHERE (participant_1_id = auth.uid() AND participant_2_id = profiles.user_id)
         OR (participant_2_id = auth.uid() AND participant_1_id = profiles.user_id)
    )
  )
);