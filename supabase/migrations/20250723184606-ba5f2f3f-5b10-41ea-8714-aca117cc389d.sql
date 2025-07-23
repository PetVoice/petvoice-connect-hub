-- Aggiorna la lingua del profilo utente corrente in italiano
UPDATE profiles 
SET language = 'it', updated_at = now() 
WHERE user_id = auth.uid();