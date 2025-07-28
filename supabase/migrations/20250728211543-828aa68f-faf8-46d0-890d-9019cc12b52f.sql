-- Inserisci temporaneamente abbonamento premium per test
INSERT INTO subscribers (
  user_id, 
  email, 
  subscribed, 
  subscription_tier, 
  subscription_end,
  stripe_customer_id,
  is_cancelled,
  cancellation_type,
  cancellation_date,
  cancellation_effective_date
) 
SELECT 
  auth.uid(),
  auth.email(),
  true,
  'premium',
  NOW() + INTERVAL '1 month',
  'temp_customer_id',
  false,
  null,
  null,
  null
WHERE NOT EXISTS (
  SELECT 1 FROM subscribers WHERE user_id = auth.uid()
);