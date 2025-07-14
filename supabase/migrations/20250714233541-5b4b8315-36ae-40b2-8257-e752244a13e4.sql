-- Fix manuale per il referral di giuseppe.eros.lana@gmail.com che non è stato processato
UPDATE public.referrals 
SET 
  status = 'converted',
  conversion_date = now(),
  credits_awarded = 0.05,
  updated_at = now()
WHERE id = 'cd10e613-eac7-4cda-bc36-a5dd5154b0ca' 
  AND status = 'registered';

-- Aggiorna le statistiche del referrer giusepperos89@gmail.com
UPDATE public.user_referrals 
SET 
  successful_conversions = successful_conversions + 1,
  total_credits_earned = total_credits_earned + 0.05,
  updated_at = now()
WHERE user_id = '923a5837-27e2-42f5-883a-4be7d82462a6';

-- Crea il credito per il referrer
INSERT INTO public.referral_credits (
  user_id,
  referral_id,
  amount,
  credit_type,
  description,
  status,
  expires_at
) VALUES (
  '923a5837-27e2-42f5-883a-4be7d82462a6',
  'cd10e613-eac7-4cda-bc36-a5dd5154b0ca',
  0.05,
  'referral_conversion',
  'Credito per conversione referral: giuseppe.eros.lana@gmail.com',
  'active',
  now() + interval '24 months'
);

-- Log l'attività per il referrer
INSERT INTO public.activity_log (
  user_id,
  activity_type,
  activity_description,
  metadata
) VALUES (
  '923a5837-27e2-42f5-883a-4be7d82462a6',
  'referral_converted',
  'Referral convertito: giuseppe.eros.lana@gmail.com (+€0.05)',
  jsonb_build_object(
    'referred_email', 'giuseppe.eros.lana@gmail.com',
    'referred_user_id', '377a5951-e0b8-4539-a62b-6f0ab5cd3eeb',
    'credit_amount', 0.05,
    'tier_commission', 0.05,
    'tier', 'Bronzo'
  )
);