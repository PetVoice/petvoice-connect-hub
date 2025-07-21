-- RESET COMPLETO SISTEMA REFERRAL: Azzera tutto inclusi referral recenti e statistiche

-- 1. Elimina TUTTI i referral (inclusi quelli recenti)
DELETE FROM public.referrals;

-- 2. Elimina TUTTE le commissioni referral
DELETE FROM public.referral_commissions;

-- 3. Elimina TUTTE le statistiche referrer (mantenendo solo la struttura base)
DELETE FROM public.referrer_stats;

-- 4. Ricreare la statistica base per giusepperos89@gmail.com con valori azzerati
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
  (SELECT referral_code FROM public.profiles WHERE user_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5'),
  'Bronzo',
  0,
  0,
  0,
  0,
  0,
  NOW()
) ON CONFLICT (user_id) DO UPDATE SET
  current_tier = 'Bronzo',
  tier_progress = 0,
  total_conversions = 0,
  total_registrations = 0,
  available_credits = 0,
  total_credits_earned = 0,
  updated_at = NOW();

-- 5. Elimina TUTTI i log di attività referral (inclusi i recenti)
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

-- 6. Log del reset totale
INSERT INTO public.activity_log (
  user_id, activity_type, activity_description, metadata
) VALUES (
  '5d336311-bfc2-40f4-8cd8-3ad17bd246d5',
  'system_total_reset',
  '🔄 RESET TOTALE: Sistema referral completamente azzerato - nessun referral, nessuna statistica',
  jsonb_build_object(
    'reset_time', now(),
    'reset_type', 'complete_affiliate_system_reset',
    'reset_items', array['referrals', 'commissions', 'stats', 'activity_logs']
  )
);