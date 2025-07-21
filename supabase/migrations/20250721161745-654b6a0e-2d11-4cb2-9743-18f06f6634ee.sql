-- CORREZIONE CONTEGGIO CONVERSIONI: Allinea total_conversions ai dati effettivi

UPDATE public.referrer_stats
SET 
  total_conversions = (
    SELECT COUNT(*) 
    FROM public.referrals 
    WHERE referrer_id = referrer_stats.user_id 
      AND status = 'converted'
  ),
  updated_at = NOW()
WHERE user_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';

-- Log della correzione
INSERT INTO public.activity_log (
  user_id, activity_type, activity_description, metadata
) VALUES (
  '5d336311-bfc2-40f4-8cd8-3ad17bd246d5',
  'system_fix',
  '🔢 CONTEGGIO CORRETTO: total_conversions allineato ai dati reali (1 conversione)',
  jsonb_build_object(
    'fix_time', now(),
    'old_count', 2,
    'new_count', 1,
    'fix_type', 'conversions_count_fix'
  )
);