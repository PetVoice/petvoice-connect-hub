-- Creo manualmente il referral per mariolana12321@hotmail.com
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
  created_at,
  updated_at
) VALUES (
  '5d336311-bfc2-40f4-8cd8-3ad17bd246d5', -- referrer GIUSEPPE2024
  'mariolana12321@hotmail.com',
  '9b9e8542-03a1-47d4-918d-57fb709d456f',
  'GIUSEPPE2024',
  'registered',
  'manual_code',
  'referral',
  'manual',
  'friend_referral',
  '2025-07-16 21:39:47.856268+00', -- data di registrazione
  now()
)
ON CONFLICT (referrer_id, referred_email) DO NOTHING;

-- Aggiorna le statistiche del referrer
UPDATE public.user_referrals 
SET 
  total_referrals = total_referrals + 1,
  updated_at = now()
WHERE user_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';

-- Verifica che il referral sia stato creato
SELECT 
  r.referrer_id,
  r.referred_email,
  r.status,
  r.created_at,
  ur.referral_code,
  ur.total_referrals
FROM public.referrals r
JOIN public.user_referrals ur ON r.referrer_id = ur.user_id
WHERE r.referred_email = 'mariolana12321@hotmail.com';