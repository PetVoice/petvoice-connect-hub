-- FIX: Aggiorna email NULL per Giuseppe e converte il suo referral
UPDATE public.subscribers 
SET email = 'giuseppe.eros.lana@gmail.com'
WHERE user_id = 'e5b193b9-0eb6-4ada-aa34-1d564b1fee3d';

-- Converte automaticamente il referral di Giuseppe
WITH converted_referral AS (
  UPDATE public.referrals 
  SET 
    status = 'converted',
    conversion_date = now(),
    credits_awarded = 0.05,
    updated_at = now()
  WHERE id = 'fd616dc5-ccf7-4eb7-9faf-bb0b4c6982ce'
    AND status = 'registered'
  RETURNING *
)
-- Aggiorna stats del referrer (Giuseppe senior)
UPDATE public.user_referrals 
SET 
  successful_conversions = successful_conversions + 1,
  total_credits_earned = total_credits_earned + 0.05,
  updated_at = now()
WHERE user_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';

-- Crea credito per Giuseppe senior
INSERT INTO public.referral_credits (
  user_id,
  referral_id,
  amount,
  credit_type,
  description,
  status,
  expires_at
) VALUES (
  '5d336311-bfc2-40f4-8cd8-3ad17bd246d5',  -- Giuseppe senior
  'fd616dc5-ccf7-4eb7-9faf-bb0b4c6982ce',  -- Referral Giuseppe junior
  0.05,
  'automatic_conversion',
  'Conversione automatica: giuseppe.eros.lana@gmail.com (Bronzo 5%)',
  'active',
  now() + interval '24 months'
);