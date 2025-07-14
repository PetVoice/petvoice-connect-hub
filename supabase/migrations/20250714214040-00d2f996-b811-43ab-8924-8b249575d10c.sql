-- DISABILITA TUTTI I TRIGGER DI REGISTRAZIONE
DROP TRIGGER IF EXISTS on_auth_user_created_simple ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_referral_registration ON auth.users;

-- CREA UN SOLO TRIGGER CHE FA TUTTO
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

  -- 3. Gestisci referral se presente
  ref_code := NEW.raw_user_meta_data ->> 'referral_code';
  
  IF ref_code IS NOT NULL AND ref_code != '' THEN
    -- Trova il referrer
    SELECT user_id INTO referrer_user_id
    FROM public.user_referrals
    WHERE referral_code = ref_code;
    
    -- Se trovato, crea il record referral
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
        0.05
      )
      ON CONFLICT DO NOTHING;
      
      -- Aggiorna stats referrer
      UPDATE public.user_referrals 
      SET 
        total_referrals = total_referrals + 1,
        successful_conversions = successful_conversions + 1,
        total_credits_earned = total_credits_earned + 0.05,
        updated_at = NOW()
      WHERE user_id = referrer_user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- CREA IL TRIGGER UNICO
CREATE TRIGGER on_complete_user_registration
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_complete_user_registration();