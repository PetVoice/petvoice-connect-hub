-- Disabilita temporaneamente TUTTI i trigger che potrebbero causare problemi durante la registrazione
-- Manterremo solo quelli strettamente necessari per la registrazione base

-- Rimuovi tutti i trigger problematici
DROP TRIGGER IF EXISTS handle_referral_conversion_trigger ON public.subscribers;
DROP TRIGGER IF EXISTS on_auth_user_referral_registration ON auth.users;
DROP TRIGGER IF EXISTS update_subscribers_updated_at ON public.subscribers;

-- Ricrea solo il trigger essenziale per la creazione dell'utente
-- Questo trigger gestisce solo la creazione del profilo e dell'abbonamento
CREATE OR REPLACE FUNCTION public.handle_new_user_simple()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Crea solo il profilo 
  INSERT INTO public.profiles (user_id, display_name, language, theme)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'language', 'it'),
    COALESCE(NEW.raw_user_meta_data->>'theme', 'light')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
    language = COALESCE(EXCLUDED.language, profiles.language),
    theme = COALESCE(EXCLUDED.theme, profiles.theme),
    updated_at = NOW();
  
  -- Crea abbonamento premium automatico solo se non esiste già
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
  
  RETURN NEW;
END;
$function$;

-- Sostituisci il trigger esistente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created_simple
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_simple();