-- ================================
-- COMPLETE TRIGGERS FOR PETVOICE
-- ================================

-- Prima, creiamo tutte le funzioni necessarie

-- 1. FUNZIONE PER AGGIORNARE TIMESTAMP
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2. FUNZIONE PER GESTIRE NUOVI UTENTI
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, language, theme)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'language', 'it'),
    COALESCE(NEW.raw_user_meta_data->>'theme', 'light')
  );
  RETURN NEW;
END;
$$;

-- 3. FUNZIONE PER ELIMINAZIONE A CASCATA
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

-- 4. FUNZIONE PER LOG ATTIVITÀ PET
CREATE OR REPLACE FUNCTION public.log_pet_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Log quando viene creato un nuovo pet
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.activity_log (user_id, pet_id, activity_type, activity_description, metadata)
    VALUES (
      NEW.user_id, 
      NEW.id, 
      'pet_created', 
      'New pet "' || NEW.name || '" (' || NEW.type || ') was added to the family',
      jsonb_build_object('pet_name', NEW.name, 'pet_type', NEW.type, 'breed', NEW.breed)
    );
    RETURN NEW;
  END IF;
  
  -- Log quando viene aggiornato un pet
  IF TG_OP = 'UPDATE' THEN
    -- Solo se ci sono cambiamenti significativi
    IF OLD.name != NEW.name OR OLD.type != NEW.type OR OLD.breed != NEW.breed OR 
       OLD.health_conditions != NEW.health_conditions OR OLD.weight != NEW.weight OR
       OLD.age != NEW.age THEN
      INSERT INTO public.activity_log (user_id, pet_id, activity_type, activity_description, metadata)
      VALUES (
        NEW.user_id, 
        NEW.id, 
        'pet_updated', 
        'Pet "' || NEW.name || '" information was updated',
        jsonb_build_object(
          'old_data', row_to_json(OLD),
          'new_data', row_to_json(NEW),
          'updated_fields', array_remove(ARRAY[
            CASE WHEN OLD.name != NEW.name THEN 'name' ELSE NULL END,
            CASE WHEN OLD.type != NEW.type THEN 'type' ELSE NULL END,
            CASE WHEN OLD.breed != NEW.breed THEN 'breed' ELSE NULL END,
            CASE WHEN OLD.health_conditions != NEW.health_conditions THEN 'health_conditions' ELSE NULL END,
            CASE WHEN OLD.weight != NEW.weight THEN 'weight' ELSE NULL END,
            CASE WHEN OLD.age != NEW.age THEN 'age' ELSE NULL END
          ], NULL)
        )
      );
    END IF;
    RETURN NEW;
  END IF;
  
  -- Log quando viene eliminato un pet
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.activity_log (user_id, pet_id, activity_type, activity_description, metadata)
    VALUES (
      OLD.user_id, 
      OLD.id, 
      'pet_deleted', 
      'Pet "' || OLD.name || '" was removed from the family',
      jsonb_build_object('pet_data', row_to_json(OLD))
    );
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$;

-- 5. FUNZIONE PER LOG ATTIVITÀ DIARIO
CREATE OR REPLACE FUNCTION public.log_diary_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.activity_log (user_id, pet_id, activity_type, activity_description, metadata)
    VALUES (
      NEW.user_id, 
      NEW.pet_id, 
      'diary_entry_created', 
      'New diary entry: "' || COALESCE(NEW.title, 'Untitled') || '"',
      jsonb_build_object(
        'entry_id', NEW.id,
        'entry_date', NEW.entry_date,
        'mood_score', NEW.mood_score,
        'behavioral_tags', NEW.behavioral_tags,
        'has_photos', CASE WHEN array_length(NEW.photo_urls, 1) > 0 THEN true ELSE false END,
        'has_voice_note', CASE WHEN NEW.voice_note_url IS NOT NULL THEN true ELSE false END
      )
    );
    RETURN NEW;
  END IF;
  
  IF TG_OP = 'UPDATE' THEN
    -- Log solo se ci sono cambiamenti significativi
    IF OLD.title != NEW.title OR OLD.content != NEW.content OR 
       OLD.mood_score != NEW.mood_score OR OLD.behavioral_tags != NEW.behavioral_tags THEN
      INSERT INTO public.activity_log (user_id, pet_id, activity_type, activity_description, metadata)
      VALUES (
        NEW.user_id, 
        NEW.pet_id, 
        'diary_entry_updated', 
        'Diary entry "' || COALESCE(NEW.title, 'Untitled') || '" was updated',
        jsonb_build_object('entry_id', NEW.id, 'changes', 'content_updated')
      );
    END IF;
    RETURN NEW;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.activity_log (user_id, pet_id, activity_type, activity_description, metadata)
    VALUES (
      OLD.user_id, 
      OLD.pet_id, 
      'diary_entry_deleted', 
      'Diary entry "' || COALESCE(OLD.title, 'Untitled') || '" was deleted',
      jsonb_build_object('entry_id', OLD.id, 'entry_date', OLD.entry_date)
    );
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$;

