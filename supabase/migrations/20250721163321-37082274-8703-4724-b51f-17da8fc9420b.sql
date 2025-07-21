-- AGGIUNGI LA COMMISSIONE MANCANTE DI BEPPE E AGGIORNA STATISTICHE

-- 1. Aggiungi commissione per Beppe (terzo referral)
INSERT INTO public.referral_commissions (
  id, referrer_id, referred_user_id, amount, commission_rate, tier,
  commission_type, subscription_amount, status,
  billing_period_start, billing_period_end, created_at
) VALUES (
  gen_random_uuid(), '5d336311-bfc2-40f4-8cd8-3ad17bd246d5',
  'b0a1521f-9a4d-4908-bd90-e4548247d7dd', 0.0485, 0.05, 'Bronzo',
  'first_payment', 0.97, 'active',
  '2025-07-21', '2025-08-21', '2025-07-21 16:26:00'
);

-- 2. Aggiorna statistiche: ora hai 3 conversioni, quindi crediti = 0.0485 * 3 = 0.1455
UPDATE public.referrer_stats
SET 
  total_registrations = 3,
  total_conversions = 3,
  available_credits = 0.1455,  -- 3 commissioni da €0.0485
  total_credits_earned = 0.1455,
  current_tier = 'Bronzo',
  updated_at = NOW()
WHERE user_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';

-- 3. Log correzione
INSERT INTO public.activity_log (
  user_id, activity_type, activity_description, metadata
) VALUES (
  '5d336311-bfc2-40f4-8cd8-3ad17bd246d5',
  'commission_correction',
  '✅ CORREZIONE: Aggiunta commissione mancante per Beppe (3° referral)',
  jsonb_build_object(
    'missing_user', 'beppe8949@hotmail.it',
    'total_referrals', 3,
    'new_credits', 0.1455
  )
);