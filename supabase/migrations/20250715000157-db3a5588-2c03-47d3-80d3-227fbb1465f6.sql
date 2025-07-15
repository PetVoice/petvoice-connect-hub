-- Crea user_referrals per giusepperos89@gmail.com
INSERT INTO public.user_referrals (
  user_id,
  referral_code,
  total_referrals,
  successful_conversions,
  total_credits_earned,
  current_tier
) VALUES (
  'de11f35e-aa21-4b19-a1e8-51c5c0a237ae',
  'GIUSEPPEROS2024',
  0,
  0,
  0,
  'Bronzo'
) ON CONFLICT (user_id) DO NOTHING;