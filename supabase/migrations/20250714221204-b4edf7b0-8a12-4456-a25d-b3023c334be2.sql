-- Crea la funzione aggiornata per gestire automaticamente le conversioni referral
CREATE OR REPLACE FUNCTION public.handle_referral_conversion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  referral_record RECORD;
  referrer_profile RECORD;
  tier_commission NUMERIC;
  credit_amount NUMERIC;
  subscription_amount NUMERIC := 0.97; -- Monthly subscription amount
BEGIN
  -- Solo processare quando subscription diventa attiva
  IF NEW.subscription_status = 'active' AND (OLD.subscription_status IS NULL OR OLD.subscription_status != 'active') THEN
    -- Cercare referral record per questo utente
    SELECT * INTO referral_record
    FROM public.referrals
    WHERE referred_user_id = NEW.user_id
      AND status = 'registered'
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Se non trovato, provare con email
    IF referral_record IS NULL THEN
      SELECT u.email INTO referral_record.referred_email
      FROM auth.users u
      WHERE u.id = NEW.user_id;
      
      IF referral_record.referred_email IS NOT NULL THEN
        SELECT * INTO referral_record
        FROM public.referrals
        WHERE referred_email = referral_record.referred_email
          AND status = 'registered'
        ORDER BY created_at DESC
        LIMIT 1;
      END IF;
    END IF;
    
    IF referral_record IS NOT NULL THEN
      -- Ottenere profilo referrer per determinare tier commission
      SELECT * INTO referrer_profile
      FROM public.user_referrals
      WHERE user_id = referral_record.referrer_id;
      
      IF referrer_profile IS NOT NULL THEN
        -- Calcolare il tier corretto basato sulle conversioni attuali
        DECLARE
          current_conversions INTEGER;
          current_tier TEXT;
        BEGIN
          current_conversions := referrer_profile.successful_conversions;
          
          IF current_conversions >= 50 THEN
            current_tier := 'Platino';
            tier_commission := 0.20;
          ELSIF current_conversions >= 20 THEN
            current_tier := 'Oro';
            tier_commission := 0.15;
          ELSIF current_conversions >= 5 THEN
            current_tier := 'Argento';
            tier_commission := 0.10;
          ELSE
            current_tier := 'Bronzo';
            tier_commission := 0.05;
          END IF;
        END;
        
        -- Calcolare credito
        credit_amount := subscription_amount * tier_commission;
        
        -- Aggiornare referral status e crediti
        UPDATE public.referrals 
        SET 
          status = 'converted',
          conversion_date = now(),
          credits_awarded = credit_amount,
          updated_at = now()
        WHERE id = referral_record.id;
        
        -- Aggiungere crediti al referrer
        INSERT INTO public.referral_credits (
          user_id,
          referral_id,
          amount,
          credit_type,
          description,
          status,
          expires_at
        ) VALUES (
          referrer_profile.user_id,
          referral_record.id,
          credit_amount,
          'referral_conversion',
          'Credito per conversione referral: ' || referral_record.referred_email,
          'active',
          now() + interval '24 months'
        );
        
        -- Aggiornare statistiche referrer
        UPDATE public.user_referrals 
        SET 
          successful_conversions = successful_conversions + 1,
          total_credits_earned = total_credits_earned + credit_amount,
          current_tier = current_tier,
          updated_at = now()
        WHERE user_id = referrer_profile.user_id;
        
        -- Log conversione
        INSERT INTO public.activity_log (
          user_id,
          activity_type,
          activity_description,
          metadata
        ) VALUES (
          referrer_profile.user_id,
          'referral_converted',
          'Referral convertito: ' || referral_record.referred_email || ' (+€' || credit_amount || ')',
          jsonb_build_object(
            'referred_email', referral_record.referred_email,
            'referred_user_id', referral_record.referred_user_id,
            'credit_amount', credit_amount,
            'tier_commission', tier_commission,
            'tier', current_tier
          )
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Rimuovi il trigger esistente se presente
DROP TRIGGER IF EXISTS handle_referral_conversion_trigger ON public.subscribers;

-- Crea il trigger per gestire automaticamente le conversioni
CREATE TRIGGER handle_referral_conversion_trigger
  AFTER INSERT OR UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_referral_conversion();