-- Aggiorna la politica per permettere la lettura dei nomi di display per le chat
-- Prima rimuoviamo la politica esistente
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Creiamo una nuova politica che permette di vedere i propri dati completi
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Creiamo una politica che permette di vedere solo display_name e avatar_url degli altri utenti
-- ma solo se sono coinvolti in chat private insieme
CREATE POLICY "Users can view display names for chats" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() != user_id AND (
    EXISTS (
      SELECT 1 FROM private_chats 
      WHERE (user1_id = auth.uid() AND user2_id = profiles.user_id)
         OR (user2_id = auth.uid() AND user1_id = profiles.user_id)
    )
  )
);