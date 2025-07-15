-- Aggiungi colonna email alla tabella subscribers per il webhook Stripe
ALTER TABLE public.subscribers ADD COLUMN email TEXT;

-- Crea indice per ricerche rapide
CREATE INDEX idx_subscribers_email ON public.subscribers(email);

-- Aggiorna constraint unique per includere email
ALTER TABLE public.subscribers ADD CONSTRAINT unique_email UNIQUE (email);

-- Popola email esistenti dove possibile
UPDATE public.subscribers 
SET email = au.email 
FROM auth.users au 
WHERE subscribers.user_id = au.id 
  AND subscribers.email IS NULL;