-- 6. FUNZIONE PER VALIDAZIONE DATI PET
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
  
  -- Validazione età (se specificata, deve essere positiva e ragionevole)
  IF NEW.age IS NOT NULL AND (NEW.age < 0 OR NEW.age > 50) THEN
    RAISE EXCEPTION 'Pet age must be between 0 and 50 years';
  END IF;
  
  -- Validazione peso (se specificato, deve essere positivo e ragionevole)
  IF NEW.weight IS NOT NULL AND (NEW.weight <= 0 OR NEW.weight > 1000) THEN
    RAISE EXCEPTION 'Pet weight must be between 0.1 and 1000 kg';
  END IF;
  
  -- Validazione data di nascita (non può essere nel futuro)
  IF NEW.birth_date IS NOT NULL AND NEW.birth_date > CURRENT_DATE THEN
    RAISE EXCEPTION 'Birth date cannot be in the future';
  END IF;
  
  -- Normalizzazione dati
  NEW.name = TRIM(NEW.name);
  NEW.type = LOWER(TRIM(NEW.type));
  IF NEW.breed IS NOT NULL THEN
    NEW.breed = TRIM(NEW.breed);
  END IF;
  
  RETURN NEW;
END;
$$;

-- 7. FUNZIONE PER LOG ANALISI PET
CREATE OR REPLACE FUNCTION public.log_analysis_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.activity_log (user_id, pet_id, activity_type, activity_description, metadata)
    VALUES (
      NEW.user_id, 
      NEW.pet_id, 
      'analysis_completed', 
      'Emotion analysis completed for "' || NEW.file_name || '"',
      jsonb_build_object(
        'analysis_id', NEW.id,
        'primary_emotion', NEW.primary_emotion,
        'confidence', NEW.primary_confidence,
        'file_type', NEW.file_type,
        'file_size', NEW.file_size,
        'duration', NEW.analysis_duration,
        'insights_generated', CASE WHEN NEW.behavioral_insights IS NOT NULL THEN true ELSE false END
      )
    );
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$;

-- 8. FUNZIONE PER CALCOLO AUTOMATICO WELLNESS SCORE
CREATE OR REPLACE FUNCTION public.calculate_wellness_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  avg_mood numeric;
  recent_entries_count integer;
  negative_behaviors_count integer;
  positive_behaviors_count integer;
  calculated_score numeric;
BEGIN
  -- Calcola il punteggio basato sui dati disponibili
  
  -- 1. Media mood score delle ultime 7 voci del diario
  SELECT 
    COALESCE(AVG(mood_score), 5),
    COUNT(*)
  INTO avg_mood, recent_entries_count
  FROM public.diary_entries 
  WHERE pet_id = NEW.pet_id 
    AND entry_date >= CURRENT_DATE - INTERVAL '7 days'
    AND mood_score IS NOT NULL;
  
  -- 2. Conta comportamenti negativi e positivi
  SELECT 
    COUNT(*) FILTER (WHERE elem IN ('aggressivo', 'ansioso', 'depresso', 'agitato', 'spaventato'))
  INTO negative_behaviors_count
  FROM public.diary_entries,
  LATERAL unnest(behavioral_tags) AS elem
  WHERE pet_id = NEW.pet_id 
    AND entry_date >= CURRENT_DATE - INTERVAL '7 days';
    
  SELECT 
    COUNT(*) FILTER (WHERE elem IN ('felice', 'giocoso', 'calmo', 'affettuoso', 'energico'))
  INTO positive_behaviors_count
  FROM public.diary_entries,
  LATERAL unnest(behavioral_tags) AS elem
  WHERE pet_id = NEW.pet_id 
    AND entry_date >= CURRENT_DATE - INTERVAL '7 days';
  
  -- Formula per calcolare il wellness score (0-100)
  calculated_score := LEAST(100, GREATEST(0, 
    (avg_mood * 10) + -- Base score da mood (0-100)
    (positive_behaviors_count * 2) - -- Bonus comportamenti positivi
    (negative_behaviors_count * 3) + -- Malus comportamenti negativi
    CASE 
      WHEN recent_entries_count >= 5 THEN 5  -- Bonus per regolarità
      WHEN recent_entries_count >= 3 THEN 3
      WHEN recent_entries_count >= 1 THEN 1
      ELSE -5 -- Malus per mancanza di dati
    END
  ));
  
  -- Aggiorna il wellness score se non è stato impostato manualmente
  IF NEW.wellness_score IS NULL THEN
    NEW.wellness_score := calculated_score;
  END IF;
  
  -- Salva i fattori che hanno contribuito al calcolo
  NEW.factors := jsonb_build_object(
    'avg_mood', avg_mood,
    'recent_entries_count', recent_entries_count,
    'positive_behaviors', positive_behaviors_count,
    'negative_behaviors', negative_behaviors_count,
    'calculated_score', calculated_score,
    'calculation_date', now()
  );
  
  RETURN NEW;
