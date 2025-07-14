-- Fix del conflitto di nomi nella funzione
CREATE OR REPLACE FUNCTION public.handle_complete_user_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  ref_code TEXT;
  referrer_user_id UUID;
  referrer_conversions INTEGER;
  tier_commission NUMERIC;
  credit_amount NUMERIC;
  calculated_tier TEXT;
  subscription_amount NUMERIC := 0.97; -- Monthly subscription amount
BEGIN
  -- 1. Crea profilo
  INSERT INTO public.profiles (user_id, display_name, language, theme)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'language', 'it'),
    COALESCE(NEW.raw_user_meta_data->>'theme', 'light')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
    updated_at = NOW();

  -- 2. Crea abbonamento
  INSERT INTO public.subscribers (
    user_id,
    subscription_plan,
    subscription_status,
    trial_used,
    max_pets_allowed
  ) VALUES (
    NEW.id,
    'premium',
    'active',
    FALSE,
    999
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- 3. Gestisci referral se presente
  ref_code := NEW.raw_user_meta_data ->> 'referral_code';
  
  IF ref_code IS NOT NULL AND ref_code != '' THEN
    -- Trova il referrer
    SELECT user_id INTO referrer_user_id
    FROM public.user_referrals
    WHERE referral_code = ref_code;
    
    -- Se trovato, calcola commissione e crea il record referral
    IF referrer_user_id IS NOT NULL THEN
      -- Ottieni il numero di conversioni correnti del referrer
      SELECT successful_conversions INTO referrer_conversions
      FROM public.user_referrals
      WHERE user_id = referrer_user_id;
      
      -- Calcola il tier e la commissione basata sulle conversioni correnti
      IF referrer_conversions >= 50 THEN
        calculated_tier := 'Platino';
        tier_commission := 0.20;
      ELSIF referrer_conversions >= 20 THEN
        calculated_tier := 'Oro';
        tier_commission := 0.15;
      ELSIF referrer_conversions >= 5 THEN
        calculated_tier := 'Argento';
        tier_commission := 0.10;
      ELSE
        calculated_tier := 'Bronzo';
        tier_commission := 0.05;
      END IF;
      
      -- Calcola credito
      credit_amount := subscription_amount * tier_commission;
      
      INSERT INTO public.referrals (
        referrer_id,
        referred_email,
        referred_user_id,
        referral_code,
        status,
        channel,
        utm_source,
        utm_medium,
        utm_campaign,
        conversion_date,
        credits_awarded
      ) VALUES (
        referrer_user_id,
        NEW.email,
        NEW.id,
        ref_code,
        'converted',
        'manual_code',
        'referral',
        'manual',
        'friend_referral',
        NOW(),
        credit_amount
      );
      
      -- Aggiorna stats referrer
      UPDATE public.user_referrals 
      SET 
        total_referrals = total_referrals + 1,
        successful_conversions = successful_conversions + 1,
        total_credits_earned = total_credits_earned + credit_amount,
        current_tier = calculated_tier,
        updated_at = NOW()
      WHERE user_id = referrer_user_id;
      
      -- Crea credito per il referrer
      INSERT INTO public.referral_credits (
        user_id,
        referral_id,
        amount,
        credit_type,
        description,
        status,
        expires_at
      ) VALUES (
        referrer_user_id,
        (SELECT id FROM public.referrals WHERE referrer_id = referrer_user_id AND referred_email = NEW.email ORDER BY created_at DESC LIMIT 1),
        credit_amount,
        'referral_conversion',
        'Credito per conversione referral: ' || NEW.email || ' (tier ' || calculated_tier || ' ' || (tier_commission * 100)::INTEGER || '%)',
        'active',
        NOW() + INTERVAL '24 months'
      );
      
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;