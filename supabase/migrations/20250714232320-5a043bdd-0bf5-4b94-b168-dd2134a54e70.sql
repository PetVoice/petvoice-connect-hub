-- Converto manualmente il referral più recente che non è stato processato
UPDATE public.referrals 
SET 
  status = 'converted',
  conversion_date = now(),
  credits_awarded = 0.05,
  updated_at = now()
WHERE id = 'b7b134cd-d317-49f0-8be9-d03561ac5c4f' 
  AND status = 'registered';

-- Aggiorna le statistiche del referrer
UPDATE public.user_referrals 
SET 
  successful_conversions = successful_conversions + 1,
  total_credits_earned = total_credits_earned + 0.05,
  updated_at = now()
WHERE user_id = 'ab98b889-bd25-4505-85d4-26f3d64691ab';

-- Crea il credito per il referrer
INSERT INTO public.referral_credits (
  user_id,
  referral_id,
  amount,
  credit_type,
  description,
  status,
  expires_at
) VALUES (
  'ab98b889-bd25-4505-85d4-26f3d64691ab',
  'b7b134cd-d317-49f0-8be9-d03561ac5c4f',
  0.05,
  'referral_conversion',
  'Credito per conversione referral: giuseppe.eros.lana@gmail.com',
  'active',
  now() + interval '24 months'
);

-- Log l'attività per il referrer
INSERT INTO public.activity_log (
  user_id,
  activity_type,
  activity_description,
  metadata
) VALUES (
  'ab98b889-bd25-4505-85d4-26f3d64691ab',
  'referral_converted',
  'Referral convertito: giuseppe.eros.lana@gmail.com (+€0.05)',
  jsonb_build_object(
    'referred_email', 'giuseppe.eros.lana@gmail.com',
    'referred_user_id', 'ee587959-16c6-4a17-8ed5-58899b4cd760',
    'credit_amount', 0.05,
    'tier_commission', 0.05,
    'tier', 'Bronzo'
  )
);

-- Ricrea il trigger che non funziona
DROP TRIGGER IF EXISTS on_referral_payment ON public.subscribers;

CREATE TRIGGER on_referral_payment
  AFTER UPDATE ON public.subscribers
  FOR EACH ROW
  WHEN (NEW.subscription_status = 'active' AND (OLD.subscription_status IS NULL OR OLD.subscription_status != 'active'))
  EXECUTE FUNCTION public.handle_referral_payment();