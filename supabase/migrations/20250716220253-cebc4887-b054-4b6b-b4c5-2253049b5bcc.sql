-- CORREZIONE URGENTE: Giuseppe ha 2 conversioni ma solo 1 creditata!

-- 1. Aggiorna il referral di Salvatore con i crediti mancanti
UPDATE public.referrals 
SET credits_awarded = 0.05
WHERE id = '2c88ac72-4c52-4779-a31c-8db7e6293c0e'
  AND referred_email = 'salvatore8949@outlook.it';

-- 2. Crea il credito mancante per Salvatore
INSERT INTO public.referral_credits (
    user_id,
    referral_id,
    amount,
    credit_type,
    description,
    status,
    expires_at
) VALUES (
    '5d336311-bfc2-40f4-8cd8-3ad17bd246d5',  -- Giuseppe
    '2c88ac72-4c52-4779-a31c-8db7e6293c0e',  -- Referral Salvatore
    0.05,
    'missing_conversion_credit',
    'Credito mancante per conversione: salvatore8949@outlook.it',
    'active',
    now() + interval '24 months'
);

-- 3. Aggiorna le statistiche corrette di Giuseppe
UPDATE public.user_referrals 
SET 
    successful_conversions = 2,  -- 2 conversioni corrette!
    total_credits_earned = 0.10,  -- €0.05 + €0.05 = €0.10
    updated_at = now()
WHERE user_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';

-- 4. Verifica finale
SELECT 
    'STATISTICHE_CORRETTE' as tipo,
    ur.successful_conversions,
    ur.total_credits_earned,
    ur.current_tier,
    (SELECT COUNT(*) FROM referrals WHERE referrer_id = ur.user_id AND status = 'converted') as referral_convertiti_reali,
    (SELECT COUNT(*) FROM referral_credits WHERE user_id = ur.user_id) as crediti_totali
FROM user_referrals ur
WHERE ur.user_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';