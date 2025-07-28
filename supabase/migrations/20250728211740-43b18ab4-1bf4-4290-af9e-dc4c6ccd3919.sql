-- Inserisci abbonamento premium per l'utente corrente
INSERT INTO subscribers (
  user_id, 
  email, 
  subscription_plan, 
  subscription_status, 
  subscription_end_date,
  stripe_customer_id,
  is_cancelled,
  max_pets_allowed
) VALUES (
  '5d336311-bfc2-40f4-8cd8-3ad17bd246d5',
  'giusepperos89@gmail.com',
  'premium',
  'active',
  NOW() + INTERVAL '1 month',
  'temp_customer_id_2',
  false,
  999
) ON CONFLICT (user_id) DO UPDATE SET
  subscription_status = 'active',
  subscription_plan = 'premium',
  is_cancelled = false;