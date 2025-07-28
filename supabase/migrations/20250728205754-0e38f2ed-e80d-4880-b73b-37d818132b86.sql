-- Rimuovi il ruolo admin dall'utente giusepperos89@gmail.com
-- Solo beppe8949@hotmail.it deve essere admin e vedere tutti i ticket
DELETE FROM public.user_roles 
WHERE user_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5' 
AND role = 'admin';