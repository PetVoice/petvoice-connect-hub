-- ═══════════════════════════════════════════════════════════════
-- 🔄 AGGIORNA SISTEMA PER INCLUDERE TUTTE LE REGISTRAZIONI 
-- ═══════════════════════════════════════════════════════════════

-- Abilita realtime per le tabelle principali
ALTER TABLE public.user_referrals REPLICA IDENTITY FULL;
ALTER TABLE public.referrals REPLICA IDENTITY FULL;
ALTER TABLE public.referral_credits REPLICA IDENTITY FULL;

-- Aggiungi le tabelle alla pubblicazione realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_referrals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.referrals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.referral_credits;

-- Migliora la funzione per aggiornare SEMPRE total_referrals (anche solo registered)
CREATE OR REPLACE FUNCTION public.update_all_referral_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_users INTEGER := 0;
  result_data jsonb;
BEGIN
  RAISE NOTICE 'Updating all referral stats at %', now();
  
  -- Aggiorna statistiche per TUTTI i referrer (anche quelli con solo "registered")
  INSERT INTO public.user_referrals (
    user_id, 
    referral_code, 
    total_referrals, 
    successful_conversions, 
    total_credits_earned, 
    current_tier
  )
  SELECT 
    r.referrer_id,
    COALESCE(
      (SELECT referral_code FROM public.user_referrals WHERE user_id = r.referrer_id),
      'REF_' || LEFT(r.referrer_id::text, 8)
    ),
    COUNT(*) as total_refs,
    COUNT(*) FILTER (WHERE r.status = 'converted') as conversions,
    COALESCE(
      (SELECT SUM(amount) FROM public.referral_credits WHERE user_id = r.referrer_id), 
      0
    ) as credits,
    CASE 
      WHEN COUNT(*) FILTER (WHERE r.status = 'converted') >= 20 THEN 'Platino'
      WHEN COUNT(*) FILTER (WHERE r.status = 'converted') >= 10 THEN 'Oro' 
      WHEN COUNT(*) FILTER (WHERE r.status = 'converted') >= 5 THEN 'Argento'
      ELSE 'Bronzo'
    END as tier
  FROM public.referrals r
  GROUP BY r.referrer_id
  ON CONFLICT (user_id) DO UPDATE SET
    total_referrals = EXCLUDED.total_referrals,
    successful_conversions = EXCLUDED.successful_conversions,
    total_credits_earned = EXCLUDED.total_credits_earned,
    current_tier = EXCLUDED.current_tier,
    updated_at = now();
  
  GET DIAGNOSTICS updated_users = ROW_COUNT;
  
  result_data := jsonb_build_object(
    'success', true,
    'updated_users', updated_users,
    'processed_at', now(),
    'message', 'Aggiornate statistiche per ' || updated_users || ' utenti'
  );
  
  RAISE NOTICE 'Stats update completed: %', result_data;
  RETURN result_data;
END;
$$;

-- Aggiorna il cron job per chiamare ENTRAMBE le funzioni ogni 2 minuti
SELECT cron.unschedule('auto-referral-converter');
SELECT cron.schedule(
  'complete-referral-processor',
  '*/2 * * * *',
  $$
  SELECT auto_convert_pending_referrals();
  SELECT update_all_referral_stats();
  $$
);

-- Esegui subito l'aggiornamento completo
SELECT update_all_referral_stats();