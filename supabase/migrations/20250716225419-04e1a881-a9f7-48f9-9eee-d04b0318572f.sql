-- 🚨 SOLUZIONE DEFINITIVA REFERRAL - SISTEMA BULLETPROOF 🚨

-- STEP 1: Elimina tutti i trigger esistenti (sono rotti)
DROP TRIGGER IF EXISTS on_referral_payment ON public.subscribers;
DROP TRIGGER IF EXISTS first_referral_conversion_trigger ON public.subscribers;
DROP TRIGGER IF EXISTS recurring_referral_commission_trigger ON public.subscribers;
DROP TRIGGER IF EXISTS on_first_referral_conversion ON public.subscribers;
DROP TRIGGER IF EXISTS on_recurring_referral_commission ON public.subscribers;
DROP TRIGGER IF EXISTS bulletproof_referral_trigger ON public.subscribers;

-- STEP 2: FUNZIONE SUPER ROBUSTA CHE TROVA SEMPRE IL REFERRAL
CREATE OR REPLACE FUNCTION public.bulletproof_referral_conversion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  referral_record RECORD;
  user_email TEXT;
  commission_amount NUMERIC := 0.0485; -- €0.0485 (5% di €0.97)
BEGIN
  -- Solo quando diventa attivo per la prima volta
  IF NEW.subscription_status = 'active' AND 
     (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND COALESCE(OLD.subscription_status, '') != 'active')) THEN
    
    -- STEP 1: Ottieni email da auth.users (sempre presente)
    SELECT email INTO user_email 
    FROM auth.users 
    WHERE id = NEW.user_id;
    
    -- STEP 2: Aggiorna subscriber con email corretta se mancante
    IF NEW.email IS NULL AND user_email IS NOT NULL THEN
      UPDATE public.subscribers 
      SET email = user_email 
      WHERE user_id = NEW.user_id;
    END IF;
    
    -- STEP 3: Trova referral con TUTTI i metodi possibili
    SELECT * INTO referral_record
    FROM public.referrals 
    WHERE status = 'registered'
      AND (
        referred_user_id = NEW.user_id OR  -- Prima opzione: user_id
        referred_email = user_email OR     -- Seconda opzione: email da auth
        referred_email = NEW.email         -- Terza opzione: email da subscriber
      )
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- STEP 4: Se trova referral, converte TUTTO
    IF referral_record.id IS NOT NULL THEN
      
      -- Log inizio conversione
      INSERT INTO public.activity_log (
        user_id, activity_type, activity_description, metadata
      ) VALUES (
        referral_record.referrer_id,
        'bulletproof_conversion_start',
        'INIZIANDO conversione per: ' || COALESCE(user_email, NEW.user_id::text),
        jsonb_build_object(
          'referral_id', referral_record.id,
          'referred_user_id', NEW.user_id,
          'referred_email', user_email,
          'trigger_type', 'bulletproof'
        )
      );
      
      -- Converte referral
      UPDATE public.referrals 
      SET 
        status = 'converted',
        conversion_date = now(),
        referred_user_id = NEW.user_id,
        credits_awarded = commission_amount,
        updated_at = now()
      WHERE id = referral_record.id;
      
      -- Aggiorna statistiche referrer (UPSERT)
      INSERT INTO public.user_referrals (
        user_id, referral_code, total_referrals, successful_conversions, 
        total_credits_earned, current_tier, created_at, updated_at
      ) VALUES (
        referral_record.referrer_id,
        COALESCE(referral_record.referral_code, 'REF_' || LEFT(referral_record.referrer_id::text, 8)),
        1, 1, commission_amount, 'Bronzo', now(), now()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        successful_conversions = user_referrals.successful_conversions + 1,
        total_credits_earned = user_referrals.total_credits_earned + commission_amount,
        current_tier = CASE 
          WHEN user_referrals.successful_conversions + 1 >= 20 THEN 'Platino'
          WHEN user_referrals.successful_conversions + 1 >= 10 THEN 'Oro'
          WHEN user_referrals.successful_conversions + 1 >= 5 THEN 'Argento'
          ELSE 'Bronzo'
        END,
        updated_at = now();
      
      -- Crea credito (ON CONFLICT DO NOTHING per evitare duplicati)
      INSERT INTO public.referral_credits (
        user_id, referral_id, amount, credit_type, description, status, expires_at, created_at
      ) VALUES (
        referral_record.referrer_id,
        referral_record.id,
        commission_amount,
        'bulletproof_conversion',
        'Conversione automatica BULLETPROOF: ' || COALESCE(user_email, NEW.user_id::text),
        'active',
        now() + interval '24 months',
        now()
      ) ON CONFLICT (referral_id) DO NOTHING;
      
      -- Log successo finale
      INSERT INTO public.activity_log (
        user_id, activity_type, activity_description, metadata
      ) VALUES (
        referral_record.referrer_id,
        'bulletproof_conversion_success',
        '✅ SUCCESSO: Cliente convertito automaticamente +€' || commission_amount,
        jsonb_build_object(
          'referral_id', referral_record.id,
          'referred_user_id', NEW.user_id,
          'referred_email', user_email,
          'commission_amount', commission_amount,
          'method', 'bulletproof_trigger',
          'success', true
        )
      );
      
    ELSE
      -- Log se non trova referral
      INSERT INTO public.activity_log (
        user_id, activity_type, activity_description, metadata
      ) VALUES (
        NEW.user_id,
        'bulletproof_no_referral',
        'Nessun referral registrato trovato per: ' || COALESCE(user_email, NEW.user_id::text),
        jsonb_build_object(
          'user_id', NEW.user_id,
          'user_email', user_email,
          'subscriber_email', NEW.email
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- STEP 3: TRIGGER BULLETPROOF
CREATE TRIGGER bulletproof_referral_trigger
  AFTER INSERT OR UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.bulletproof_referral_conversion();

-- STEP 4: FUNZIONE DI BACKUP CHE GIRA OGNI 5 MINUTI
CREATE OR REPLACE FUNCTION public.convert_missed_referrals()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  missed_record RECORD;
  user_email TEXT;
  commission_amount NUMERIC := 0.0485;
  converted_count INTEGER := 0;
  result_data jsonb;
BEGIN
  
  INSERT INTO public.activity_log (
    user_id, activity_type, activity_description
  ) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    'backup_scan_start',
    '🔄 BACKUP SCAN: Cercando referral persi...'
  );
  
  -- Trova tutti gli utenti attivi con referral non convertiti
  FOR missed_record IN 
    SELECT DISTINCT s.user_id, s.email as subscriber_email
    FROM public.subscribers s
    WHERE s.subscription_status = 'active'
      AND EXISTS (
        SELECT 1 FROM public.referrals r 
        WHERE r.status = 'registered' 
          AND (r.referred_user_id = s.user_id OR r.referred_email = s.email)
      )
  LOOP
    
    -- Ottieni email da auth.users
    SELECT email INTO user_email 
    FROM auth.users 
    WHERE id = missed_record.user_id;
    
    -- Esegui conversione per questo utente
    PERFORM public.bulletproof_referral_conversion_manual(
      missed_record.user_id, 
      COALESCE(missed_record.subscriber_email, user_email)
    );
    
    converted_count := converted_count + 1;
    
  END LOOP;
  
  result_data := jsonb_build_object(
    'success', true,
    'converted_count', converted_count,
    'scan_time', now(),
    'message', 'Backup scan completato: ' || converted_count || ' conversioni'
  );
  
  INSERT INTO public.activity_log (
    user_id, activity_type, activity_description, metadata
  ) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    'backup_scan_complete',
    '✅ BACKUP COMPLETATO: ' || converted_count || ' conversioni trovate',
    result_data
  );
  
  RETURN result_data;
END;
$function$;

-- STEP 5: FUNZIONE HELPER PER CONVERSIONE MANUALE
CREATE OR REPLACE FUNCTION public.bulletproof_referral_conversion_manual(
  p_user_id UUID,
  p_email TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  referral_record RECORD;
  commission_amount NUMERIC := 0.0485;
BEGIN
  -- Trova referral
  SELECT * INTO referral_record
  FROM public.referrals 
  WHERE status = 'registered'
    AND (referred_user_id = p_user_id OR referred_email = p_email)
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF referral_record.id IS NOT NULL THEN
    
    -- Converte
    UPDATE public.referrals 
    SET 
      status = 'converted', 
      conversion_date = now(), 
      referred_user_id = p_user_id, 
      credits_awarded = commission_amount,
      updated_at = now()
    WHERE id = referral_record.id;
    
    -- Statistiche (UPSERT)
    INSERT INTO public.user_referrals (
      user_id, referral_code, total_referrals, successful_conversions, 
      total_credits_earned, current_tier, created_at, updated_at
    )
    VALUES (
      referral_record.referrer_id, 
      COALESCE(referral_record.referral_code, 'REF_' || LEFT(referral_record.referrer_id::text, 8)), 
      1, 1, commission_amount, 'Bronzo', now(), now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      successful_conversions = user_referrals.successful_conversions + 1,
      total_credits_earned = user_referrals.total_credits_earned + commission_amount,
      current_tier = CASE 
        WHEN user_referrals.successful_conversions + 1 >= 20 THEN 'Platino'
        WHEN user_referrals.successful_conversions + 1 >= 10 THEN 'Oro'
        WHEN user_referrals.successful_conversions + 1 >= 5 THEN 'Argento'
        ELSE 'Bronzo'
      END,
      updated_at = now();
    
    -- Credito (evita duplicati)
    INSERT INTO public.referral_credits (
      user_id, referral_id, amount, credit_type, description, status, expires_at, created_at
    )
    VALUES (
      referral_record.referrer_id, 
      referral_record.id, 
      commission_amount, 
      'backup_conversion', 
      '🔄 Conversione backup: ' || p_email, 
      'active', 
      now() + interval '24 months',
      now()
    )
    ON CONFLICT (referral_id) DO NOTHING;
    
    -- Log conversione backup
    INSERT INTO public.activity_log (
      user_id, activity_type, activity_description, metadata
    ) VALUES (
      referral_record.referrer_id,
      'backup_conversion_success',
      '🔄 BACKUP SUCCESS: +€' || commission_amount || ' per ' || p_email,
      jsonb_build_object(
        'referral_id', referral_record.id,
        'referred_user_id', p_user_id,
        'referred_email', p_email,
        'commission_amount', commission_amount,
        'method', 'backup_function'
      )
    );
    
  END IF;
END;
$function$;

-- STEP 6: Aggiorna immediatamente tutti i referral persi esistenti
SELECT public.convert_missed_referrals();