-- Testa il sistema con un nuovo utente per verificare che le commissioni siano corrette
-- Rimuove l'utente di test precedente
DELETE FROM auth.users WHERE email = 'test@example.com';

-- Crea un nuovo utente di test
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud
) VALUES (
  gen_random_uuid(),
  'test2@example.com',
  '$2a$10$test',
  now(),
  '{"display_name": "Test User 2", "referral_code": "GIUSEPPE2024"}'::jsonb,
  now(),
  now(),
  'authenticated',
  'authenticated'
);

-- Verifica che il nuovo sistema funzioni correttamente
SELECT 
  r.referred_email,
  r.credits_awarded,
  r.status,
  ur.current_tier,
  ur.total_credits_earned,
  ur.successful_conversions
FROM public.referrals r
JOIN public.user_referrals ur ON r.referrer_id = ur.user_id
WHERE r.referred_email = 'test2@example.com';