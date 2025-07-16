-- RESET COMPLETO: Azzera tutte le statistiche referral per ripartire con i test
-- Elimina tutti i crediti referral
DELETE FROM public.referral_credits;

-- Elimina tutte le analitiche referral
DELETE FROM public.referral_analytics;

-- Elimina tutti i badge referral
DELETE FROM public.referral_badges;

-- Elimina tutte le partecipazioni alle sfide
DELETE FROM public.challenge_participations;

-- Elimina tutti i referral
DELETE FROM public.referrals;

-- Elimina tutte le statistiche utente referral
DELETE FROM public.user_referrals;

-- Elimina tutti i log di attività legati ai referral
DELETE FROM public.activity_log 
WHERE activity_type IN (
  'referral_registered',
  'referral_converted', 
  'bulletproof_conversion_start',
  'bulletproof_conversion_success',
  'bulletproof_no_referral',
  'backup_conversion_success',
  'backup_scan_start',
  'backup_scan_complete',
  'recurring_commission_earned',
  'referral_monthly_credit'
);

-- Log del reset
INSERT INTO public.activity_log (
  user_id, activity_type, activity_description, metadata
) VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  'system_reset',
  '🔄 RESET COMPLETO: Tutte le statistiche referral azzerate per nuovi test',
  jsonb_build_object(
    'reset_time', now(),
    'reset_type', 'complete_referral_reset'
  )
);