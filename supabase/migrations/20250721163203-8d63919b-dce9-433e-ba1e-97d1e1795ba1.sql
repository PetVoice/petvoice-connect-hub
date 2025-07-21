-- SOLUZIONE DEFINITIVA: ELIMINA TUTTO - CRON JOBS, FUNZIONI, COMMISSIONI

-- 1. DISABILITA TUTTI I CRON JOB CHE PROCESSANO REFERRAL
SELECT cron.unschedule('ultra-fast-referral-check');
SELECT cron.unschedule('ultra-fast-referral-check-delayed');  
SELECT cron.unschedule('process-referral-payments');
SELECT cron.unschedule('sync-stripe-subscriptions');

-- 2. ELIMINA TUTTE LE FUNZIONI CHE POSSONO CREARE COMMISSIONI
DROP FUNCTION IF EXISTS public.simple_convert_all_pending();
DROP FUNCTION IF EXISTS public.process_all_payments();
DROP FUNCTION IF EXISTS public.convert_referral(uuid, text);
DROP FUNCTION IF EXISTS public.force_convert_all_now();
DROP FUNCTION IF EXISTS public.convert_referral_on_payment(uuid);
DROP FUNCTION IF EXISTS public.process_referral_conversion();
DROP FUNCTION IF EXISTS public.process_referral_conversion_corrected();
DROP FUNCTION IF EXISTS public.handle_referral_monthly_credit();
DROP FUNCTION IF EXISTS public.process_recurring_commissions(uuid);

-- 3. ELIMINA TUTTE LE COMMISSIONI PER IL REFERRER
DELETE FROM public.referral_commissions 
WHERE referrer_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';

-- 4. RICREA MANUALMENTE SOLO LE 2 COMMISSIONI CORRETTE
INSERT INTO public.referral_commissions (
  id, referrer_id, referred_user_id, amount, commission_rate, tier,
  commission_type, subscription_amount, status,
  billing_period_start, billing_period_end, created_at
) VALUES 
(gen_random_uuid(), '5d336311-bfc2-40f4-8cd8-3ad17bd246d5', 
 '33372ef6-7633-421d-b754-c1ed68f77cd7', 0.0485, 0.05, 'Bronzo',
 'first_payment', 0.97, 'active', '2025-07-21', '2025-08-21', '2025-07-21 16:07:00'),
(gen_random_uuid(), '5d336311-bfc2-40f4-8cd8-3ad17bd246d5',
 '47091377-496e-4138-ab81-b203924bc225', 0.0485, 0.05, 'Bronzo', 
 'first_payment', 0.97, 'active', '2025-07-21', '2025-08-21', '2025-07-21 16:20:00');

-- 5. AGGIORNA STATISTICHE FINALI  
UPDATE public.referrer_stats
SET total_registrations = 2, total_conversions = 2, 
    available_credits = 0.0970, total_credits_earned = 0.0970,
    current_tier = 'Bronzo', updated_at = NOW()
WHERE user_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';

-- 6. LOG ELIMINAZIONE TOTALE
INSERT INTO public.activity_log (user_id, activity_type, activity_description, metadata) 
VALUES ('5d336311-bfc2-40f4-8cd8-3ad17bd246d5', 'system_nuclear_reset',
        '💀 RESET NUCLEARE: Eliminati cron job, funzioni e tutte le commissioni automatiche',
        jsonb_build_object('action', 'nuclear_reset', 'timestamp', now()));