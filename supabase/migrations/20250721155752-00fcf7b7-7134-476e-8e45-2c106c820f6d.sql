-- RESET COMMISSIONI: Elimina tutte le commissioni referral per ripartire da 0

-- Elimina tutte le commissioni referral
DELETE FROM public.referral_commissions;

-- Azzera i crediti nelle statistiche referrer mantenendo le conversioni
UPDATE public.referrer_stats 
SET 
  available_credits = 0,
  total_credits_earned = 0,
  updated_at = NOW();

-- Log del reset
INSERT INTO public.activity_log (
  user_id, activity_type, activity_description, metadata
) VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  'system_reset',
  '🔄 RESET COMMISSIONI: Tutte le commissioni eliminate per nuovi test',
  jsonb_build_object(
    'reset_time', now(),
    'reset_type', 'commissions_reset'
  )
);