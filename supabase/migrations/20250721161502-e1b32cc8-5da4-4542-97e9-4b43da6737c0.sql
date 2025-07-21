-- CORREZIONE CREDITI: Allinea i crediti alle commissioni effettive
UPDATE public.referrer_stats
SET 
  available_credits = (
    SELECT COALESCE(SUM(amount), 0) 
    FROM public.referral_commissions 
    WHERE referrer_id = referrer_stats.user_id 
      AND status = 'active'
      AND is_cancelled = false
  ),
  total_credits_earned = (
    SELECT COALESCE(SUM(amount), 0) 
    FROM public.referral_commissions 
    WHERE referrer_id = referrer_stats.user_id 
      AND status = 'active'
      AND is_cancelled = false
  ),
  updated_at = NOW()
WHERE user_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';

-- Log della correzione crediti
INSERT INTO public.activity_log (
  user_id, activity_type, activity_description, metadata
) VALUES (
  '5d336311-bfc2-40f4-8cd8-3ad17bd246d5',
  'system_fix', 
  '💳 CREDITI CORRETTI: Allineati alle commissioni effettive',
  jsonb_build_object(
    'fix_time', now(),
    'fix_type', 'credits_realignment'
  )
);