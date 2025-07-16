-- Il trigger corretto non esiste! Devo ricrearlo
-- Prima rimuovo i trigger che usano la funzione sbagliata
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_simple ON auth.users;

-- Ora creo il trigger corretto che gestisce i referral
CREATE TRIGGER on_complete_user_registration
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_complete_user_registration();

-- Processo manualmente il referral per rosa8949@outlook.it che è stato registrato ma non ha ottenuto il referral
INSERT INTO public.referrals (
  referrer_id,
  referred_email, 
  referred_user_id,
  referral_code,
  status,
  channel,
  utm_source,
  utm_medium,
  utm_campaign,
  created_at
) VALUES (
  '5d336311-bfc2-40f4-8cd8-3ad17bd246d5', -- Giuseppe's user_id
  'rosa8949@outlook.it',
  '02dc942d-0c90-4389-88c3-82690560c798', -- Rosa's user_id
  'GIUSEPPE2024',
  'registered',
  'manual_code',
  'referral',
  'manual', 
  'friend_referral',
  NOW()
);

-- Aggiorna le statistiche di Giuseppe
UPDATE public.user_referrals 
SET 
  total_referrals = total_referrals + 1,
  updated_at = NOW()
WHERE user_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';

-- Log dell'attività
INSERT INTO public.activity_log (
  user_id,
  activity_type,
  activity_description,
  metadata
) VALUES (
  '5d336311-bfc2-40f4-8cd8-3ad17bd246d5',
  'referral_registered',
  'Referral registrato manualmente: rosa8949@outlook.it',
  jsonb_build_object(
    'referred_email', 'rosa8949@outlook.it',
    'referred_user_id', '02dc942d-0c90-4389-88c3-82690560c798',
    'referral_code', 'GIUSEPPE2024',
    'status', 'registered',
    'manual_fix', true
  )
);