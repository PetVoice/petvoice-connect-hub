-- SISTEMA REFERRAL RICORRENTE PERFETTO!
-- Commissioni mensili + tier dinamici + crediti non prelevabili

-- STEP 1: Aggiungi colonne mancanti per commissioni ricorrenti
ALTER TABLE public.referral_credits 
ADD COLUMN IF NOT EXISTS billing_period_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS billing_period_end TIMESTAMPTZ;

-- STEP 2: Aggiungi colonne mancanti per subscribers
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ;

-- STEP 3: FUNZIONE TIER CORRETTA (Bronzo->Argento->Oro->Platino)
CREATE OR REPLACE FUNCTION calculate_referral_tier(converted_count INTEGER)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
BEGIN
  IF converted_count >= 20 THEN
    RETURN jsonb_build_object('tier', 'Platino', 'commission', 0.20);
  ELSIF converted_count >= 10 THEN
    RETURN jsonb_build_object('tier', 'Oro', 'commission', 0.15);
  ELSIF converted_count >= 5 THEN
    RETURN jsonb_build_object('tier', 'Argento', 'commission', 0.10);
  ELSE
    RETURN jsonb_build_object('tier', 'Bronzo', 'commission', 0.05);
  END IF;
END;
$$;

-- STEP 4: FUNZIONE COMMISSIONI RICORRENTI (ogni mese)
CREATE OR REPLACE FUNCTION process_recurring_referral_commission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  referral_record RECORD;
  tier_info jsonb;
  commission_rate NUMERIC;
  commission_amount NUMERIC;
  subscription_amount NUMERIC := 0.97; -- €0.97 mensile
BEGIN
  -- Solo quando subscription viene rinnovata/pagata (status = active)
  IF NEW.subscription_status = 'active' AND 
     (OLD.subscription_status IS NULL OR OLD.subscription_status != 'active' OR 
      NEW.current_period_end != OLD.current_period_end) THEN
    
    -- Trova referral CONVERTITI per questo utente
    SELECT * INTO referral_record
    FROM public.referrals 
    WHERE status = 'converted'  -- Solo referral già convertiti
      AND (referred_user_id = NEW.user_id OR referred_email = NEW.email)
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF referral_record.id IS NOT NULL THEN
      
      -- Calcola tier attuale del referrer
      SELECT calculate_referral_tier(
        (SELECT COALESCE(successful_conversions, 0) FROM public.user_referrals WHERE user_id = referral_record.referrer_id)
      ) INTO tier_info;
      
      commission_rate := (tier_info->>'commission')::NUMERIC;
      commission_amount := subscription_amount * commission_rate;
      
      -- Crea credito ricorrente
      INSERT INTO public.referral_credits (
        user_id,
        referral_id,
        amount,
        credit_type,
        description,
        status,
        expires_at,
        billing_period_start,
        billing_period_end
      ) VALUES (
        referral_record.referrer_id,
        referral_record.id,
        commission_amount,
        'recurring_commission',
        'Commissione ricorrente per: ' || COALESCE(NEW.email, NEW.user_id::text) || 
        ' (' || (tier_info->>'tier') || ' ' || ROUND(commission_rate * 100) || '%)',
        'active',
        now() + interval '24 months',
        NEW.current_period_start,
        NEW.current_period_end
      );
      
      -- Aggiorna total_credits_earned
      UPDATE public.user_referrals 
      SET 
        total_credits_earned = total_credits_earned + commission_amount,
        current_tier = tier_info->>'tier',
        updated_at = now()
      WHERE user_id = referral_record.referrer_id;
      
      -- Log commissione ricorrente
      INSERT INTO public.activity_log (
        user_id,
        activity_type,
        activity_description,
        metadata
      ) VALUES (
        referral_record.referrer_id,
        'recurring_commission_earned',
        'Commissione ricorrente: +€' || commission_amount || ' (' || (tier_info->>'tier') || ')',
        jsonb_build_object(
          'referral_id', referral_record.id,
          'commission_amount', commission_amount,
          'commission_rate', commission_rate,
          'tier', tier_info->>'tier',
          'referred_user', COALESCE(NEW.email, NEW.user_id::text),
          'billing_period', COALESCE(NEW.current_period_start::text, '') || ' - ' || COALESCE(NEW.current_period_end::text, '')
        )
      );
      
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- STEP 5: FUNZIONE PRIMA CONVERSIONE (separata)
CREATE OR REPLACE FUNCTION process_first_referral_conversion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  referral_record RECORD;
  tier_info jsonb;
  commission_rate NUMERIC;
  commission_amount NUMERIC;
  subscription_amount NUMERIC := 0.97;
