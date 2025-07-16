-- STEP 1: Crea funzione semplice e veloce
CREATE OR REPLACE FUNCTION public.simple_convert_all_pending()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  converted INTEGER := 0;
  rec RECORD;
  user_email TEXT;
  commission_amount NUMERIC := 0.0485;
BEGIN
  -- Trova TUTTI gli utenti attivi con referral "registered"
  FOR rec IN 
    SELECT DISTINCT 
      s.user_id,
      s.email as subscriber_email,
      s.subscription_status
    FROM public.subscribers s
    WHERE s.subscription_status = 'active'
  LOOP
    
    -- Ottieni email vera da auth.users
    SELECT email INTO user_email FROM auth.users WHERE id = rec.user_id;
    
    -- Converte TUTTI i referral "registered" per questo utente
    UPDATE public.referrals 
    SET 
      status = 'converted',
      conversion_date = now(),
      referred_user_id = rec.user_id,
      credits_awarded = commission_amount,
      updated_at = now()
    WHERE status = 'registered'
      AND (
        referred_user_id = rec.user_id OR 
        referred_email = user_email OR
        referred_email = rec.subscriber_email
      );
    
    -- Se ha convertito qualcosa, aggiorna statistiche
    IF FOUND THEN
      converted := converted + 1;
      
      -- Aggiorna statistiche per OGNI referrer
      INSERT INTO public.user_referrals (
        user_id, referral_code, total_referrals, successful_conversions, 
        total_credits_earned, current_tier
      )
      SELECT DISTINCT
        r.referrer_id,
        r.referral_code,
        1, 1, commission_amount, 'Bronzo'
      FROM public.referrals r
      WHERE r.status = 'converted' 
        AND (r.referred_user_id = rec.user_id OR r.referred_email = user_email)
      ON CONFLICT (user_id) DO UPDATE SET
        successful_conversions = user_referrals.successful_conversions + 1,
        total_credits_earned = user_referrals.total_credits_earned + commission_amount,
        updated_at = now();
      
      -- Crea crediti per OGNI referrer
      INSERT INTO public.referral_credits (
        user_id, referral_id, amount, credit_type, description, status, expires_at
      )
      SELECT DISTINCT
        r.referrer_id,
        r.id,
        commission_amount,
        'auto_conversion',
        'Conversione automatica: ' || COALESCE(user_email, rec.user_id::text),
        'active',
        now() + interval '24 months'
      FROM public.referrals r
      WHERE r.status = 'converted' 
        AND (r.referred_user_id = rec.user_id OR r.referred_email = user_email)
        AND NOT EXISTS (
          SELECT 1 FROM public.referral_credits 
          WHERE referral_id = r.id
        );
    END IF;
    
  END LOOP;
  
  RETURN jsonb_build_object('converted_count', converted, 'message', 'Converted ' || converted || ' referrals automatically');
END;
$function$;

-- STEP 2: Rimuovi tutti i job esistenti 
DO $$
DECLARE
    job_rec RECORD;
BEGIN
    FOR job_rec IN SELECT jobname FROM cron.job WHERE jobname LIKE '%referral%'
    LOOP
        PERFORM cron.unschedule(job_rec.jobname);
    END LOOP;
END $$;

-- STEP 3: Job principale che gira ogni minuto
SELECT cron.schedule(
  'ultra-fast-referral-check',
  '* * * * *',  -- Ogni minuto
  'SELECT public.simple_convert_all_pending();'
);

-- STEP 4: Job sfasato che gira 30 secondi dopo
SELECT cron.schedule(
  'ultra-fast-referral-check-delayed',
  '* * * * *',  -- Ogni minuto
  'SELECT pg_sleep(30); SELECT public.simple_convert_all_pending();'
);

-- STEP 5: Test immediato
SELECT public.simple_convert_all_pending();