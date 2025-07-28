-- Inserisci un abbonamento premium temporaneo per l'utente corrente se non esiste
INSERT INTO public.subscribers (user_id, email, subscribed, subscription_tier, subscription_end)
SELECT 
  '5d336311-bfc2-40f4-8cd8-3ad17bd246d5'::uuid,
  'admin@example.com',
  true,
  'premium',
  NOW() + INTERVAL '1 year'
WHERE NOT EXISTS (
  SELECT 1 FROM public.subscribers 
  WHERE user_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5'::uuid
);