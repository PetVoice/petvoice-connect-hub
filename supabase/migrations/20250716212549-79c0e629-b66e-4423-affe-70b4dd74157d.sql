-- Pulizia completa dei dati per mariolana12321@hotmail.com per permettere nuovi test
-- Rimuovi tutti i dati relativi a questo utente

-- 1. Rimuovi crediti referral
DELETE FROM public.referral_credits 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'mariolana12321@hotmail.com'
);

-- 2. Rimuovi referral dove è referrer o referred
DELETE FROM public.referrals 
WHERE referrer_id IN (
  SELECT id FROM auth.users WHERE email = 'mariolana12321@hotmail.com'
) OR referred_email = 'mariolana12321@hotmail.com';

-- 3. Rimuovi statistiche referral
DELETE FROM public.user_referrals 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'mariolana12321@hotmail.com'
);

-- 4. Rimuovi analytics referral
DELETE FROM public.referral_analytics 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'mariolana12321@hotmail.com'
);

-- 5. Rimuovi badges
DELETE FROM public.referral_badges 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'mariolana12321@hotmail.com'
);

-- 6. Rimuovi partecipazioni challenge
DELETE FROM public.challenge_participations 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'mariolana12321@hotmail.com'
);

-- 7. Rimuovi subscriber
DELETE FROM public.subscribers 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'mariolana12321@hotmail.com'
) OR email = 'mariolana12321@hotmail.com';

-- 8. Rimuovi profilo
DELETE FROM public.profiles 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'mariolana12321@hotmail.com'
);

-- 9. Rimuovi attività log
DELETE FROM public.activity_log 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'mariolana12321@hotmail.com'
);

-- 10. Rimuovi utente auth (questo cancellerà anche le dipendenze rimanenti)
DELETE FROM auth.users WHERE email = 'mariolana12321@hotmail.com';

-- Conferma pulizia
DO $$
BEGIN
  RAISE NOTICE 'Pulizia completata per mariolana12321@hotmail.com - ora puoi rifare i test con questa email';
END $$;