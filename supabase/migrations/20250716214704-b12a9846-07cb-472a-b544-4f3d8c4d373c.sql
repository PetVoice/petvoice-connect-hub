-- FORZA LA CONVERSIONE DEL REFERRAL mariolana12321@hotmail.com
-- Il problema è che l'abbonamento era già attivo quando abbiamo creato il referral

-- 1. Converte il referral a 'converted'
UPDATE public.referrals 
SET 
  status = 'converted',
  conversion_date = now(),
  credits_awarded = 0.05, -- 5% commissione Bronzo
  updated_at = now()
WHERE referrer_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5' 
  AND referred_email = 'mariolana12321@hotmail.com'
  AND status = 'registered';

-- 2. Crea il credito per il referrer
INSERT INTO public.referral_credits (
  user_id,
  referral_id,
  amount,
  credit_type,
  description,
  status,
  expires_at
) 
SELECT 
  r.referrer_id,
  r.id,
  0.05, -- €0.05 commissione Bronzo
  'manual_conversion',
  'Conversione manuale: ' || r.referred_email || ' (Bronzo 5%)',
  'active',
  now() + interval '24 months'
FROM public.referrals r
WHERE r.referrer_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5' 
  AND r.referred_email = 'mariolana12321@hotmail.com'
  AND r.status = 'converted';

-- 3. Aggiorna le statistiche del referrer
UPDATE public.user_referrals 
SET 
  successful_conversions = successful_conversions + 1,
  total_credits_earned = total_credits_earned + 0.05,
  current_tier = 'Bronzo', -- Rimane Bronzo con 1 conversione
  updated_at = now()
WHERE user_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';

-- 4. Log dell'attività
INSERT INTO public.activity_log (
  user_id,
  activity_type,
  activity_description,
  metadata
) VALUES (
  '5d336311-bfc2-40f4-8cd8-3ad17bd246d5',
  'manual_referral_conversion',
  'Conversione manuale: mariolana12321@hotmail.com (+€0.05)',
  jsonb_build_object(
    'referred_email', 'mariolana12321@hotmail.com',
    'commission_amount', 0.05,
    'tier', 'Bronzo',
    'conversion_type', 'manual_fix'
  )
);

-- 5. Verifica finale
SELECT 
  'RISULTATO FINALE' as status,
  jsonb_build_object(
    'referral_status', r.status,
    'conversion_date', r.conversion_date,
    'credits_awarded', r.credits_awarded,
    'referrer_conversions', ur.successful_conversions,
    'referrer_credits', ur.total_credits_earned,
    'referrer_tier', ur.current_tier,
    'active_credits', (SELECT COUNT(*) FROM public.referral_credits WHERE user_id = ur.user_id AND status = 'active')
  ) as dati
FROM public.referrals r
JOIN public.user_referrals ur ON r.referrer_id = ur.user_id
WHERE r.referrer_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5'
  AND r.referred_email = 'mariolana12321@hotmail.com';