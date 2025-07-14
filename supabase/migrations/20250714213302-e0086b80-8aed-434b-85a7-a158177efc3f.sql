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
);

-- Aggiorna le statistiche del referrer
UPDATE public.user_referrals 
SET 
  total_referrals = total_referrals + 1,
  successful_conversions = successful_conversions + 1,
  total_credits_earned = total_credits_earned + 0.05,
  updated_at = now()
WHERE user_id = '01666545-f178-46d7-9282-9389b489ada5';