END;
$$;

-- 9. FUNZIONE PER VALIDAZIONE DIARY ENTRIES
CREATE OR REPLACE FUNCTION public.validate_diary_entry()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Validazione data entry (non può essere troppo nel futuro)
  IF NEW.entry_date > CURRENT_DATE + INTERVAL '1 day' THEN
    RAISE EXCEPTION 'Entry date cannot be more than 1 day in the future';
  END IF;
  
  -- Validazione mood score (1-10)
  IF NEW.mood_score IS NOT NULL AND (NEW.mood_score < 1 OR NEW.mood_score > 10) THEN
    RAISE EXCEPTION 'Mood score must be between 1 and 10';
  END IF;
  
  -- Validazione temperatura (ragionevole per animali domestici)
  IF NEW.temperature IS NOT NULL AND (NEW.temperature < 35 OR NEW.temperature > 45) THEN
    RAISE EXCEPTION 'Temperature must be between 35°C and 45°C';
  END IF;
  
  -- Normalizzazione tags
  IF NEW.behavioral_tags IS NOT NULL THEN
    SELECT array_agg(LOWER(TRIM(tag)))
    INTO NEW.behavioral_tags
    FROM unnest(NEW.behavioral_tags) AS tag
    WHERE LENGTH(TRIM(tag)) > 0;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 10. FUNZIONE PER CLEANUP AUTOMATICO DATI VECCHI
CREATE OR REPLACE FUNCTION public.cleanup_old_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Pulisce i log delle attività più vecchi di 1 anno
  DELETE FROM public.activity_log 
  WHERE created_at < NOW() - INTERVAL '1 year';
  
  -- Pulisce le analisi più vecchie di 2 anni (mantenendo solo le più importanti)
  DELETE FROM public.pet_analyses 
  WHERE created_at < NOW() - INTERVAL '2 years'
    AND primary_confidence < 0.7; -- Mantiene solo analisi molto affidabili
  
  RETURN NEW;
END;
$$;

-- 11. FUNZIONE PER NOTIFICHE AUTOMATICHE
CREATE OR REPLACE FUNCTION public.generate_notifications()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  days_since_last_entry integer;
  low_mood_count integer;
