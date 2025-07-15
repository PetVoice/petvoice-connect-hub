-- RIMUOVI FORZATAMENTE TUTTI I TRIGGER E FUNZIONI

-- 1. Drop tutti i trigger esistenti sulla tabella auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS on_user_registration ON auth.users CASCADE;
DROP TRIGGER IF EXISTS on_complete_user_registration ON auth.users CASCADE;
DROP TRIGGER IF EXISTS on_user_referral_registration ON auth.users CASCADE;
DROP TRIGGER IF EXISTS on_user_registration_only ON auth.users CASCADE;

-- 2. Drop le funzioni con CASCADE
DROP FUNCTION IF EXISTS public.init_user_subscription() CASCADE;
DROP FUNCTION IF EXISTS public.handle_complete_user_registration() CASCADE;
DROP FUNCTION IF EXISTS public.handle_user_registration_only() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_simple() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_referral_registration() CASCADE;

-- 3. Crea la nuova funzione che NON crea abbonamenti
CREATE OR REPLACE FUNCTION public.handle_new_user_no_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  ref_code TEXT;
  referrer_user_id UUID;
BEGIN
  -- 1. Crea SOLO il profilo
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

  -- 2. Gestisci referral se presente (solo registrazione, no crediti)
  ref_code := NEW.raw_user_meta_data ->> 'referral_code';
  
  IF ref_code IS NOT NULL AND ref_code != '' THEN
    -- Trova il referrer
    SELECT user_id INTO referrer_user_id
    FROM public.user_referrals
    WHERE referral_code = ref_code;
    
    -- Se trovato, crea il record referral come "registered"
    IF referrer_user_id IS NOT NULL THEN
      INSERT INTO public.referrals (
        referrer_id,
        referred_email,
        referred_user_id,
        referral_code,
        status,
        channel
      ) VALUES (
        referrer_user_id,
        NEW.email,
        NEW.id,
        ref_code,
        'registered',
        'manual_code'
      )
      ON CONFLICT (referrer_id, referred_email) DO UPDATE SET
        referred_user_id = NEW.id,
        status = 'registered',
        updated_at = now();
      
      -- Aggiorna solo contatore registrazioni
      UPDATE public.user_referrals 
      SET 
        total_referrals = total_referrals + 1,
        updated_at = NOW()
      WHERE user_id = referrer_user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 4. Crea il nuovo trigger che NON dà abbonamenti gratuiti
CREATE TRIGGER on_auth_user_created_no_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_no_subscription();