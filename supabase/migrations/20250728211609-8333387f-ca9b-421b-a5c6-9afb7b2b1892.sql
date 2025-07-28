-- Inserisci abbonamento premium temporaneo
INSERT INTO subscribers (
  user_id, 
  email, 
  subscription_plan, 
  subscription_status, 
  subscription_end_date,
  stripe_customer_id,
  is_cancelled,
  cancellation_type,
  cancellation_date,
  cancellation_effective_date,
  max_pets_allowed
) 
SELECT 
  auth.uid(),
  auth.email(),
  'premium',
  'active',
  NOW() + INTERVAL '1 month',
  'temp_customer_id',
  false,
  null,
  null,
  null,
  999
WHERE NOT EXISTS (
  SELECT 1 FROM subscribers WHERE user_id = auth.uid()
);