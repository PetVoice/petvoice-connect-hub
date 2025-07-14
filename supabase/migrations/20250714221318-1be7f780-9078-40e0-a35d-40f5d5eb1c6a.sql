-- Aggiorna i crediti esistenti per riflettere le commissioni corrette del tier Argento (10%)
-- L'utente ha 5 conversioni, quindi è nel tier Argento che dovrebbe dare 0.097€ per referral

UPDATE public.referral_credits 
SET 
  amount = 0.097, -- 0.97€ * 10% = 0.097€ per tier Argento
  description = CASE 
    WHEN referral_id = '4ed86ec4-8209-4e89-a585-18ad7ee7b572' THEN 'Credito per conversione referral: rosa8949@outlook.it (tier Argento 10%)'
    WHEN referral_id = '8ce4b125-9c6a-45d6-bf63-640b8e012df8' THEN 'Credito per conversione referral: salvatore8949@outlook.it (tier Argento 10%)'
    WHEN referral_id = '7fd7d709-658e-47ff-b36a-f38ff7f1a9cf' THEN 'Credito per conversione referral: infoesupport@tradingmillimetrico.com (tier Argento 10%)'
    WHEN referral_id = '54dbd9a9-2278-4d46-b0fe-d990f7ce89c8' THEN 'Credito per conversione referral: beppe8949@hotmail.it (tier Argento 10%)'
    WHEN referral_id = '33a8630c-e6c8-479a-8630-d18620bc2142' THEN 'Credito per conversione referral: giuseppe.eros.lana@gmail.com (tier Argento 10%)'
    ELSE description
  END,
  updated_at = now()
WHERE user_id = '01666545-f178-46d7-9282-9389b489ada5';

-- Aggiorna le statistiche del referrer per riflettere i crediti corretti
UPDATE public.user_referrals 
SET 
  total_credits_earned = 0.485, -- 5 referral * 0.097€ = 0.485€
  current_tier = 'Argento',
  updated_at = now()
WHERE user_id = '01666545-f178-46d7-9282-9389b489ada5';

-- Aggiorna anche i record referral per riflettere le commissioni corrette
UPDATE public.referrals 
SET 
  credits_awarded = 0.097,
  updated_at = now()
WHERE referrer_id = '01666545-f178-46d7-9282-9389b489ada5' AND status = 'converted';