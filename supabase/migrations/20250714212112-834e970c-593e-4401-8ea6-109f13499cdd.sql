-- Correggi la funzione handle_new_user per evitare errori di duplicazione
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Crea profilo se la tabella profiles esiste
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
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
  END IF;
  
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