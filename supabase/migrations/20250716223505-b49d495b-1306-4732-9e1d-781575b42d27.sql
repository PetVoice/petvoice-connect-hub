-- Conversione manuale del referral per beppe8949@hotmail.it
-- Trova il referral "registered" e convertilo a "converted"

UPDATE public.referrals 
SET 
  status = 'converted',
  conversion_date = now(),
  credits_awarded = 0.05,
  updated_at = now()
WHERE referred_email = 'beppe8949@hotmail.it' 
  AND status = 'registered';

-- Aggiorna le statistiche del referrer
UPDATE public.user_referrals 
SET 
  successful_conversions = successful_conversions + 1,
  total_credits_earned = total_credits_earned + 0.05,
  updated_at = now()
WHERE user_id = (
  SELECT referrer_id 
  FROM public.referrals 
  WHERE referred_email = 'beppe8949@hotmail.it'
  LIMIT 1
);

-- Crea il credito per il referrer
INSERT INTO public.referral_credits (
  user_id,
  referral_id,
  amount,
  credit_type,
  description,
  status,
  expires_at
)
SELECT 
  r.referrer_id,
  r.id,
  0.05,
  'first_conversion',
  'Conversione manuale: beppe8949@hotmail.it (Bronzo 5%)',
  'active',
  now() + interval '24 months'
FROM public.referrals r
WHERE r.referred_email = 'beppe8949@hotmail.it'
  AND r.status = 'converted'
  AND NOT EXISTS (
    SELECT 1 FROM public.referral_credits 
    WHERE referral_id = r.id
  );