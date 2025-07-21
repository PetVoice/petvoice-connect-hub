-- RESET TOTALE E AGGRESSIVO DEL SISTEMA REFERRAL
-- Elimina TUTTO e mantiene solo giusepperos89@gmail.com

DO $$
DECLARE
  giuseppe_user_id UUID;
BEGIN
  -- Trova l'ID di Giuseppe
  SELECT id INTO giuseppe_user_id
  FROM auth.users
  WHERE email = 'giusepperos89@gmail.com';
  
  IF giuseppe_user_id IS NOT NULL THEN
    
    -- 1. ELIMINA TUTTE LE COMMISSIONI
    DELETE FROM public.referral_commissions WHERE TRUE;
    
    -- 2. ELIMINA TUTTI I REFERRAL
    DELETE FROM public.referrals WHERE TRUE;
    
    -- 3. ELIMINA TUTTE LE STATISTICHE REFERRER TRANNE GIUSEPPE
    DELETE FROM public.referrer_stats WHERE user_id != giuseppe_user_id;
    
    -- 4. RESET COMPLETO DELLE STATISTICHE DI GIUSEPPE
    UPDATE public.referrer_stats
    SET 
      total_registrations = 0,
      total_conversions = 0,
      available_credits = 0.00,
      total_credits_earned = 0.00,
      current_tier = 'Bronzo',
      tier_progress = 0,
      updated_at = NOW()
    WHERE user_id = giuseppe_user_id;
    
    -- 5. ELIMINA TUTTI I LOG REFERRAL
    DELETE FROM public.activity_log 
    WHERE activity_type IN (
      'referral_registered',
      'referral_converted',
      'first_referral_commission',
      'recurring_referral_commission',
      'referral_monthly_credit',
      'referral_cancelled',
      'affiliation_system_reset'
    );
    
    -- 6. LOG FINALE
    INSERT INTO public.activity_log (
      user_id, activity_type, activity_description, metadata
    ) VALUES (
      giuseppe_user_id,
      'system_complete_reset',
      '💀 RESET TOTALE AGGRESSIVO: Sistema referral completamente azzerato',
      jsonb_build_object(
        'reset_time', NOW(),
        'reset_type', 'aggressive_complete_reset',
        'maintained_user', 'giusepperos89@gmail.com'
      )
    );
    
    -- Mostra risultato
    RAISE NOTICE '💀 RESET TOTALE COMPLETATO!';
    RAISE NOTICE '📧 Account mantenuto: giusepperos89@gmail.com';
    RAISE NOTICE '🔥 TUTTO CANCELLATO - Sistema completamente azzerato';
    
  ELSE
    RAISE EXCEPTION '❌ User giusepperos89@gmail.com non trovato!';
  END IF;
END $$;