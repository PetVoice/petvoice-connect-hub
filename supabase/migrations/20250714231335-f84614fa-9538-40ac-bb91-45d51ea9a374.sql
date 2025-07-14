-- Crea il record user_referrals mancante per il referrer
INSERT INTO public.user_referrals (
  user_id,
  referral_code,
  total_referrals,
  successful_conversions,
  total_credits_earned,
  current_tier
) VALUES (
  'c54a4afb-8886-4426-9b85-7682584c32d2',
  'GIUSEPPE2024',
  1,
  1,
  0.05,
  'Bronzo'
)
ON CONFLICT (user_id) DO UPDATE SET
  total_referrals = EXCLUDED.total_referrals,
  successful_conversions = EXCLUDED.successful_conversions,
  total_credits_earned = EXCLUDED.total_credits_earned,
  current_tier = EXCLUDED.current_tier;

-- Aggiorna il referral per questo utente 
UPDATE public.referrals 
SET 
  status = 'converted',
  conversion_date = now(),
  credits_awarded = 0.05,
  updated_at = now()
WHERE referrer_id = 'c54a4afb-8886-4426-9b85-7682584c32d2' 
  AND referred_email = 'beppe8949@hotmail.it'
  AND status = 'registered';

-- Crea il credito corrispondente
INSERT INTO public.referral_credits (
  user_id,
  referral_id,
  amount,
  credit_type,
  description,
  status,
  expires_at
) VALUES (
  'c54a4afb-8886-4426-9b85-7682584c32d2',
  (SELECT id FROM public.referrals WHERE referrer_id = 'c54a4afb-8886-4426-9b85-7682584c32d2' AND referred_email = 'beppe8949@hotmail.it' ORDER BY created_at DESC LIMIT 1),
  0.05,
  'referral_conversion',
  'Credito per conversione referral: beppe8949@hotmail.it',
  'active',
  now() + interval '24 months'
);