-- Inserisci abbonamento premium con ID specifico
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
  '09074291-1da2-41d6-b42a-9aab212ef8f6',
  'beppe8949@hotmail.it',
  'premium',
  'active',
  NOW() + INTERVAL '1 month',
  'temp_customer_id',
  false,
  999
) ON CONFLICT (user_id) DO UPDATE SET
  subscription_status = 'active',
  subscription_plan = 'premium',
  is_cancelled = false;