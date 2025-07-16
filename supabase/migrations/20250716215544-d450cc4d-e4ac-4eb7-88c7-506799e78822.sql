-- SOLUZIONE DEFINITIVA: Fix collegamento referral-subscriber e aggiorna statistiche

-- 1. Aggiorna subscriber con email mancante
UPDATE public.subscribers 
SET email = 'salvatore8949@outlook.it',
    updated_at = now()
WHERE user_id = '4d6cfa04-6764-4fb5-9dc1-1bc535427ae7' 
  AND email IS NULL;

-- 2. Aggiorna referral con user_id corretto
UPDATE public.referrals 
SET referred_user_id = '4d6cfa04-6764-4fb5-9dc1-1bc535427ae7',
    updated_at = now()
WHERE referred_email = 'salvatore8949@outlook.it' 
  AND referred_user_id IS NULL;

-- 3. Forza aggiornamento completo delle statistiche referral
SELECT update_all_referral_stats();

-- 4. Esegui conversione automatica per assicurarsi che tutto sia allineato
SELECT auto_convert_pending_referrals();

-- 5. Verifica che le statistiche siano corrette
SELECT 
    ur.user_id,
    ur.referral_code,
    ur.total_referrals,
    ur.successful_conversions,
    ur.total_credits_earned,
    ur.current_tier
FROM user_referrals ur 
WHERE ur.user_id = '814a3474-c4ea-49c3-9717-6e49143fcbb2';