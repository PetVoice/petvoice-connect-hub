-- Aggiornare il record del subscriber per attivare il trigger di conversione
UPDATE public.subscribers 
SET updated_at = now()
WHERE email = 'giuseppe.eros.lana@gmail.com' AND subscribed = true;