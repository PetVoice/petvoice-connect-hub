-- RESET COMPLETO SISTEMA AFFILIAZIONE
-- Mantiene solo l'account giusepperos89@gmail.com

-- 1. Trova il tuo user_id
DO $$
DECLARE
  giuseppe_user_id UUID;
BEGIN
  -- Trova l'ID dell'utente giusepperos89@gmail.com
  SELECT id INTO giuseppe_user_id
  FROM auth.users
  WHERE email = 'giusepperos89@gmail.com';
  
  IF giuseppe_user_id IS NOT NULL THEN
    -- Cancella tutte le commissioni TRANNE quelle di Giuseppe come referrer
    DELETE FROM public.referral_commissions
    WHERE referrer_id != giuseppe_user_id;
    
    -- Cancella tutti i referral TRANNE quelli dove Giuseppe è il referrer
    DELETE FROM public.referrals
    WHERE referrer_id != giuseppe_user_id;
    
    -- Cancella tutte le statistiche referrer TRANNE quelle di Giuseppe
    DELETE FROM public.referrer_stats
    WHERE user_id != giuseppe_user_id;
    
    -- Reset delle statistiche di Giuseppe a zero
    UPDATE public.referrer_stats
    SET 
      total_registrations = 0,
      total_conversions = 0,
      available_credits = 0,
      total_credits_earned = 0,
      updated_at = NOW()
    WHERE user_id = giuseppe_user_id;
    
    -- Log del reset
    INSERT INTO public.activity_log (
      user_id, activity_type, activity_description, metadata
    ) VALUES (
      giuseppe_user_id,
      'affiliation_system_reset',
      '🔄 Sistema affiliazione resettato - Solo Giuseppe mantenuto',
      jsonb_build_object(
        'reset_date', NOW(),
        'maintained_user', 'giusepperos89@gmail.com',
        'action', 'complete_reset'
      )
    );
    
    -- Mostra risultato
    RAISE NOTICE '✅ SISTEMA AFFILIAZIONE RESETTATO';
    RAISE NOTICE '📧 Account mantenuto: giusepperos89@gmail.com';
    RAISE NOTICE '🔢 User ID: %', giuseppe_user_id;
    
  ELSE
    RAISE EXCEPTION '❌ User giusepperos89@gmail.com non trovato!';
  END IF;
END $$;