-- Create function to handle referral registration
CREATE OR REPLACE FUNCTION public.handle_referral_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  ref_code TEXT;
  referrer_user_id UUID;
  referrer_profile RECORD;
  tier_commission NUMERIC;
BEGIN
  -- Get referral code from user metadata
  ref_code := NEW.raw_user_meta_data ->> 'referral_code';
  
  -- Only process if referral code is present
  IF ref_code IS NOT NULL AND ref_code != '' THEN
    -- Find the referrer by code
    SELECT user_id INTO referrer_user_id
    FROM public.user_referrals
    WHERE referral_code = ref_code;
    
    -- If referrer found, create referral record
    IF referrer_user_id IS NOT NULL THEN
      -- Insert referral record
      INSERT INTO public.referrals (
        referrer_id,
        referred_email,
        referred_user_id,
        referral_code,
        status,
        channel,
        utm_source,
        utm_medium,
        utm_campaign
      ) VALUES (
        referrer_user_id,
        NEW.email,
        NEW.id,
        ref_code,
        'registered',
        'manual_code',
        'referral',
        'manual',
        'friend_referral'
      );
      
      -- Update referrer stats
      UPDATE public.user_referrals 
      SET 
        total_referrals = total_referrals + 1,
        updated_at = now()
      WHERE user_id = referrer_user_id;
      
      -- Log the referral registration
      INSERT INTO public.activity_log (
        user_id,
        activity_type,
        activity_description,
        metadata
      ) VALUES (
        referrer_user_id,
        'referral_registered',
        'Nuovo referral registrato: ' || NEW.email,
        jsonb_build_object(
          'referred_email', NEW.email,
          'referred_user_id', NEW.id,
          'referral_code', ref_code,
          'registration_method', 'manual_code'
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for referral registration
DROP TRIGGER IF EXISTS on_user_referral_registration ON auth.users;
CREATE TRIGGER on_user_referral_registration
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_referral_registration();

-- Create function to handle referral conversion when user subscribes
CREATE OR REPLACE FUNCTION public.handle_referral_conversion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  referral_record RECORD;
  referrer_profile RECORD;
  tier_commission NUMERIC;
  credit_amount NUMERIC;
  subscription_amount NUMERIC := 0.97; -- Monthly subscription amount
BEGIN
  -- Only process when subscription becomes active
  IF NEW.subscribed = true AND (OLD.subscribed IS NULL OR OLD.subscribed = false) THEN
    -- Find referral record for this user
    SELECT * INTO referral_record
    FROM public.referrals
    WHERE referred_user_id = NEW.user_id
      AND status = 'registered';
    
    IF referral_record IS NOT NULL THEN
      -- Get referrer profile to determine tier commission
      SELECT * INTO referrer_profile
      FROM public.user_referrals
      WHERE user_id = referral_record.referrer_id;
      
      IF referrer_profile IS NOT NULL THEN
        -- Determine commission based on tier
        CASE referrer_profile.current_tier
          WHEN 'Bronzo' THEN tier_commission := 0.05;
          WHEN 'Argento' THEN tier_commission := 0.10;
          WHEN 'Oro' THEN tier_commission := 0.15;
          WHEN 'Platino' THEN tier_commission := 0.20;
          ELSE tier_commission := 0.05; -- Default to Bronze
        END CASE;
        
        -- Calculate credit amount
        credit_amount := subscription_amount * tier_commission;
        
        -- Update referral status and credits
        UPDATE public.referrals 
        SET 
          status = 'converted',
          conversion_date = now(),
          credits_awarded = credit_amount,
          updated_at = now()
        WHERE id = referral_record.id;
        
        -- Award credits to referrer
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
        
        -- Update referrer stats
        UPDATE public.user_referrals 
        SET 
          successful_conversions = successful_conversions + 1,
          total_credits_earned = total_credits_earned + credit_amount,
          updated_at = now()
        WHERE user_id = referrer_profile.user_id;
        
        -- Log the conversion
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

-- Create trigger for referral conversion
DROP TRIGGER IF EXISTS on_referral_conversion ON public.subscribers;
CREATE TRIGGER on_referral_conversion
  AFTER UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_referral_conversion();