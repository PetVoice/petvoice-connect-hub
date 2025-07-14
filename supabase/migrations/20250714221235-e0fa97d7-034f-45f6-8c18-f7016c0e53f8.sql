-- Aggiorna la funzione per gestire automaticamente le registrazioni referral
CREATE OR REPLACE FUNCTION public.handle_referral_registration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  ref_code TEXT;
  referrer_user_id UUID;
  referrer_profile RECORD;
  referrer_email TEXT;
  referrer_name TEXT;
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
      -- Get referrer profile info for email
      SELECT 
        u.email,
        p.display_name
      INTO referrer_email, referrer_name
      FROM auth.users u
      LEFT JOIN public.profiles p ON u.id = p.user_id
      WHERE u.id = referrer_user_id;
      
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
      )
      ON CONFLICT (referrer_id, referred_email) DO UPDATE SET
        referred_user_id = NEW.id,
        status = 'registered',
        updated_at = now();
      
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
$function$;

-- Rimuovi il trigger esistente se presente
DROP TRIGGER IF EXISTS on_auth_user_referral_registration ON auth.users;

-- Crea il trigger per gestire automaticamente le registrazioni
CREATE TRIGGER on_auth_user_referral_registration
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_referral_registration();