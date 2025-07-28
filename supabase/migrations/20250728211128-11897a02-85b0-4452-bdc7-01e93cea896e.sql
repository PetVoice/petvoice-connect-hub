-- Inserisci abbonamento premium per l'utente corrente con la struttura esistente
INSERT INTO public.subscribers (user_id, email, subscribed, subscription_tier, subscription_end)
VALUES (
  '5d336311-bfc2-40f4-8cd8-3ad17bd246d5'::uuid,
  (SELECT email FROM auth.users WHERE id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5'::uuid),
  true,
  'premium',
  NOW() + INTERVAL '1 year'
) ON CONFLICT (email) DO UPDATE SET
  subscribed = true,
  subscription_tier = 'premium',
  subscription_end = NOW() + INTERVAL '1 year',
  updated_at = NOW();