-- Fix del trigger separando INSERT e UPDATE
DROP TRIGGER IF EXISTS on_referral_payment ON public.subscribers;

CREATE OR REPLACE FUNCTION public.process_first_referral_conversion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  referral_record RECORD;
  tier_info jsonb;
  commission_rate NUMERIC;
  commission_amount NUMERIC;
  subscription_amount NUMERIC := 0.97;
  was_inactive BOOLEAN := FALSE;
BEGIN
  -- Determina se è una prima attivazione
  IF TG_OP = 'INSERT' THEN
    was_inactive := (NEW.subscription_status = 'active');
  ELSIF TG_OP = 'UPDATE' THEN
    was_inactive := (NEW.subscription_status = 'active' AND OLD.subscription_status != 'active');
  END IF;
  
  -- Solo se è una prima attivazione
  IF was_inactive THEN
    
    -- Trova referral "registered" per questo utente - CERCA PER USER_ID E EMAIL
    SELECT * INTO referral_record
    FROM public.referrals 
    WHERE status = 'registered'
      AND (referred_user_id = NEW.user_id OR 
           (NEW.email IS NOT NULL AND referred_email = NEW.email))
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF referral_record.id IS NOT NULL THEN
      
      -- CONVERTE il referral
      UPDATE public.referrals 
      SET 
        status = 'converted',
        conversion_date = now(),
        referred_user_id = NEW.user_id,
        credits_awarded = subscription_amount * 0.05,
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
$function$;

-- Ricrea il trigger per INSERT e UPDATE
CREATE TRIGGER on_referral_payment
  AFTER INSERT OR UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.process_first_referral_conversion();

-- Trigger manuale per convertire Rosa
UPDATE public.subscribers 
SET subscription_status = 'inactive'
WHERE user_id = '02dc942d-0c90-4389-88c3-82690560c798';

UPDATE public.subscribers 
SET subscription_status = 'active'  
WHERE user_id = '02dc942d-0c90-4389-88c3-82690560c798';