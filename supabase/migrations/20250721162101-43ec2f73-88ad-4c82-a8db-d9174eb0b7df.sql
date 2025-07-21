-- DISABILITA COMPLETAMENTE IL TRIGGER E PULISCI TUTTO

-- 1. DISABILITA TUTTI I TRIGGER DI COMMISSIONI
DROP TRIGGER IF EXISTS safe_referral_conversion_trigger_corrected ON public.subscribers;
DROP TRIGGER IF EXISTS safe_referral_conversion_trigger ON public.subscribers;

-- 2. ELIMINA TUTTE LE COMMISSIONI PER QUESTO REFERRER
DELETE FROM public.referral_commissions 
WHERE referrer_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';

-- 3. CREA MANUALMENTE SOLO UNA COMMISSIONE FIRST_PAYMENT CORRETTA
INSERT INTO public.referral_commissions (
  referrer_id, referred_user_id, amount, commission_rate, tier,
  commission_type, subscription_amount, 
  billing_period_start, billing_period_end,
  created_at, status
) VALUES (
  '5d336311-bfc2-40f4-8cd8-3ad17bd246d5', 
  '33372ef6-7633-421d-b754-c1ed68f77cd7', 
  0.0485, 0.05, 'Bronzo',
  'first_payment', 0.97,
  '2025-07-21', '2025-08-21',
  '2025-07-21 16:10:00', 'active'
);

-- 4. RICALCOLA CREDITI BASANDOSI SULLA SINGOLA COMMISSIONE
UPDATE public.referrer_stats
SET 
  available_credits = 0.0485,
  total_credits_earned = 0.0485,
  total_conversions = 1,
  updated_at = NOW()
WHERE user_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';

-- 5. LOG DELLA SOLUZIONE DEFINITIVA
INSERT INTO public.activity_log (
  user_id, activity_type, activity_description, metadata
) VALUES (
  '5d336311-bfc2-40f4-8cd8-3ad17bd246d5',
  'system_fix',
  '🔨 SOLUZIONE DEFINITIVA: Trigger disabilitato, commissioni pulite, una sola commissione manuale',
  jsonb_build_object(
    'fix_time', now(),
    'action', 'disabled_trigger_manual_commission',
    'final_credits', 0.0485
  )
);