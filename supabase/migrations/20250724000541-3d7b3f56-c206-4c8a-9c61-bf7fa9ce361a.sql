-- Funzione per correggere automaticamente la durata dei protocolli basandosi sugli esercizi disponibili
CREATE OR REPLACE FUNCTION public.fix_protocol_duration_based_on_exercises()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  protocol_record RECORD;
  max_exercise_day INTEGER;
BEGIN
  -- Per ogni protocollo, trova il giorno massimo degli esercizi e aggiorna la durata
  FOR protocol_record IN 
    SELECT DISTINCT protocol_id 
    FROM public.ai_training_exercises 
  LOOP
    -- Trova il giorno massimo per questo protocollo
    SELECT MAX(day_number) INTO max_exercise_day
    FROM public.ai_training_exercises 
    WHERE protocol_id = protocol_record.protocol_id;
    
    -- Se trovato, aggiorna la durata del protocollo
    IF max_exercise_day IS NOT NULL THEN
      UPDATE public.ai_training_protocols 
      SET 
        duration_days = max_exercise_day,
        updated_at = NOW()
      WHERE id = protocol_record.protocol_id 
        AND duration_days != max_exercise_day; -- Solo se diverso
      
      -- Log per debug
      RAISE NOTICE 'Protocollo % aggiornato a % giorni', protocol_record.protocol_id, max_exercise_day;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Correzione durata protocolli completata!';
END;
$$;

-- Esegui la correzione
SELECT public.fix_protocol_duration_based_on_exercises();