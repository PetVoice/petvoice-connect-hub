-- Crea il record referral mancante per beppe8949@hotmail.it
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
  conversion_date,
  credits_awarded
) VALUES (
  '01666545-f178-46d7-9282-9389b489ada5',
  'beppe8949@hotmail.it',
  'be11923f-fdcf-4fb7-b0db-335c6351067f',
  'GIUSEPPE2024',
  'converted',
  'manual_code',
  'referral',
  'manual',
  'friend_referral',
  '2025-07-14 21:25:55',
  '2025-07-14 21:26:45',
  0.05
)
ON CONFLICT (referrer_id, referred_email) DO UPDATE SET
  referred_user_id = EXCLUDED.referred_user_id,
  status = EXCLUDED.status,
  conversion_date = EXCLUDED.conversion_date,
  credits_awarded = EXCLUDED.credits_awarded;

-- Aggiorna le statistiche del referrer
UPDATE public.user_referrals 
SET 
  total_referrals = total_referrals + 1,
  successful_conversions = successful_conversions + 1,
  total_credits_earned = total_credits_earned + 0.05,
  updated_at = now()
WHERE user_id = '01666545-f178-46d7-9282-9389b489ada5';

-- Crea il credito per il referrer
INSERT INTO public.referral_credits (
  user_id,
  referral_id,
  amount,
  credit_type,
  description,
  status,
  expires_at,
  created_at
) VALUES (
  '01666545-f178-46d7-9282-9389b489ada5',
  (SELECT id FROM public.referrals WHERE referred_email = 'beppe8949@hotmail.it'),
  0.05,
  'referral_conversion',
  'Credito per conversione referral: beppe8949@hotmail.it',
  'active',
  now() + interval '24 months',
  '2025-07-14 21:26:45'
);

-- Log l'attività 
INSERT INTO public.activity_log (
  user_id,
  activity_type,
  activity_description,
  metadata,
  created_at
) VALUES (
  '01666545-f178-46d7-9282-9389b489ada5',
  'referral_converted',
  'Referral convertito: beppe8949@hotmail.it (+€0.05)',
  jsonb_build_object(
    'referred_email', 'beppe8949@hotmail.it',
    'referred_user_id', 'be11923f-fdcf-4fb7-b0db-335c6351067f',
    'credit_amount', 0.05,
    'tier_commission', 0.05,
    'tier', 'Bronzo'
  ),
  '2025-07-14 21:26:45'
);