-- Inserisci abbonamento premium per l'utente che ha appena pagato
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
  '0b951d09-81bb-46b4-b0d1-af8e3d377c8e',
  'giuseppe.eros.lana@gmail.com',
  'premium',
  'active',
  NOW() + INTERVAL '1 month',
  'paid_customer_giuseppe',
  false,
  999
) ON CONFLICT (user_id) DO UPDATE SET
  subscription_status = 'active',
  subscription_plan = 'premium',
  is_cancelled = false,
  subscription_end_date = NOW() + INTERVAL '1 month';