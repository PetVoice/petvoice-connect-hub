-- Correggere i valori e rimuovere duplicati
-- Prima rimuovere il referral duplicato più vecchio
DELETE FROM public.referrals 
WHERE id = '3a7b6655-746e-407c-96e1-5f53ce88e934';

-- Correggere il calcolo dei crediti (€0.97 * 0.05 = €0.0485)
UPDATE public.referral_credits 
SET amount = 0.0485
WHERE user_id = '01666545-f178-46d7-9282-9389b489ada5';

-- Correggere le statistiche del referrer
UPDATE public.user_referrals 
SET 
  successful_conversions = 1,
  total_credits_earned = 0.0485,
  updated_at = now()
WHERE user_id = '01666545-f178-46d7-9282-9389b489ada5';