-- Elimina l'utente giuseppe.eros.lana@gmail.com dal database

-- Prima elimina dalla tabella subscribers se esiste
DELETE FROM public.subscribers 
WHERE email = 'giuseppe.eros.lana@gmail.com';

-- Poi elimina dalla tabella profiles se esiste 
DELETE FROM public.profiles 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email = 'giuseppe.eros.lana@gmail.com'
);

-- Infine elimina dalla tabella auth.users (questo richiede privilegi di servizio)
-- Nota: questo potrebbe non funzionare tramite SQL normale, potrebbe richiedere l'edge function