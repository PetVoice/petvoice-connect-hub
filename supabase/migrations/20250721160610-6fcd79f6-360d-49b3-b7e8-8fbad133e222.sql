-- RESET COMPLETO SISTEMA REFERRAL: Azzera tutto e genera codice referral

-- 1. Elimina TUTTI i referral (inclusi quelli recenti)
DELETE FROM public.referrals;

-- 2. Elimina TUTTE le commissioni referral
DELETE FROM public.referral_commissions;

-- 3. Elimina TUTTE le statistiche referrer
DELETE FROM public.referrer_stats;

-- 4. Genera codice referral per giusepperos89@gmail.com se non esiste
UPDATE public.profiles 
SET referral_code = 'GIUSEPPE2025'
WHERE user_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5' 
  AND (referral_code IS NULL OR referral_code = '');

-- 5. Ricreare la statistica base per giusepperos89@gmail.com con valori azzerati
INSERT INTO public.referrer_stats (
  user_id, 
  referral_code,
  current_tier, 
  tier_progress,
  total_conversions,
  total_registrations, 
  available_credits,
  total_credits_earned,
  updated_at
) VALUES (
  '5d336311-bfc2-40f4-8cd8-3ad17bd246d5',
  'GIUSEPPE2025',
  'Bronzo',
  0,
  0,
  0,
  0,
  0,
  NOW()
);

-- 6. Elimina TUTTI i log di attività referral (inclusi i recenti)
DELETE FROM public.activity_log 
WHERE activity_type IN (
  'referral_registered',
  'referral_converted', 
  'first_referral_commission',
  'recurring_referral_commission',
  'referral_monthly_credit',
  'system_correction',
  'referral_cancelled',
  'bulletproof_conversion_start',
  'bulletproof_conversion_success',
  'bulletproof_no_referral',
  'backup_conversion_success',
  'backup_scan_start',
  'backup_scan_complete',
  'recurring_commission_earned'
);

-- 7. Log del reset totale
INSERT INTO public.activity_log (
  user_id, activity_type, activity_description, metadata
) VALUES (
  '5d336311-bfc2-40f4-8cd8-3ad17bd246d5',
  'system_total_reset',
  '🔄 RESET TOTALE: Sistema referral azzerato - 0 referral, 0 statistiche, tier Bronzo',
  jsonb_build_object(
    'reset_time', now(),
    'reset_type', 'complete_affiliate_system_reset',
    'referral_code', 'GIUSEPPE2025',
    'new_tier', 'Bronzo'
  )
);