-- Aggiorna la funzione handle_new_user per NON creare abbonamenti automatici
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  -- Crea solo il profilo, NIENTE abbonamento automatico
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
  
  -- NON creare più abbonamenti automatici!
  -- Gli utenti devono pagare per avere l'abbonamento
  
  RETURN NEW;
END;
$$;

-- Aggiorna anche handle_new_user_simple
CREATE OR REPLACE FUNCTION public.handle_new_user_simple()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  -- Crea solo il profilo, NIENTE abbonamento automatico
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
  
  -- NON creare più abbonamenti automatici!
  -- Gli utenti devono pagare per avere l'abbonamento
  
  RETURN NEW;
END;
$$;