-- RESET COMPLETO SISTEMA REFERRAL: Ripartire da 0 completamente

-- 1. Reset completo referrer_stats
UPDATE public.referrer_stats 
SET 
  current_tier = 'Bronzo',
  tier_progress = 0,
  total_conversions = 0,
  total_registrations = 0,
  available_credits = 0,
  total_credits_earned = 0,
  updated_at = NOW();

-- 2. Reset tutti i referrals a "registered" (non convertiti)
UPDATE public.referrals 
SET 
  status = 'registered',
  conversion_date = NULL,
  credits_awarded = NULL,
  updated_at = NOW();

-- 3. Elimina tutti i log di attività legati ai referral per pulire lo storico
DELETE FROM public.activity_log 
WHERE activity_type IN (
  'referral_registered',
  'referral_converted', 
  'first_referral_commission',
  'recurring_referral_commission',
  'referral_monthly_credit',
  'system_correction',
  'referral_cancelled'
);

-- 4. Log del reset completo
INSERT INTO public.activity_log (
  user_id, activity_type, activity_description, metadata
) VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  'system_reset',
  '🔄 RESET TOTALE: Sistema referral completamente azzerato',
  jsonb_build_object(
    'reset_time', now(),
    'reset_type', 'complete_referral_system_reset'
  )
);