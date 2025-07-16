-- Crea il referral MANUALE per salvatore8949@outlook.it
-- Simula una registrazione tramite referral di Giuseppe

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
  '5d336311-bfc2-40f4-8cd8-3ad17bd246d5', -- Giuseppe
  'salvatore8949@outlook.it',
  '67b7cee3-7939-424d-974e-105027fc387b', -- ID dell'utente appena registrato
  'GIUSEPPE2024',
  'registered',
  'manual_code',
  'referral',
  'manual',
  'friend_referral',
  '2025-07-16 22:15:19'
);

-- Aggiorna le statistiche di Giuseppe
UPDATE public.user_referrals 
SET 
  total_referrals = total_referrals + 1,
  updated_at = now()
WHERE user_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';

-- Log l'attività per Giuseppe
INSERT INTO public.activity_log (
  user_id,
  activity_type,
  activity_description,
  metadata,
  created_at
) VALUES (
  '5d336311-bfc2-40f4-8cd8-3ad17bd246d5',
  'referral_registered',
  'Nuovo referral registrato: salvatore8949@outlook.it',
  jsonb_build_object(
    'referred_email', 'salvatore8949@outlook.it',
    'referred_user_id', '67b7cee3-7939-424d-974e-105027fc387b',
    'status', 'registered',
    'tier', 'Bronzo'
  ),
  '2025-07-16 22:15:19'
);