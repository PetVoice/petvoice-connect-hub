-- Rimuovi tutti i trigger e funzioni esistenti con CASCADE
DROP TRIGGER IF EXISTS on_auth_user_created_simple ON auth.users;
DROP TRIGGER IF EXISTS on_new_user_simple ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_simple() CASCADE;

-- Nuovo trigger che crea solo il profilo, SENZA abbonamento premium
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
  
  -- NON creare abbonamento premium automatico
  -- L'utente deve pagare per ottenere l'accesso
  
  RETURN NEW;
END;
$function$;

-- Ricrea il trigger
CREATE TRIGGER on_auth_user_created_simple
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_simple();