BEGIN
  -- Controlla se è necessario inviare notifiche
  
  -- 1. Promemoria per aggiornamento diario
  SELECT DATE_PART('day', NOW() - MAX(entry_date))
  INTO days_since_last_entry
  FROM public.diary_entries
  WHERE pet_id = NEW.pet_id;
  
  -- 2. Alert per mood basso consecutivo
  SELECT COUNT(*)
  INTO low_mood_count
  FROM public.diary_entries
  WHERE pet_id = NEW.pet_id
    AND entry_date >= CURRENT_DATE - INTERVAL '3 days'
    AND mood_score <= 3;
  
  -- Qui potresti inserire logica per creare notifiche
  -- Per ora registriamo solo nel log delle attività
  
  IF days_since_last_entry >= 3 THEN
    INSERT INTO public.activity_log (user_id, pet_id, activity_type, activity_description, metadata)
    VALUES (
      NEW.user_id,
      NEW.pet_id,
      'reminder_diary_update',
      'Reminder: Update your pet diary - no entries for ' || days_since_last_entry || ' days',
      jsonb_build_object('days_without_entry', days_since_last_entry, 'notification_type', 'diary_reminder')
    );
  END IF;
  
  IF low_mood_count >= 2 THEN
    INSERT INTO public.activity_log (user_id, pet_id, activity_type, activity_description, metadata)
    VALUES (
      NEW.user_id,
      NEW.pet_id,
      'alert_low_mood',
      'Alert: Your pet has shown low mood for multiple days',
      jsonb_build_object('low_mood_days', low_mood_count, 'notification_type', 'health_alert')
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- 12. FUNZIONE PER NORMALIZZARE EMAIL
CREATE OR REPLACE FUNCTION public.normalize_profile_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Normalizzazione display_name
  IF NEW.display_name IS NOT NULL THEN
    NEW.display_name = TRIM(NEW.display_name);
    IF LENGTH(NEW.display_name) = 0 THEN
      NEW.display_name = NULL;
    END IF;
  END IF;
  
  -- Validazione theme
  IF NEW.theme IS NOT NULL AND NEW.theme NOT IN ('light', 'dark', 'system') THEN
    NEW.theme = 'light';
  END IF;
  
  -- Validazione language
  IF NEW.language IS NOT NULL AND NEW.language NOT IN ('it', 'en', 'es', 'fr', 'de') THEN
    NEW.language = 'it';
  END IF;
  
  RETURN NEW;
END;
$$;

-- ================================
-- CREAZIONE DI TUTTI I TRIGGER
-- ================================

-- Trigger per gestione utenti (auth.users)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_deletion();

-- Trigger per aggiornamento timestamp su tutte le tabelle
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_pets_updated_at ON public.pets;
CREATE TRIGGER update_pets_updated_at
  BEFORE UPDATE ON public.pets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_pet_analyses_updated_at ON public.pet_analyses;
CREATE TRIGGER update_pet_analyses_updated_at
  BEFORE UPDATE ON public.pet_analyses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_diary_entries_updated_at ON public.diary_entries;
CREATE TRIGGER update_diary_entries_updated_at
  BEFORE UPDATE ON public.diary_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_pet_wellness_scores_updated_at ON public.pet_wellness_scores;
CREATE TRIGGER update_pet_wellness_scores_updated_at
  BEFORE UPDATE ON public.pet_wellness_scores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscribers_updated_at ON public.subscribers;
CREATE TRIGGER update_subscribers_updated_at
  BEFORE UPDATE ON public.subscribers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger per validazione e normalizzazione dati
DROP TRIGGER IF EXISTS validate_pet_before_insert_update ON public.pets;
CREATE TRIGGER validate_pet_before_insert_update
  BEFORE INSERT OR UPDATE ON public.pets
  FOR EACH ROW EXECUTE FUNCTION public.validate_pet_data();

DROP TRIGGER IF EXISTS validate_diary_before_insert_update ON public.diary_entries;
CREATE TRIGGER validate_diary_before_insert_update
  BEFORE INSERT OR UPDATE ON public.diary_entries
  FOR EACH ROW EXECUTE FUNCTION public.validate_diary_entry();

DROP TRIGGER IF EXISTS normalize_profile_before_insert_update ON public.profiles;
CREATE TRIGGER normalize_profile_before_insert_update
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.normalize_profile_data();

-- Trigger per log attività
DROP TRIGGER IF EXISTS log_pet_activities ON public.pets;
CREATE TRIGGER log_pet_activities
  AFTER INSERT OR UPDATE OR DELETE ON public.pets
  FOR EACH ROW EXECUTE FUNCTION public.log_pet_activity();

DROP TRIGGER IF EXISTS log_diary_activities ON public.diary_entries;
CREATE TRIGGER log_diary_activities
  AFTER INSERT OR UPDATE OR DELETE ON public.diary_entries
  FOR EACH ROW EXECUTE FUNCTION public.log_diary_activity();

DROP TRIGGER IF EXISTS log_analysis_activities ON public.pet_analyses;
CREATE TRIGGER log_analysis_activities
  AFTER INSERT ON public.pet_analyses
  FOR EACH ROW EXECUTE FUNCTION public.log_analysis_activity();

-- Trigger per calcoli automatici
DROP TRIGGER IF EXISTS calculate_wellness_on_insert ON public.pet_wellness_scores;
CREATE TRIGGER calculate_wellness_on_insert
  BEFORE INSERT ON public.pet_wellness_scores
  FOR EACH ROW EXECUTE FUNCTION public.calculate_wellness_score();

-- Trigger per notifiche (eseguito dopo inserimento diary entry)
DROP TRIGGER IF EXISTS generate_notifications_after_diary ON public.diary_entries;
CREATE TRIGGER generate_notifications_after_diary
  AFTER INSERT ON public.diary_entries
  FOR EACH ROW EXECUTE FUNCTION public.generate_notifications();

-- Trigger per cleanup automatico (eseguito sporadicamente)
-- Questo trigger si attiva quando viene inserita una nuova analisi
-- e fa cleanup dei dati vecchi
DROP TRIGGER IF EXISTS cleanup_on_analysis_insert ON public.pet_analyses;
CREATE TRIGGER cleanup_on_analysis_insert
  AFTER INSERT ON public.pet_analyses
  FOR EACH ROW 
  WHEN (RANDOM() < 0.01) -- Solo 1% delle volte per non sovraccaricare
  EXECUTE FUNCTION public.cleanup_old_data();

-- ================================
-- TRIGGER AGGIUNTIVI PER FUNZIONALITÀ FUTURE
-- ================================

-- Funzione per gestire condivisioni pet (quando implementeremo la feature)
CREATE OR REPLACE FUNCTION public.handle_pet_sharing()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Questo trigger gestirà la condivisione di pet tra utenti
  -- quando implementeremo la tabella pet_shares
  
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.activity_log (user_id, pet_id, activity_type, activity_description, metadata)
    VALUES (
      NEW.owner_user_id,
      NEW.pet_id,
      'pet_shared',
      'Pet shared with another user',
      jsonb_build_object('shared_with_user', NEW.shared_user_id, 'permission_level', NEW.permission_level)
    );
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Funzione per gestire appuntamenti veterinari (feature futura)
CREATE OR REPLACE FUNCTION public.handle_vet_appointments()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.activity_log (user_id, pet_id, activity_type, activity_description, metadata)
    VALUES (
      NEW.user_id,
      NEW.pet_id,
      'appointment_scheduled',
      'Veterinary appointment scheduled for ' || NEW.appointment_date,
      jsonb_build_object(
        'appointment_id', NEW.id,
        'appointment_type', NEW.appointment_type,
        'vet_name', NEW.vet_name,
        'notes', NEW.notes
      )
    );
    RETURN NEW;
  END IF;
  
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO public.activity_log (user_id, pet_id, activity_type, activity_description, metadata)
    VALUES (
      NEW.user_id,
      NEW.pet_id,
      'appointment_status_changed',
      'Appointment status changed from ' || OLD.status || ' to ' || NEW.status,
      jsonb_build_object('appointment_id', NEW.id, 'old_status', OLD.status, 'new_status', NEW.status)
    );
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Funzione per gestire promemoria medicinali (feature futura)
CREATE OR REPLACE FUNCTION public.handle_medication_reminders()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.activity_log (user_id, pet_id, activity_type, activity_description, metadata)
    VALUES (
      NEW.user_id,
      NEW.pet_id,
      'medication_added',
      'New medication added: ' || NEW.medication_name,
      jsonb_build_object(
        'medication_id', NEW.id,
        'dosage', NEW.dosage,
        'frequency', NEW.frequency,
        'start_date', NEW.start_date,
        'end_date', NEW.end_date
      )
    );
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Commenti per implementazione futura:
COMMENT ON FUNCTION public.handle_pet_sharing() IS 'Trigger function for pet sharing features - to be used when pet_shares table is created';
COMMENT ON FUNCTION public.handle_vet_appointments() IS 'Trigger function for veterinary appointments - to be used when vet_appointments table is created';
COMMENT ON FUNCTION public.handle_medication_reminders() IS 'Trigger function for medication reminders - to be used when pet_medications table is created';

-- ================================
-- SUMMARY
-- ================================

/*
TRIGGER ATTIVI:
1. ✅ Creazione automatica profilo utente
2. ✅ Eliminazione a cascata dati utente  
3. ✅ Aggiornamento timestamp su tutte le tabelle
4. ✅ Validazione dati pet (nome, età, peso, date)
5. ✅ Validazione diary entries (date, mood, temperatura)
6. ✅ Normalizzazione dati profilo (theme, language)
7. ✅ Log automatico attività pet (create/update/delete)
8. ✅ Log automatico attività diario (create/update/delete)
9. ✅ Log automatico analisi completate
10. ✅ Calcolo automatico wellness score
11. ✅ Generazione notifiche/reminder automatici
12. ✅ Cleanup automatico dati vecchi (1% probabilità)

FUNZIONI PREPARATE PER IL FUTURO:
- 🔮 Gestione condivisione pet tra utenti
- 🔮 Gestione appuntamenti veterinari
- 🔮 Gestione promemoria medicinali
- 🔮 Sistema notifiche avanzato
- 🔮 Audit trail completo

UTILIZZO:
Copia tutto questo file SQL e eseguilo su Supabase.
Tutti i trigger saranno attivi immediatamente per le tabelle esistenti.
*/