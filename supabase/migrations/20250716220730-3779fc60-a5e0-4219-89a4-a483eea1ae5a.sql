-- PULIZIA COMPLETA DATABASE - MANTIENI SOLO GIUSEPPE

-- 1. Elimina tutti i crediti referral tranne quelli di Giuseppe
DELETE FROM public.referral_credits 
WHERE user_id != '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';

-- 2. Elimina tutti i referral tranne quelli di Giuseppe come referrer
DELETE FROM public.referrals 
WHERE referrer_id != '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';

-- 3. Elimina tutte le statistiche referral tranne quelle di Giuseppe
DELETE FROM public.user_referrals 
WHERE user_id != '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';

-- 4. Elimina tutti i subscriber tranne Giuseppe
DELETE FROM public.subscribers 
WHERE user_id != '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';

-- 5. Elimina tutti i profili tranne Giuseppe
DELETE FROM public.profiles 
WHERE user_id != '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';

-- 6. Reset delle statistiche di Giuseppe a zero
UPDATE public.user_referrals 
SET 
    total_referrals = 0,
    successful_conversions = 0,
    total_credits_earned = 0,
    current_tier = 'Bronzo',
    updated_at = now()
WHERE user_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';

-- 7. Verifica finale - deve rimanere solo Giuseppe
SELECT 
    'PULIZIA_COMPLETATA' as risultato,
    (SELECT COUNT(*) FROM auth.users WHERE email != 'giusepperos89@gmail.com') as altri_utenti_auth,
    (SELECT COUNT(*) FROM profiles WHERE user_id != '5d336311-bfc2-40f4-8cd8-3ad17bd246d5') as altri_profili,
    (SELECT COUNT(*) FROM referrals) as referrals_rimasti,
    (SELECT COUNT(*) FROM referral_credits) as crediti_rimasti,
    (SELECT COUNT(*) FROM subscribers WHERE user_id != '5d336311-bfc2-40f4-8cd8-3ad17bd246d5') as altri_subscribers,
    -- Statistiche Giuseppe reset
    ur.total_referrals,
    ur.successful_conversions,
    ur.total_credits_earned,
    ur.current_tier
FROM user_referrals ur
WHERE ur.user_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';