-- FIX: La funzione deve convertire SOLO utenti che hanno VERAMENTE pagato
CREATE OR REPLACE FUNCTION public.simple_convert_all_pending()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  converted INTEGER := 0;
  rec RECORD;
  user_email TEXT;
  referrer_tier TEXT;
  commission_amount NUMERIC;
BEGIN
  -- Trova SOLO gli utenti attivi che hanno VERAMENTE pagato (con stripe_customer_id)
  FOR rec IN 
    SELECT DISTINCT 
      s.user_id,
      s.email as subscriber_email,
      s.subscription_status
    FROM public.subscribers s
    WHERE s.subscription_status = 'active'
      AND s.stripe_customer_id IS NOT NULL  -- VERIFICA PAGAMENTO REALE
  LOOP
    
    -- Ottieni email vera da auth.users
    SELECT email INTO user_email FROM auth.users WHERE id = rec.user_id;
    
    -- Converte TUTTI i referral "registered" per questo utente
    UPDATE public.referrals 
    SET 
      status = 'converted',
      conversion_date = now(),
      referred_user_id = rec.user_id,
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
      
      -- Per ogni referral convertito, calcola commissione basata sul tier
      FOR rec IN 
        SELECT DISTINCT r.referrer_id, r.id as referral_id, r.referral_code, ur.successful_conversions
        FROM public.referrals r
        LEFT JOIN public.user_referrals ur ON r.referrer_id = ur.user_id
        WHERE r.status = 'converted' 
          AND (r.referred_user_id = rec.user_id OR r.referred_email = user_email)
          AND r.credits_awarded IS NULL
      LOOP
        
        -- Calcola tier e commissione dinamicamente
        IF rec.successful_conversions >= 20 THEN
          referrer_tier := 'Platino';
          commission_amount := 0.20 * 0.97; -- 20% di €0.97
        ELSIF rec.successful_conversions >= 10 THEN
          referrer_tier := 'Oro';
          commission_amount := 0.15 * 0.97; -- 15% di €0.97
        ELSIF rec.successful_conversions >= 5 THEN
          referrer_tier := 'Argento';
          commission_amount := 0.10 * 0.97; -- 10% di €0.97
        ELSE
          referrer_tier := 'Bronzo';
          commission_amount := 0.05 * 0.97; -- 5% di €0.97
        END IF;
        
        -- Aggiorna il referral con la commissione corretta
        UPDATE public.referrals 
        SET credits_awarded = commission_amount
        WHERE id = rec.referral_id;
        
        -- Aggiorna statistiche referrer
        INSERT INTO public.user_referrals (
          user_id, referral_code, total_referrals, successful_conversions, 
          total_credits_earned, current_tier
        ) VALUES (
          rec.referrer_id, rec.referral_code, 1, 1, commission_amount, referrer_tier
        )
        ON CONFLICT (user_id) DO UPDATE SET
          successful_conversions = user_referrals.successful_conversions + 1,
          total_credits_earned = user_referrals.total_credits_earned + commission_amount,
          current_tier = referrer_tier,
          updated_at = now();
        
        -- Crea credito con commissione corretta
        INSERT INTO public.referral_credits (
          user_id, referral_id, amount, credit_type, description, status, expires_at
        ) VALUES (
          rec.referrer_id, rec.referral_id, commission_amount, 'auto_conversion',
          'Conversione automatica (' || referrer_tier || ' ' || ROUND((commission_amount/0.97)*100) || '%): ' || COALESCE(user_email, rec.user_id::text),
          'active', now() + interval '24 months'
        ) ON CONFLICT (referral_id) DO NOTHING;
        
      END LOOP;
    END IF;
    
  END LOOP;
  
  -- REVOCA conversioni per utenti senza stripe_customer_id (non hanno pagato)
  UPDATE public.referrals r
  SET 
    status = 'registered',
    conversion_date = NULL,
    credits_awarded = NULL,
    updated_at = now()
  WHERE r.status = 'converted'
    AND EXISTS (
      SELECT 1 FROM public.subscribers s 
      WHERE s.user_id = r.referred_user_id 
        AND s.stripe_customer_id IS NULL
    );
  
  -- Rimuovi crediti per referral revocati
  DELETE FROM public.referral_credits rc
  WHERE rc.referral_id IN (
    SELECT r.id FROM public.referrals r
    JOIN public.subscribers s ON s.user_id = r.referred_user_id
    WHERE r.status = 'registered' AND s.stripe_customer_id IS NULL
  );
  
  RETURN jsonb_build_object(
    'converted_count', converted, 
    'message', 'Converted ' || converted || ' PAID referrals with dynamic commission'
  );
END;
$function$;