BEGIN
  -- Solo al PRIMO pagamento (conversione da registered a converted)
  IF NEW.subscription_status = 'active' AND 
     (OLD.subscription_status IS NULL OR OLD.subscription_status != 'active') THEN
    
    -- Trova referral "registered" per questo utente
    SELECT * INTO referral_record
    FROM public.referrals 
    WHERE status = 'registered'  -- Solo quelli non ancora convertiti
      AND (referred_user_id = NEW.user_id OR referred_email = NEW.email)
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF referral_record.id IS NOT NULL THEN
      
      -- CONVERTE il referral
      UPDATE public.referrals 
      SET 
        status = 'converted',
        conversion_date = now(),
        referred_user_id = NEW.user_id,
        updated_at = now()
      WHERE id = referral_record.id;
      
      -- Aggiorna/crea user_referrals
      INSERT INTO public.user_referrals (
        user_id, referral_code, total_referrals, successful_conversions, 
        total_credits_earned, current_tier
      ) VALUES (
        referral_record.referrer_id,
        COALESCE(referral_record.referral_code, 'REF_' || LEFT(referral_record.referrer_id::text, 8)),
        1, 1, 0, 'Bronzo'
      )
      ON CONFLICT (user_id) DO UPDATE SET
        successful_conversions = user_referrals.successful_conversions + 1,
        updated_at = now();
      
      -- Calcola tier aggiornato
      SELECT calculate_referral_tier(
        (SELECT successful_conversions FROM public.user_referrals WHERE user_id = referral_record.referrer_id)
      ) INTO tier_info;
      
      commission_rate := (tier_info->>'commission')::NUMERIC;
      commission_amount := subscription_amount * commission_rate;
      
      -- Aggiorna tier e prima commissione
      UPDATE public.user_referrals 
      SET 
        current_tier = tier_info->>'tier',
        total_credits_earned = total_credits_earned + commission_amount,
        updated_at = now()
      WHERE user_id = referral_record.referrer_id;
      
      -- Crea primo credito
      INSERT INTO public.referral_credits (
        user_id, referral_id, amount, credit_type, description, status, expires_at
      ) VALUES (
        referral_record.referrer_id,
        referral_record.id,
        commission_amount,
        'first_conversion',
        'Prima conversione: ' || COALESCE(NEW.email, NEW.user_id::text) || 
        ' (' || (tier_info->>'tier') || ' ' || ROUND(commission_rate * 100) || '%)',
        'active',
        now() + interval '24 months'
      );
      
      -- Log conversione
      INSERT INTO public.activity_log (
        user_id, activity_type, activity_description, metadata
      ) VALUES (
        referral_record.referrer_id,
        'referral_first_converted',
        'Cliente convertito: +€' || commission_amount || ' (' || (tier_info->>'tier') || ')',
        jsonb_build_object(
          'referral_id', referral_record.id,
          'commission_amount', commission_amount,
          'commission_rate', commission_rate,
          'tier', tier_info->>'tier',
          'referred_user', COALESCE(NEW.email, NEW.user_id::text)
        )
      );
      
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- STEP 6: APPLICA TRIGGER (ordine importante!)
CREATE TRIGGER first_referral_conversion_trigger
  AFTER UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION process_first_referral_conversion();

CREATE TRIGGER recurring_referral_commission_trigger
  AFTER UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION process_recurring_referral_commission();