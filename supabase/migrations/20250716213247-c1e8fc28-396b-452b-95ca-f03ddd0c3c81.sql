-- EMERGENCY FIX: Rimuovi abbonamento premium per mariolana12321@hotmail.com
-- E correggi il trigger per evitare futuri problemi

-- 1. Rimuovi abbonamento premium per l'utente appena registrato
DELETE FROM public.subscribers 
WHERE user_id = '683fbd28-054c-4199-bd52-e5bdafb91140';

-- 2. Ricrea il trigger corretto che NON crea abbonamenti premium automatici
CREATE OR REPLACE FUNCTION public.handle_new_user_simple()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  -- Crea SOLO il profilo utente - NESSUN abbonamento premium automatico
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
  
  -- IMPORTANTE: NON creare abbonamenti premium automatici
  -- L'utente DEVE pagare per ottenere l'accesso
  
  RETURN NEW;
END;
$$;

-- 3. Assicurati che il trigger sia collegato correttamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user_simple();

-- 4. Verifica che l'utente ora NON abbia abbonamenti
DO $$
BEGIN
  RAISE NOTICE 'Abbonamento premium rimosso per mariolana12321@hotmail.com - ora deve pagare per accedere';
END $$;