-- Rimuovi il trigger che potrebbe causare l'invio di email indesiderate
-- e crea una funzione più controllata per la gestione degli errori di registrazione

-- Prima rimuoviamo il trigger esistente per le email duplicate
DROP TRIGGER IF EXISTS check_email_before_insert ON auth.users;

-- Rimuoviamo anche la funzione associata
DROP FUNCTION IF EXISTS public.check_email_uniqueness();

-- Ora creiamo una funzione migliorata che non triggera email
CREATE OR REPLACE FUNCTION public.check_email_uniqueness()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  existing_user_count integer;
BEGIN
  -- Controlla se l'email esiste già
  SELECT COUNT(*) INTO existing_user_count 
  FROM auth.users 
  WHERE email = LOWER(TRIM(NEW.email)) 
  AND email_confirmed_at IS NOT NULL;
  
  -- Se l'utente esiste già e ha confermato l'email, blocca la registrazione
  IF existing_user_count > 0 THEN
    RAISE EXCEPTION 'User already registered with this email address' 
    USING ERRCODE = 'unique_violation';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Ricrea il trigger ma solo per INSERT
CREATE TRIGGER check_email_before_insert
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.check_email_uniqueness();