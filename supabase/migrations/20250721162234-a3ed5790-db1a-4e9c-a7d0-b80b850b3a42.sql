-- RICREA LE 2 COMMISSIONI CORRETTE PER I 2 PAGAMENTI EFFETTIVI

-- 1. Commissione per Salvatore (primo referral convertito)
INSERT INTO public.referral_commissions (
  referrer_id, referred_user_id, amount, commission_rate, tier,
  commission_type, subscription_amount, 
  billing_period_start, billing_period_end,
  created_at, status
) VALUES (
  '5d336311-bfc2-40f4-8cd8-3ad17bd246d5', 
  '33372ef6-7633-421d-b754-c1ed68f77cd7', 
  0.0485, 0.05, 'Bronzo',
  'first_payment', 0.97,
  '2025-07-21', '2025-08-21',
  '2025-07-21 16:07:00', 'active'
);

-- 2. Commissione per Rosa (secondo referral convertito)  
INSERT INTO public.referral_commissions (
  referrer_id, referred_user_id, amount, commission_rate, tier,
  commission_type, subscription_amount,
  billing_period_start, billing_period_end, 
  created_at, status
) VALUES (
  '5d336311-bfc2-40f4-8cd8-3ad17bd246d5',
  '47091377-496e-4138-ab81-b203924bc225',
  0.0485, 0.05, 'Bronzo', 
  'first_payment', 0.97,
  '2025-07-21', '2025-08-21',
  '2025-07-21 16:20:00', 'active'
);

-- 3. Aggiorna statistiche corrette per 2 conversioni
UPDATE public.referrer_stats
SET 
  total_registrations = 2,
  total_conversions = 2,
  available_credits = 0.0970,  -- 2 x 0.0485
  total_credits_earned = 0.0970,
  current_tier = 'Bronzo',
  updated_at = NOW()
WHERE user_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';

-- 4. Log correzione
INSERT INTO public.activity_log (
  user_id, activity_type, activity_description, metadata
) VALUES (
  '5d336311-bfc2-40f4-8cd8-3ad17bd246d5',
  'system_fix',
  '✅ CORRETTO: Ricreate 2 commissioni per Rosa e Salvatore - 2 conversioni, €0.097 totali',
  jsonb_build_object(
    'fix_time', now(),
    'salvatore_commission', 0.0485,
    'rosa_commission', 0.0485,
    'total_credits', 0.0970,
    'conversions', 2
  )
);