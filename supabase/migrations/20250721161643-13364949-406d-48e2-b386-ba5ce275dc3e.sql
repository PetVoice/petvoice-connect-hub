-- PULIZIA DEFINITIVA COMMISSIONI: Rimuovi tutte le commissioni duplicate

-- 1. Elimina commissioni recurring spurie (non dovrebbero esistere per prime sottoscrizioni)
DELETE FROM public.referral_commissions 
WHERE commission_type = 'recurring' 
  AND referrer_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';

-- 2. Elimina commissioni first_payment duplicate - tieni solo la più vecchia per ogni referred_user_id
DELETE FROM public.referral_commissions 
WHERE commission_type = 'first_payment' 
  AND referrer_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5'
  AND id IN (
    SELECT id 
    FROM (
      SELECT id, 
             ROW_NUMBER() OVER (PARTITION BY referred_user_id ORDER BY created_at ASC) as rn
      FROM public.referral_commissions 
      WHERE commission_type = 'first_payment' 
        AND referrer_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5'
    ) ranked
    WHERE rn > 1  -- Elimina tutte tranne la prima (più vecchia)
  );

-- 3. Ricalcola crediti basandosi solo sulle commissioni rimaste
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

-- 4. Log della pulizia definitiva
INSERT INTO public.activity_log (
  user_id, activity_type, activity_description, metadata
) VALUES (
  '5d336311-bfc2-40f4-8cd8-3ad17bd246d5',
  'system_cleanup',
  '🧹 PULIZIA DEFINITIVA: Rimosse tutte le commissioni duplicate - rimane solo first_payment',
  jsonb_build_object(
    'cleanup_time', now(),
    'cleanup_type', 'final_commission_cleanup'
  )
);