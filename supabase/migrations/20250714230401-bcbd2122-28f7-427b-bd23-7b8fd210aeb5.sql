-- Controlla se ci sono errori specifici e forza la conversione
UPDATE public.referrals 
SET 
  status = 'converted',
  conversion_date = NOW(),
  credits_awarded = 0.0485,
  updated_at = NOW()
WHERE referred_user_id = '075d7147-68a4-4f33-b72f-e85206c5b227';

-- Aggiungi il credito direttamente
INSERT INTO public.referral_credits (
  user_id,
  amount,
  credit_type,
  description,
  status
) VALUES (
  'c54a4afb-8886-4426-9b85-7682584c32d2',
  0.0485,
  'referral_conversion',
  'Credito manuale per referral convertito',
  'active'
);

-- Aggiorna le statistiche del referrer
UPDATE public.user_referrals 
SET 
  successful_conversions = 1,
  total_credits_earned = 0.0485,
  current_tier = 'Bronzo',
  updated_at = NOW()
WHERE user_id = 'c54a4afb-8886-4426-9b85-7682584c32d2';