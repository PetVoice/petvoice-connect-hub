-- Forzare conversione manuale per l'utente esistente
UPDATE public.referrals 
SET 
  status = 'converted',
  conversion_date = now(),
  credits_awarded = 0.0485,  -- €0.97 * 0.05 (5% commissione tier Bronze)
  updated_at = now()
WHERE referred_email = 'giuseppe.eros.lana@gmail.com' 
  AND status = 'registered';

-- Aggiungere crediti al referrer
INSERT INTO public.referral_credits (
  user_id,
  referral_id,
  amount,
  credit_type,
  description,
  status,
  expires_at
) VALUES (
  '01666545-f178-46d7-9282-9389b489ada5',
  '33a8630c-e6c8-479a-8630-d18620bc2142',
  0.0485,
  'referral_conversion',
  'Credito per conversione referral: giuseppe.eros.lana@gmail.com',
  'active',
  now() + interval '24 months'
);

-- Aggiornare statistiche del referrer
UPDATE public.user_referrals 
SET 
  successful_conversions = successful_conversions + 1,
  total_credits_earned = total_credits_earned + 0.0485,
  updated_at = now()
WHERE user_id = '01666545-f178-46d7-9282-9389b489ada5';