-- CORREZIONE FINALE: Associa le statistiche all'utente referrer corretto

-- 1. Prima controllo chi ha sbagliato codice referral
SELECT 'Wrong user_referrals' as issue, * FROM user_referrals WHERE referral_code = 'GIUSEPPE2024';

-- 2. Cancella le statistiche sbagliate 
DELETE FROM user_referrals 
WHERE referral_code = 'GIUSEPPE2024' 
  AND user_id != '814a3474-c4ea-49c3-9717-6e49143fcbb2';

-- 3. Ora crea le statistiche per l'utente referrer CORRETTO
INSERT INTO public.user_referrals (
    user_id, 
    referral_code, 
    total_referrals, 
    successful_conversions, 
    total_credits_earned, 
    current_tier
) VALUES (
    '814a3474-c4ea-49c3-9717-6e49143fcbb2',  -- L'utente referrer CORRETTO
    'GIUSEPPE2024',
    1,
    1,
    0.05,
    'Bronzo'
);

-- 4. Crea il credito per l'utente referrer corretto
INSERT INTO public.referral_credits (
    user_id,
    referral_id,
    amount,
    credit_type,
    description,
    status,
    expires_at
) VALUES (
    '814a3474-c4ea-49c3-9717-6e49143fcbb2',  -- L'utente referrer CORRETTO
    '2c88ac72-4c52-4779-a31c-8db7e6293c0e',
    0.05,
    'referral_conversion',
    'Credito referral: salvatore8949@outlook.it',
    'active',
    now() + interval '24 months'
)
ON CONFLICT (referral_id) DO NOTHING;

-- 5. Verifica finale che ora tutto sia corretto
SELECT 
    'FINAL_CHECK' as table_name,
    ur.user_id,
    ur.referral_code,
    ur.total_referrals,
    ur.successful_conversions,
    ur.total_credits_earned,
    (SELECT COUNT(*) FROM referral_credits WHERE user_id = ur.user_id) as credits_count
FROM user_referrals ur 
WHERE ur.referral_code = 'GIUSEPPE2024';