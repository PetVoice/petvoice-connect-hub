-- SOLUZIONE FINALE: Crea manualmente le statistiche referrer mancanti

-- Crea user_referrals per il referrer
INSERT INTO public.user_referrals (
    user_id, 
    referral_code, 
    total_referrals, 
    successful_conversions, 
    total_credits_earned, 
    current_tier
) VALUES (
    '814a3474-c4ea-49c3-9717-6e49143fcbb2',
    'GIUSEPPE2024',
    1,  -- ha 1 referral totale
    1,  -- 1 conversione
    0.05, -- commissione 5%
    'Bronzo'
)
ON CONFLICT (user_id) DO UPDATE SET
    total_referrals = 1,
    successful_conversions = 1,
    total_credits_earned = 0.05,
    current_tier = 'Bronzo',
    updated_at = now();

-- Crea il credito referral per questo utente
INSERT INTO public.referral_credits (
    user_id,
    referral_id,
    amount,
    credit_type,
    description,
    status,
    expires_at
) VALUES (
    '814a3474-c4ea-49c3-9717-6e49143fcbb2',
    '2c88ac72-4c52-4779-a31c-8db7e6293c0e',
    0.05,
    'referral_conversion',
    'Credito referral per salvatore8949@outlook.it',
    'active',
    now() + interval '24 months'
)
ON CONFLICT (referral_id) DO NOTHING;

-- Log attività per il referrer
INSERT INTO public.activity_log (
    user_id,
    activity_type,
    activity_description,
    metadata
) VALUES (
    '814a3474-c4ea-49c3-9717-6e49143fcbb2',
    'referral_converted_manual',
    'Referral convertito: salvatore8949@outlook.it (+€0.05)',
    jsonb_build_object(
        'referred_email', 'salvatore8949@outlook.it',
        'credit_amount', 0.05,
        'tier', 'Bronzo',
        'manual_fix', true
    )
);

-- Verifica finale
SELECT 
    ur.user_id,
    ur.referral_code,
    ur.total_referrals,
    ur.successful_conversions,
    ur.total_credits_earned,
    ur.current_tier,
    (SELECT COUNT(*) FROM referral_credits WHERE user_id = ur.user_id) as credits_count
FROM user_referrals ur 
WHERE ur.user_id = '814a3474-c4ea-49c3-9717-6e49143fcbb2';