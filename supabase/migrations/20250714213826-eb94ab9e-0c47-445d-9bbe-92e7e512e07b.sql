-- Ricrea il trigger per i referrals che ho rimosso per sbaglio
CREATE TRIGGER on_auth_user_referral_registration
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_referral_registration();

-- Crea manualmente il record referral mancante per infoesupport@tradingmillimetrico.com
INSERT INTO public.referrals (
  referrer_id,
  referred_email,
  referred_user_id,
  referral_code,
  status,
  channel,
  utm_source,
  utm_medium,
  utm_campaign,
  created_at,
  conversion_date,
  credits_awarded
) VALUES (
  '01666545-f178-46d7-9282-9389b489ada5',
  'infoesupport@tradingmillimetrico.com',
  '24f7d400-100e-4b69-a669-a961416da276',
  'GIUSEPPE2024',
  'converted',
  'manual_code',
  'referral',
  'manual',
  'friend_referral',
  '2025-07-14 21:36:03',
  '2025-07-14 21:36:17',
  0.05
);

-- Aggiorna le statistiche del referrer
UPDATE public.user_referrals 
SET 
  total_referrals = total_referrals + 1,
  successful_conversions = successful_conversions + 1,
  total_credits_earned = total_credits_earned + 0.05,
  updated_at = now()
WHERE user_id = '01666545-f178-46d7-9282-9389b489ada5';

-- Crea il credito
INSERT INTO public.referral_credits (
  user_id,
  referral_id,
  amount,
  credit_type,
  description,
  status,
  expires_at,
  created_at
) VALUES (
  '01666545-f178-46d7-9282-9389b489ada5',
  (SELECT id FROM public.referrals WHERE referred_email = 'infoesupport@tradingmillimetrico.com'),
  0.05,
  'referral_conversion',
  'Credito per conversione referral: infoesupport@tradingmillimetrico.com',
  'active',
  now() + interval '24 months',
  '2025-07-14 21:36:17'
);

-- Log l'attività
INSERT INTO public.activity_log (
  user_id,
  activity_type,
  activity_description,
  metadata,
  created_at
) VALUES (
  '01666545-f178-46d7-9282-9389b489ada5',
  'referral_converted',
  'Referral convertito: infoesupport@tradingmillimetrico.com (+€0.05)',
  jsonb_build_object(
    'referred_email', 'infoesupport@tradingmillimetrico.com',
    'referred_user_id', '24f7d400-100e-4b69-a669-a961416da276',
    'credit_amount', 0.05,
    'tier_commission', 0.05,
    'tier', 'Bronzo'
  ),
  '2025-07-14 21:36:17'
);