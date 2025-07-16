-- Pulizia aggressiva completa del sistema referral
-- Rimuovi tutti i dati orfani e resetta completamente le statistiche

-- 1. Rimuovi tutti i referral orfani (referrer_id che non esiste più in auth.users)
DELETE FROM public.referrals 
WHERE referrer_id NOT IN (SELECT id FROM auth.users);

-- 2. Rimuovi tutte le statistiche referral orfane
DELETE FROM public.user_referrals 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- 3. Rimuovi tutti i crediti referral orfani
DELETE FROM public.referral_credits 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- 4. Rimuovi analytics orfani
DELETE FROM public.referral_analytics 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- 5. Rimuovi badges orfani
DELETE FROM public.referral_badges 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- 6. Rimuovi partecipazioni challenge orfane
DELETE FROM public.challenge_participations 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- 7. Reset completo delle statistiche per tutti gli utenti rimanenti
UPDATE public.user_referrals 
SET 
  total_referrals = 0,
  successful_conversions = 0,
  total_credits_earned = 0,
  current_tier = 'Bronzo',
  updated_at = now()
WHERE user_id IN (SELECT id FROM auth.users);

-- 8. Pulizia attività log riferite a referral
DELETE FROM public.activity_log 
WHERE activity_type IN (
  'referral_first_converted',
  'referral_monthly_credit', 
  'auto_referral_conversion',
  'recurring_commission_earned'
) AND user_id NOT IN (SELECT id FROM auth.users);

-- Conferma reset completo
DO $$
BEGIN
  RAISE NOTICE 'Reset completo del sistema referral completato - tutte le statistiche azzerate';
END $$;