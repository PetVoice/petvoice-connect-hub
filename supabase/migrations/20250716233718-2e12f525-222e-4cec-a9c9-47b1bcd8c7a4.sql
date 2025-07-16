-- Clean up old cron jobs and functions that reference non-existent tables
SELECT cron.unschedule('convert-pending-referrals-every-minute');
SELECT cron.unschedule('convert-pending-referrals-every-30s');

-- Drop the non-existent function that's being called
DROP FUNCTION IF EXISTS public.simple_convert_all_pending();

-- Update any remaining references in the user registration trigger
CREATE OR REPLACE FUNCTION public.handle_complete_user_registration()
RETURNS trigger
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
    -- Trova il referrer from referrer_stats (not user_referrals)
    SELECT user_id INTO referrer_user_id
    FROM public.referrer_stats
    WHERE referral_code = ref_code;
    
    -- Se trovato, crea il record referral con stato REGISTERED
    IF referrer_user_id IS NOT NULL THEN
      INSERT INTO public.referrals (
        referrer_id,
        referred_email,
        referred_user_id,
        referral_code,
        status,
        created_at
      ) VALUES (
        referrer_user_id,
        NEW.email,
        NEW.id,
        ref_code,
        'registered',
        NOW()
      )
      ON CONFLICT DO NOTHING;
      
      -- Aggiorna SOLO total_registrations in referrer_stats
      UPDATE public.referrer_stats 
      SET 
        total_registrations = total_registrations + 1,
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

-- Ensure the trigger exists and points to the correct function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_complete_user_registration();