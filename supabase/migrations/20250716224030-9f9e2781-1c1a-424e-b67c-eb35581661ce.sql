-- CONVERSIONE MANUALE DI ROSA - triggera la funzione direttamente
-- Converte il referral manualmente
UPDATE public.referrals 
SET 
  status = 'converted',
  conversion_date = now(),
  referred_user_id = '02dc942d-0c90-4389-88c3-82690560c798',
  credits_awarded = 0.05,
  updated_at = now()
WHERE id = 'b9175c34-e9d4-4961-9ec5-03d821f66fbc'
  AND referred_email = 'rosa8949@outlook.it';

-- Aggiorna statistiche Giuseppe
UPDATE public.user_referrals 
SET 
  successful_conversions = successful_conversions + 1,
  total_credits_earned = total_credits_earned + 0.05,
  updated_at = now()
WHERE user_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';

-- Crea il credito per Giuseppe
INSERT INTO public.referral_credits (
  user_id,
  referral_id,
  amount,
  credit_type,
  description,
  status,
  expires_at
) VALUES (
  '5d336311-bfc2-40f4-8cd8-3ad17bd246d5',  -- Giuseppe
  'b9175c34-e9d4-4961-9ec5-03d821f66fbc',  -- Referral Rosa
  0.05,
  'manual_conversion',
  'Conversione manuale: rosa8949@outlook.it (Bronzo 5%)',
  'active',
  now() + interval '24 months'
);

-- Log attività
INSERT INTO public.activity_log (
  user_id, 
  activity_type, 
  activity_description, 
  metadata
) VALUES (
  '5d336311-bfc2-40f4-8cd8-3ad17bd246d5',
  'referral_manual_converted',
  'Cliente convertito manualmente: +€0.05 (Bronzo)',
  jsonb_build_object(
    'referral_id', 'b9175c34-e9d4-4961-9ec5-03d821f66fbc',
    'commission_amount', 0.05,
    'commission_rate', 0.05,
    'tier', 'Bronzo',
    'referred_user', 'rosa8949@outlook.it',
    'method', 'manual_fix'
  )
);

-- Controllo finale
SELECT 
  'ROSA_CONVERSIONE_FINALE' as tipo,
  r.status,
  r.conversion_date,
  r.credits_awarded,
  ur.successful_conversions,
  ur.total_credits_earned,
  ur.current_tier
FROM referrals r
JOIN user_referrals ur ON r.referrer_id = ur.user_id
WHERE r.id = 'b9175c34-e9d4-4961-9ec5-03d821f66fbc';