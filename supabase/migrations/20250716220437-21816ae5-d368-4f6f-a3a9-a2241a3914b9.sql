-- CORREZIONE REFERRAL ROSA - stesso problema degli altri

-- 1. Correggi il referrer_id di Rosa
UPDATE public.referrals 
SET 
    referrer_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5',  -- Giuseppe corretto
    credits_awarded = 0.05,  -- Aggiungi crediti mancanti
    updated_at = now()
WHERE id = 'ccdce177-2580-4593-87e5-d17de30988af'
  AND referred_email = 'rosa8949@outlook.it';

-- 2. Crea il credito mancante per Rosa
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
    'ccdce177-2580-4593-87e5-d17de30988af',  -- Referral Rosa
    0.05,
    'missing_conversion_credit',
    'Credito mancante per conversione: rosa8949@outlook.it',
    'active',
    now() + interval '24 months'
);

-- 3. Aggiorna le statistiche di Giuseppe (ora 3 conversioni!)
UPDATE public.user_referrals 
SET 
    successful_conversions = 3,  -- 3 conversioni totali!
    total_credits_earned = 0.15,  -- €0.05 * 3 = €0.15
    updated_at = now()
WHERE user_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';

-- 4. Controllo finale
SELECT 
    'GIUSEPPE_STATS_FINALI' as tipo,
    ur.successful_conversions,
    ur.total_credits_earned,
    ur.current_tier,
    (SELECT COUNT(*) FROM referrals WHERE referrer_id = ur.user_id AND status = 'converted') as conversioni_reali
FROM user_referrals ur
WHERE ur.user_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';