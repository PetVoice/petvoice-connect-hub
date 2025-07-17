-- Funzione per resettare completamente il sistema di affiliazione per i test
CREATE OR REPLACE FUNCTION public.reset_affiliation_system()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  deleted_referrals INTEGER;
  deleted_stats INTEGER;
  deleted_commissions INTEGER;
  result JSONB;
BEGIN
  -- Cancella tutte le commissioni
  DELETE FROM public.referral_commissions;
  GET DIAGNOSTICS deleted_commissions = ROW_COUNT;
  
  -- Cancella tutte le statistiche referrer
  DELETE FROM public.referrer_stats;
  GET DIAGNOSTICS deleted_stats = ROW_COUNT;
  
  -- Cancella tutti i referral
  DELETE FROM public.referrals;
  GET DIAGNOSTICS deleted_referrals = ROW_COUNT;
  
  -- Reset dei codici referral nei profili (opzionale - mantiene i codici ma resetta i contatori)
  UPDATE public.profiles 
  SET referral_count = 0,
      updated_at = NOW()
  WHERE referral_count > 0;
  
  result := jsonb_build_object(
    'success', true,
    'message', 'Sistema di affiliazione resettato completamente',
    'deleted_referrals', deleted_referrals,
    'deleted_stats', deleted_stats,
    'deleted_commissions', deleted_commissions,
    'reset_at', NOW()
  );
  
  RETURN result;
END;
$function$;

-- Funzione di utilità per eseguire il reset (chiama la funzione sopra)
CREATE OR REPLACE FUNCTION public.execute_affiliation_reset()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  result_json jsonb;
BEGIN
  SELECT reset_affiliation_system() INTO result_json;
  RETURN 'RESET COMPLETATO! ' || (result_json->>'message') || 
         ' - Referral cancellati: ' || (result_json->>'deleted_referrals') ||
         ', Stats cancellate: ' || (result_json->>'deleted_stats') ||
         ', Commissioni cancellate: ' || (result_json->>'deleted_commissions');
END;
$function$;