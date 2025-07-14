-- Correggere il valore finale del credito
UPDATE public.user_referrals 
SET total_credits_earned = 0.0485
WHERE user_id = '01666545-f178-46d7-9282-9389b489ada5';