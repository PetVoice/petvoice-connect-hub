-- Elimina trigger esistenti se presenti
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
DROP TRIGGER IF EXISTS check_email_before_insert ON auth.users;
DROP TRIGGER IF EXISTS normalize_user_email ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_pets_updated_at ON public.pets;
DROP TRIGGER IF EXISTS update_pet_analyses_updated_at ON public.pet_analyses;
DROP TRIGGER IF EXISTS update_diary_entries_updated_at ON public.diary_entries;
DROP TRIGGER IF EXISTS update_pet_wellness_scores_updated_at ON public.pet_wellness_scores;
DROP TRIGGER IF EXISTS update_subscribers_updated_at ON public.subscribers;
DROP TRIGGER IF EXISTS log_pet_activities ON public.pets;
DROP TRIGGER IF EXISTS log_diary_activities ON public.diary_entries;
DROP TRIGGER IF EXISTS validate_pet_before_insert_update ON public.pets;

-- Trigger per creare automaticamente un profilo quando un nuovo utente si registra
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger per eliminazione cascata quando un utente viene eliminato
CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Elimina tutti i dati dell'utente quando viene cancellato da auth.users
  DELETE FROM public.activity_log WHERE user_id = OLD.id;
  DELETE FROM public.diary_entries WHERE user_id = OLD.id;
  DELETE FROM public.pet_analyses WHERE user_id = OLD.id;
  DELETE FROM public.pet_wellness_scores WHERE user_id = OLD.id;
  DELETE FROM public.pets WHERE user_id = OLD.id;
  DELETE FROM public.subscribers WHERE user_id = OLD.id;
  DELETE FROM public.profiles WHERE user_id = OLD.id;
  
  RETURN OLD;
END;
$$;

CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_deletion();

-- Trigger per aggiornare automaticamente updated_at su tutte le tabelle
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pets_updated_at
  BEFORE UPDATE ON public.pets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pet_analyses_updated_at
  BEFORE UPDATE ON public.pet_analyses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_diary_entries_updated_at
  BEFORE UPDATE ON public.diary_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pet_wellness_scores_updated_at
  BEFORE UPDATE ON public.pet_wellness_scores  
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscribers_updated_at
  BEFORE UPDATE ON public.subscribers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger per validare email duplicate prima dell'inserimento
CREATE TRIGGER check_email_before_insert
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.check_email_uniqueness();

-- Trigger per log delle attività automatico
CREATE OR REPLACE FUNCTION public.log_pet_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Log quando viene creato un nuovo pet
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.activity_log (user_id, pet_id, activity_type, activity_description)
    VALUES (NEW.user_id, NEW.id, 'pet_created', 'New pet "' || NEW.name || '" was added to the family');
    RETURN NEW;
  END IF;
  
  -- Log quando viene aggiornato un pet
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.activity_log (user_id, pet_id, activity_type, activity_description)
    VALUES (NEW.user_id, NEW.id, 'pet_updated', 'Pet "' || NEW.name || '" information was updated');
    RETURN NEW;
  END IF;
  
  -- Log quando viene eliminato un pet
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.activity_log (user_id, pet_id, activity_type, activity_description)
    VALUES (OLD.user_id, OLD.id, 'pet_deleted', 'Pet "' || OLD.name || '" was removed');
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$;

CREATE TRIGGER log_pet_activities
  AFTER INSERT OR UPDATE OR DELETE ON public.pets
  FOR EACH ROW EXECUTE FUNCTION public.log_pet_activity();

-- Trigger per log delle entry del diario
CREATE OR REPLACE FUNCTION public.log_diary_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.activity_log (user_id, pet_id, activity_type, activity_description)
    VALUES (NEW.user_id, NEW.pet_id, 'diary_entry_created', 'New diary entry: "' || COALESCE(NEW.title, 'Untitled') || '"');
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$;

CREATE TRIGGER log_diary_activities
  AFTER INSERT ON public.diary_entries
  FOR EACH ROW EXECUTE FUNCTION public.log_diary_activity();

-- Trigger per validare dati pet prima dell'inserimento
CREATE OR REPLACE FUNCTION public.validate_pet_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Validazione nome pet (non vuoto e lunghezza minima)
  IF NEW.name IS NULL OR LENGTH(TRIM(NEW.name)) < 1 THEN
    RAISE EXCEPTION 'Pet name cannot be empty';
  END IF;
  
  -- Validazione tipo pet (non vuoto)
  IF NEW.type IS NULL OR LENGTH(TRIM(NEW.type)) < 1 THEN
    RAISE EXCEPTION 'Pet type cannot be empty';
  END IF;
  
  -- Validazione età (se specificata, deve essere positiva)
  IF NEW.age IS NOT NULL AND NEW.age < 0 THEN
    RAISE EXCEPTION 'Pet age cannot be negative';
  END IF;
  
  -- Validazione peso (se specificato, deve essere positivo)
  IF NEW.weight IS NOT NULL AND NEW.weight <= 0 THEN
    RAISE EXCEPTION 'Pet weight must be positive';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_pet_before_insert_update
  BEFORE INSERT OR UPDATE ON public.pets
  FOR EACH ROW EXECUTE FUNCTION public.validate_pet_data();

-- Trigger per normalizzare email in lowercase
CREATE OR REPLACE FUNCTION public.normalize_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Normalizza email in lowercase
  NEW.email = LOWER(TRIM(NEW.email));
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER normalize_user_email
  BEFORE INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.normalize_email();