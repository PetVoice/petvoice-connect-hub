-- RESET TOTALE - ELIMINA TUTTO E RICREA MANUALMENTE

-- 1. ELIMINA TUTTE LE COMMISSIONI PER QUESTO REFERRER
DELETE FROM public.referral_commissions 
WHERE referrer_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';

-- 2. DISABILITA TUTTI I TRIGGER POSSIBILI SU SUBSCRIBERS
DROP TRIGGER IF EXISTS process_referral_conversion_trigger ON public.subscribers;
DROP TRIGGER IF EXISTS handle_referral_conversion ON public.subscribers;
DROP TRIGGER IF EXISTS referral_conversion_trigger ON public.subscribers;

-- 3. RICREA MANUALMENTE SOLO LE 2 COMMISSIONI CORRETTE
-- Salvatore (primo referral)
INSERT INTO public.referral_commissions (
  id, referrer_id, referred_user_id, amount, commission_rate, tier,
  commission_type, subscription_amount, status,
  billing_period_start, billing_period_end, created_at
) VALUES (
  gen_random_uuid(), '5d336311-bfc2-40f4-8cd8-3ad17bd246d5', 
  '33372ef6-7633-421d-b754-c1ed68f77cd7', 0.0485, 0.05, 'Bronzo',
  'first_payment', 0.97, 'active',
  '2025-07-21', '2025-08-21', '2025-07-21 16:07:00'
);

-- Rosa (secondo referral)  
INSERT INTO public.referral_commissions (
  id, referrer_id, referred_user_id, amount, commission_rate, tier,
  commission_type, subscription_amount, status,
  billing_period_start, billing_period_end, created_at
) VALUES (
  gen_random_uuid(), '5d336311-bfc2-40f4-8cd8-3ad17bd246d5',
  '47091377-496e-4138-ab81-b203924bc225', 0.0485, 0.05, 'Bronzo',
  'first_payment', 0.97, 'active', 
  '2025-07-21', '2025-08-21', '2025-07-21 16:20:00'
);

-- 4. AGGIORNA STATISTICHE FINALI
UPDATE public.referrer_stats
SET 
  total_registrations = 2,
  total_conversions = 2, 
  available_credits = 0.0970,
  total_credits_earned = 0.0970,
  current_tier = 'Bronzo',
  updated_at = NOW()
WHERE user_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';

-- 5. LOG RESET TOTALE
INSERT INTO public.activity_log (
  user_id, activity_type, activity_description, metadata
) VALUES (
  '5d336311-bfc2-40f4-8cd8-3ad17bd246d5',
  'system_reset',
  '🔥 RESET TOTALE: Eliminato tutto, trigger disabilitati, commissioni ricreate manualmente',
  jsonb_build_object(
    'reset_time', now(),
    'final_state', '2_referrals_2_commissions_manual'
  )
);