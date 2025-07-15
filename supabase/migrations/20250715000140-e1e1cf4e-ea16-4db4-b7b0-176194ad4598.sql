-- Test: crea un referral "registered" per testare la funzione
INSERT INTO public.referrals (
  referrer_id,
  referred_email,
  referral_code,
  status
) VALUES (
  'de11f35e-aa21-4b19-a1e8-51c5c0a237ae', -- giusepperos89@gmail.com
  'test.referral@example.com',
  'TEST2024',
  'registered'
);