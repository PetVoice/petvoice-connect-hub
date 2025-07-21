-- PULIZIA COMMISSIONI DUPLICATE: Rimuovi commissioni ricorrenti spurie create contemporaneamente alle first_payment

-- Elimina le commissioni 'recurring' che sono state create allo stesso momento delle 'first_payment'
-- Queste sono duplicate spurie create dal trigger precedente
DELETE FROM public.referral_commissions 
WHERE commission_type = 'recurring' 
AND EXISTS (
  SELECT 1 FROM public.referral_commissions rc2 
  WHERE rc2.referrer_id = referral_commissions.referrer_id
    AND rc2.referred_user_id = referral_commissions.referred_user_id  
    AND rc2.commission_type = 'first_payment'
    AND DATE(rc2.created_at) = DATE(referral_commissions.created_at)
    AND ABS(EXTRACT(EPOCH FROM (rc2.created_at - referral_commissions.created_at))) < 60 -- Create entro 1 minuto
);

-- Aggiorna i crediti dei referrer sottraendo le commissioni spurie rimosse
UPDATE public.referrer_stats
SET 
  available_credits = available_credits - (
    SELECT COALESCE(SUM(amount), 0) 
    FROM public.referral_commissions 
    WHERE referrer_id = referrer_stats.user_id 
      AND commission_type = 'recurring'
      AND created_at > '2025-07-21 16:00:00'::timestamp
  ),
  total_credits_earned = total_credits_earned - (
    SELECT COALESCE(SUM(amount), 0) 
    FROM public.referral_commissions 
    WHERE referrer_id = referrer_stats.user_id 
      AND commission_type = 'recurring'
      AND created_at > '2025-07-21 16:00:00'::timestamp  
  ),
  updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM public.referral_commissions 
  WHERE referrer_id = referrer_stats.user_id 
    AND commission_type = 'recurring'
    AND created_at > '2025-07-21 16:00:00'::timestamp
);

-- Log della pulizia
INSERT INTO public.activity_log (
  user_id, activity_type, activity_description, metadata
) VALUES (
  '5d336311-bfc2-40f4-8cd8-3ad17bd246d5',
  'system_cleanup',
  '🧹 PULIZIA: Rimosse commissioni ricorrenti spurie duplicate',
  jsonb_build_object(
    'cleanup_time', now(),
    'cleanup_type', 'remove_duplicate_recurring_commissions'
  )
);