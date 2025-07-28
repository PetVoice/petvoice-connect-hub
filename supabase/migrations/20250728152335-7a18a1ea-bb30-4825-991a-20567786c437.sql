-- Eliminazione diretta dalla tabella auth.users
-- Elimina tutti gli utenti tranne giusepperos89@gmail.com

DELETE FROM auth.users 
WHERE email != 'giusepperos89@gmail.com';

-- Verifica risultato
SELECT email, created_at FROM auth.users ORDER BY created_at;