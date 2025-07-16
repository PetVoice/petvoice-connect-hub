-- RESET COMPLETO SISTEMA REFERRAL - AZZERA TUTTO
-- Mantiene solo Giuseppe ma resetta tutte le sue statistiche a zero

-- 1. Cancella tutti i referral
DELETE FROM public.referrals;

-- 2. Cancella tutti i crediti referral
DELETE FROM public.referral_credits;

-- 3. Reset completo statistiche Giuseppe a zero
UPDATE public.user_referrals 
SET 
    total_referrals = 0,
    successful_conversions = 0,
    total_credits_earned = 0,
    current_tier = 'Bronzo',
    updated_at = now()
WHERE user_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';

-- 4. Cancella tutte le analytics referral
DELETE FROM public.referral_analytics;

-- 5. Cancella tutti i badge referral
DELETE FROM public.referral_badges;

-- 6. Cancella partecipazioni challenge
DELETE FROM public.challenge_participations;

-- 7. Pulizia activity log referral-related
DELETE FROM public.activity_log 
WHERE activity_type IN (
    'referral_converted', 
    'referral_first_converted', 
    'recurring_commission_earned',
    'referral_monthly_credit',
    'auto_referral_conversion'
);

-- 8. Verifica finale - tutto azzerato
SELECT 
    'RESET_COMPLETATO' as risultato,
    (SELECT COUNT(*) FROM public.referrals) as referrals_totali,
    (SELECT COUNT(*) FROM public.referral_credits) as crediti_totali,
    ur.total_referrals,
    ur.successful_conversions,
    ur.total_credits_earned,
    ur.current_tier,
    (SELECT COUNT(*) FROM public.referral_analytics) as analytics_records
FROM public.user_referrals ur
WHERE ur.user_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';