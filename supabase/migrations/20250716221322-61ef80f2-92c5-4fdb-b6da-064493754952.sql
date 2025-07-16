-- Cancella il vecchio referral di Salvatore per permettere nuovo test
DELETE FROM public.referrals 
WHERE referred_email = 'salvatore8949@outlook.it';

-- Verifica che sia stato cancellato
SELECT 'REFERRAL_CANCELLATO' as risultato, COUNT(*) as referrals_salvatore
FROM public.referrals 
WHERE referred_email = 'salvatore8949@outlook.it';