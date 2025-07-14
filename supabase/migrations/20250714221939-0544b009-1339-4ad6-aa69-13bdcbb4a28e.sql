-- Disabilita il trigger vecchio per evitare conflitti
DROP TRIGGER IF EXISTS on_auth_user_referral_registration ON auth.users;

-- Assicura che solo il trigger completo sia attivo
DROP TRIGGER IF EXISTS on_complete_user_registration ON auth.users;

-- Ricrea il trigger con la funzione corretta
CREATE TRIGGER on_complete_user_registration
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_complete_user_registration();

-- Testa che le commissioni siano corrette per i nuovi utenti
-- Crea un utente di test per verificare
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
  'test@example.com',
  '$2a$10$test',
  now(),
  '{"display_name": "Test User", "referral_code": "GIUSEPPE2024"}'::jsonb,
  now(),
  now(),
  'authenticated',
  'authenticated'
);

-- Verifica che il trigger abbia creato i record corretti
SELECT 
  r.referred_email,
  r.credits_awarded,
  r.status,
  ur.current_tier,
  ur.total_credits_earned,
  ur.successful_conversions
FROM public.referrals r
JOIN public.user_referrals ur ON r.referrer_id = ur.user_id
WHERE r.referred_email = 'test@example.com';