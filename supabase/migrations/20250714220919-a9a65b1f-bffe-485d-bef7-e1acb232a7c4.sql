-- Aggiungi i crediti mancanti per i 2 referral che non hanno ricevuto commissioni
INSERT INTO public.referral_credits (
  user_id,
  referral_id,
  amount,
  credit_type,
  description,
  status,
  expires_at
) VALUES 
(
  '01666545-f178-46d7-9282-9389b489ada5',
  '4ed86ec4-8209-4e89-a585-18ad7ee7b572',
  0.05,
  'referral_conversion',
  'Credito per conversione referral: rosa8949@outlook.it',
  'active',
  now() + interval '24 months'
),
(
  '01666545-f178-46d7-9282-9389b489ada5',
  '8ce4b125-9c6a-45d6-bf63-640b8e012df8',
  0.05,
  'referral_conversion',
  'Credito per conversione referral: salvatore8949@outlook.it',
  'active',
  now() + interval '24 months'
);

-- Aggiorna le statistiche del referrer per riflettere i crediti corretti
UPDATE public.user_referrals 
SET 
  total_credits_earned = 0.25,  -- 5 referral * 0.05 = 0.25
  updated_at = now()
WHERE user_id = '01666545-f178-46d7-9282-9389b489ada5';