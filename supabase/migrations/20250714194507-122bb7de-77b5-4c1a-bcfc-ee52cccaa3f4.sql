-- Migliorare la funzione handle_referral_conversion
CREATE OR REPLACE FUNCTION public.handle_referral_conversion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  referral_record RECORD;
  referrer_profile RECORD;
  tier_commission NUMERIC;
  credit_amount NUMERIC;
  subscription_amount NUMERIC := 0.97; -- Monthly subscription amount
BEGIN
  -- Solo processare quando subscription diventa attiva
  IF NEW.subscribed = true THEN
    -- Cercare referral record per questo utente (sia via user_id che email)
    SELECT * INTO referral_record
    FROM public.referrals
    WHERE (referred_user_id = NEW.user_id OR referred_email = NEW.email)
      AND status = 'registered'
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF referral_record IS NOT NULL THEN
      -- Ottenere profilo referrer per determinare tier commission
      SELECT * INTO referrer_profile
      FROM public.user_referrals
      WHERE user_id = referral_record.referrer_id;
      
      IF referrer_profile IS NOT NULL THEN
        -- Determinare commissione basata sul tier
        CASE referrer_profile.current_tier
          WHEN 'Bronzo' THEN tier_commission := 0.05;
          WHEN 'Argento' THEN tier_commission := 0.10;
          WHEN 'Oro' THEN tier_commission := 0.15;
          WHEN 'Platino' THEN tier_commission := 0.20;
          ELSE tier_commission := 0.05; -- Default to Bronze
        END CASE;
        
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
            'tier', referrer_profile.current_tier
          )
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;