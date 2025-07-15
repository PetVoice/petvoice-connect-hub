-- Test con utente che esiste davvero
-- 1. Crea user_referrals per test@example.com
INSERT INTO public.user_referrals (
  user_id,
  referral_code,
  total_referrals,
  successful_conversions,
  total_credits_earned,
  current_tier
) VALUES (
  'be2d613b-6a47-468c-98f3-59fbdc5ee1f5',
  'TEST2024',
  0,
  0,
  0,
  'Bronzo'
) ON CONFLICT (user_id) DO NOTHING;

-- 2. Crea referral "registered" con questo referrer
INSERT INTO public.referrals (
  referrer_id,
  referred_email,
  referral_code,
  status
) VALUES (
  'be2d613b-6a47-468c-98f3-59fbdc5ee1f5',
  'pagamento.test@example.com',
  'TEST2024',
  'registered'
) ON CONFLICT DO NOTHING;