-- CORREZIONE DEFINITIVA: Correggi il referrer_id nel referral

-- 1. Aggiorna il referral con il referrer_id CORRETTO (Giuseppe)
UPDATE public.referrals 
SET 
    referrer_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5',  -- Giuseppe (giusepperos89@gmail.com)
    updated_at = now()
WHERE referred_email = 'salvatore8949@outlook.it'
  AND id = '2c88ac72-4c52-4779-a31c-8db7e6293c0e';

-- 2. Aggiorna il referral_code di Giuseppe nel profilo
UPDATE public.profiles 
SET referral_code = 'GIUSEPPE2024'
WHERE user_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5' 
  AND referral_code IS NULL;

-- 3. Verifica che tutto sia ora allineato
SELECT 
    'REFERRAL_CHECK' as type,
    r.referrer_id,
    r.referred_email,
    r.referral_code,
    r.status,
    ur.total_referrals,
    ur.successful_conversions,
    ur.total_credits_earned,
    p.display_name,
    (SELECT email FROM auth.users WHERE id = r.referrer_id) as referrer_email
FROM referrals r
LEFT JOIN user_referrals ur ON r.referrer_id = ur.user_id  
LEFT JOIN profiles p ON r.referrer_id = p.user_id
WHERE r.referred_email = 'salvatore8949@outlook.it';