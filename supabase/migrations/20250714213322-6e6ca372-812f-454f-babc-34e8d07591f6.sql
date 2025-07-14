-- Crea il credito per il referral di beppe8949@hotmail.it
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
  (SELECT id FROM public.referrals WHERE referred_email = 'beppe8949@hotmail.it' AND referrer_id = '01666545-f178-46d7-9282-9389b489ada5'),
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