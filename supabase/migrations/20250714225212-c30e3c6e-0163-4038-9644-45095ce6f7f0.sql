-- Fix the subscription status constraint and user registration
-- First, add 'pending' to allowed subscription statuses
ALTER TABLE public.subscribers DROP CONSTRAINT valid_subscription_status;
ALTER TABLE public.subscribers ADD CONSTRAINT valid_subscription_status 
CHECK (subscription_status = ANY (ARRAY['active'::text, 'cancelled'::text, 'pending_cancellation'::text, 'pending'::text]));

-- Update the registration function to use 'active' by default but handle referrals correctly
CREATE OR REPLACE FUNCTION public.handle_user_registration_only()
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

  -- 2. Crea abbonamento attivo (per far funzionare l'app)
  INSERT INTO public.subscribers (
    user_id,
    subscription_plan,
    subscription_status,
    trial_used,
    max_pets_allowed
  ) VALUES (
    NEW.id,
    'premium',
    'active', -- Torna ad active per evitare problemi
    FALSE,
    999
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- 3. Gestisci referral senza dare crediti subito
  ref_code := NEW.raw_user_meta_data ->> 'referral_code';
  
  IF ref_code IS NOT NULL AND ref_code != '' THEN
    -- Trova il referrer
    SELECT user_id INTO referrer_user_id
    FROM public.user_referrals
    WHERE referral_code = ref_code;
    
    -- Se trovato, crea il record referral ma marca come "registered" non "converted"
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
        utm_campaign
      ) VALUES (
        referrer_user_id,
        NEW.email,
        NEW.id,
        ref_code,
        'registered', -- Solo registrato, non convertito
        'manual_code',
        'referral',
        'manual',
        'friend_referral'
      );
      
      -- Aggiorna solo il contatore registrazioni (non conversioni o crediti)
      UPDATE public.user_referrals 
      SET 
        total_referrals = total_referrals + 1,
        updated_at = NOW()
      WHERE user_id = referrer_user_id;
      
      -- Log la registrazione senza crediti
      INSERT INTO public.activity_log (
        user_id,
        activity_type,
        activity_description,
        metadata
      ) VALUES (
        referrer_user_id,
        'referral_registered',
        'Nuovo referral registrato (senza crediti): ' || NEW.email,
        jsonb_build_object(
          'referred_email', NEW.email,
          'referred_user_id', NEW.id,
          'referral_code', ref_code,
          'note', 'Credits will be awarded on first payment'
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;