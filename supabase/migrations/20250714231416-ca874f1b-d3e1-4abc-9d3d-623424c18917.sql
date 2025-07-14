-- Aggiorna il referrer corretto (quello che possiede il codice GIUSEPPE2024)
UPDATE public.user_referrals 
SET 
  successful_conversions = successful_conversions + 1,
  total_credits_earned = total_credits_earned + 0.05,
  current_tier = 'Bronzo',
  updated_at = now()
WHERE referral_code = 'GIUSEPPE2024';

-- Aggiorna il referral per puntare al referrer corretto
UPDATE public.referrals 
SET 
  referrer_id = 'ab98b889-bd25-4505-85d4-26f3d64691ab',
  status = 'converted',
  conversion_date = now(),
  credits_awarded = 0.05,
  updated_at = now()
WHERE referred_email = 'beppe8949@hotmail.it'
  AND referral_code = 'GIUSEPPE2024'
  AND status = 'registered';

-- Crea il credito per il referrer corretto
INSERT INTO public.referral_credits (
  user_id,
  referral_id,
  amount,
  credit_type,
  description,
  status,
  expires_at
) VALUES (
  'ab98b889-bd25-4505-85d4-26f3d64691ab',
  (SELECT id FROM public.referrals WHERE referral_code = 'GIUSEPPE2024' AND referred_email = 'beppe8949@hotmail.it' ORDER BY created_at DESC LIMIT 1),
  0.05,
  'referral_conversion',
  'Credito per conversione referral: beppe8949@hotmail.it',
  'active',
  now() + interval '24 months'
);