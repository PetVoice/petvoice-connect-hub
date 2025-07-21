-- ELIMINA COMMISSIONE DUPLICATA DI SALVATORE

-- Elimina la commissione più recente di Salvatore (tieni quella delle 16:07)
DELETE FROM public.referral_commissions 
WHERE id = 'a732e3e8-3d0d-4371-87e2-2be6876fa3f3';

-- Ricalcola crediti corretti (2 commissioni x 0.0485)
UPDATE public.referrer_stats
SET 
  available_credits = 0.0970,
  total_credits_earned = 0.0970,
  updated_at = NOW()
WHERE user_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';

-- Log della correzione finale
INSERT INTO public.activity_log (
  user_id, activity_type, activity_description, metadata
) VALUES (
  '5d336311-bfc2-40f4-8cd8-3ad17bd246d5',
  'system_fix',
  'STORICO CORRETTO: Eliminata commissione duplicata di Salvatore',
  jsonb_build_object(
    'fix_time', now(),
    'final_transactions', 2
  )
);