-- ═══════════════════════════════════════════════════════════════
-- 🚀 SISTEMA AUTOMATICO DI CONVERSIONE REFERRAL - POLLING OGNI 2 MINUTI
-- ═══════════════════════════════════════════════════════════════

-- STEP 1: Funzione principale che converte automaticamente tutti i referral pendenti
CREATE OR REPLACE FUNCTION public.auto_convert_pending_referrals()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  converted_count INTEGER := 0;
  credits_created INTEGER := 0;
  result_data jsonb;
  referrer_record RECORD;
  tier_info jsonb;
  commission_rate NUMERIC;
  commission_amount NUMERIC;
  subscription_amount NUMERIC := 0.97;
BEGIN
  -- Log inizio processamento
  RAISE NOTICE 'Auto-converter started at %', now();
  
  -- STEP A: Converte tutti i referral "registered" con utenti attivi
  WITH conversions AS (
    UPDATE public.referrals r
    SET 
      status = 'converted',
      conversion_date = now(),
      updated_at = now()
    FROM public.subscribers s
    WHERE r.status = 'registered'
      AND s.subscription_status = 'active'
      AND (r.referred_user_id = s.user_id OR r.referred_email = s.email)
    RETURNING r.*
  )
  SELECT COUNT(*) INTO converted_count FROM conversions;
  
  RAISE NOTICE 'Converted % referrals from registered to converted', converted_count;
  
  -- STEP B: Per ogni referrer con nuove conversioni, aggiorna stats
  FOR referrer_record IN 
    SELECT DISTINCT r.referrer_id
    FROM public.referrals r
    WHERE r.status = 'converted'
      AND r.conversion_date > now() - interval '5 minutes'
  LOOP
    -- Aggiorna/crea user_referrals
    INSERT INTO public.user_referrals (
      user_id, 
      referral_code, 
      total_referrals, 
      successful_conversions, 
      total_credits_earned, 
      current_tier
    )
    VALUES (
      referrer_record.referrer_id,
      'REF_' || LEFT(referrer_record.referrer_id::text, 8),
      (SELECT COUNT(*) FROM public.referrals WHERE referrer_id = referrer_record.referrer_id),
      (SELECT COUNT(*) FROM public.referrals WHERE referrer_id = referrer_record.referrer_id AND status = 'converted'),
      0, -- Calcoleremo dopo
      'Bronzo'
    )
    ON CONFLICT (user_id) DO UPDATE SET
      total_referrals = (
        SELECT COUNT(*) FROM public.referrals 
        WHERE referrer_id = referrer_record.referrer_id
      ),
      successful_conversions = (
        SELECT COUNT(*) FROM public.referrals 
        WHERE referrer_id = referrer_record.referrer_id AND status = 'converted'
      ),
      updated_at = now();
    
    -- Calcola tier per questo referrer
    SELECT calculate_referral_tier(
      (SELECT successful_conversions FROM public.user_referrals WHERE user_id = referrer_record.referrer_id)
    ) INTO tier_info;
    
    commission_rate := (tier_info->>'commission')::NUMERIC;
    
    -- Aggiorna tier
    UPDATE public.user_referrals 
    SET 
      current_tier = tier_info->>'tier',
      updated_at = now()
    WHERE user_id = referrer_record.referrer_id;
    
    -- Crea crediti per referral convertiti SENZA crediti esistenti
    INSERT INTO public.referral_credits (
      user_id, 
      referral_id, 
      amount, 
      credit_type, 
      description, 
      status, 
      expires_at
    )
    SELECT 
      r.referrer_id,
      r.id,
      subscription_amount * commission_rate,
      'auto_conversion',
      'Conversione automatica: ' || r.referred_email || ' (' || (tier_info->>'tier') || ' ' || ROUND(commission_rate * 100) || '%)',
      'active',
      now() + interval '24 months'
    FROM public.referrals r
    WHERE r.referrer_id = referrer_record.referrer_id
      AND r.status = 'converted'
      AND NOT EXISTS (
        SELECT 1 FROM public.referral_credits 
        WHERE referral_id = r.id
      );
    
    GET DIAGNOSTICS credits_created = ROW_COUNT;
    
    -- Aggiorna total_credits_earned
    UPDATE public.user_referrals 
    SET total_credits_earned = (
      SELECT COALESCE(SUM(amount), 0) 
      FROM public.referral_credits 
      WHERE user_id = referrer_record.referrer_id
    )
    WHERE user_id = referrer_record.referrer_id;
    
    -- Log attività per questo referrer
    IF credits_created > 0 THEN
      INSERT INTO public.activity_log (
        user_id, 
        activity_type, 
        activity_description, 
        metadata
      ) VALUES (
        referrer_record.referrer_id,
        'auto_referral_conversion',
        'Conversione automatica: ' || credits_created || ' nuovi crediti (+€' || (credits_created * subscription_amount * commission_rate) || ')',
        jsonb_build_object(
          'converted_referrals', credits_created,
          'commission_rate', commission_rate,
          'tier', tier_info->>'tier',
          'total_credits', (subscription_amount * commission_rate * credits_created),
          'processing_time', now(),
          'method', 'auto_polling'
        )
      );
    END IF;
    
  END LOOP;
  
  -- Risultato finale
  result_data := jsonb_build_object(
    'success', true,
    'converted_referrals', converted_count,
    'credits_created', credits_created,
    'processed_at', now(),
    'message', 'Auto-converter: processati ' || converted_count || ' referral, creati ' || credits_created || ' crediti'
  );
  
  RAISE NOTICE 'Auto-converter completed: %', result_data;
  RETURN result_data;
END;
$$;

-- STEP 2: Funzione di emergenza per conversione forzata manuale
CREATE OR REPLACE FUNCTION public.force_convert_all_now()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_json jsonb;
BEGIN
  SELECT auto_convert_pending_referrals() INTO result_json;
  RETURN 'CONVERSIONE FORZATA COMPLETATA! Risultato: ' || (result_json->>'message');
END;
$$;

-- STEP 3: Abilita estensioni necessarie per cron (se non già abilitate)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- STEP 4: Crea il cron job che gira ogni 2 minuti
SELECT cron.schedule(
  'auto-referral-converter',
  '*/2 * * * *', -- Ogni 2 minuti
  $$SELECT auto_convert_pending_referrals();$$
);

-- STEP 5: ESEGUI SUBITO UNA VOLTA per convertire tutti i referral pendenti esistenti
SELECT auto_convert_pending_referrals();