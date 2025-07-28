-- Aggiorna le email mancanti nella tabella profiles usando i dati dalla tabella auth.users
UPDATE public.profiles 
SET email = auth_users.email
FROM (
  SELECT id, email 
  FROM auth.users
) AS auth_users
WHERE profiles.user_id = auth_users.id 
AND (profiles.email IS NULL OR profiles.email = '');