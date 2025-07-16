-- Aggiorna il trigger per gestire correttamente i referral automatici
-- Imposta status 'registered' invece di 'converted' per nuove registrazioni

CREATE OR REPLACE FUNCTION public.handle_complete_user_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  ref_code TEXT;
  referrer_user_id UUID;
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

  -- 3. Gestisci referral se presente - STATO REGISTERED
  ref_code := NEW.raw_user_meta_data ->> 'referral_code';
  
  IF ref_code IS NOT NULL AND ref_code != '' THEN
    -- Trova il referrer
    SELECT user_id INTO referrer_user_id
    FROM public.user_referrals
    WHERE referral_code = ref_code;
    
    -- Se trovato, crea il record referral con stato REGISTERED
    IF referrer_user_id IS NOT NULL THEN
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
        created_at
      ) VALUES (
        referrer_user_id,
        NEW.email,
        NEW.id,
        ref_code,
        'registered', -- STATO REGISTERED, non converted
        'manual_code',
        'referral',
        'manual',
        'friend_referral',
        NOW()
      )
      ON CONFLICT DO NOTHING;
      
      -- Aggiorna SOLO total_referrals, non successful_conversions
      UPDATE public.user_referrals 
      SET 
        total_referrals = total_referrals + 1,
        updated_at = NOW()
      WHERE user_id = referrer_user_id;
      
      -- Log registrazione referral
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
          'status', 'registered'
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;