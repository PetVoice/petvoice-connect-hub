-- Prima pulisco i referral orfani (referrer che non esistono più)
DELETE FROM public.referrals 
WHERE referrer_id NOT IN (SELECT id FROM auth.users);

-- Ora creo i user_referrals solo per referrer che esistono davvero
INSERT INTO public.user_referrals (user_id, referral_code, total_referrals, successful_conversions, total_credits_earned, current_tier)
SELECT DISTINCT 
  r.referrer_id,
  'TEMP_' || SUBSTRING(r.referrer_id::text, 1, 8) as referral_code,
  0 as total_referrals,
  0 as successful_conversions,
  0 as total_credits_earned,
  'Bronzo' as current_tier
FROM public.referrals r
INNER JOIN auth.users u ON r.referrer_id = u.id
LEFT JOIN public.user_referrals ur ON r.referrer_id = ur.user_id
WHERE ur.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Aggiorna le statistiche basate sui referral esistenti
UPDATE public.user_referrals 
SET 
  total_referrals = (
    SELECT COUNT(*) FROM public.referrals 
    WHERE referrer_id = user_referrals.user_id
  ),
  successful_conversions = (
    SELECT COUNT(*) FROM public.referrals 
    WHERE referrer_id = user_referrals.user_id 
    AND status = 'converted'
  ),
  total_credits_earned = (
    SELECT COALESCE(SUM(credits_awarded), 0) FROM public.referrals 
    WHERE referrer_id = user_referrals.user_id 
    AND status = 'converted'
  ),
  updated_at = now();