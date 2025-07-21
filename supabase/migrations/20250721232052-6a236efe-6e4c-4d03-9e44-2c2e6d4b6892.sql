-- Aggiorna la funzione di validazione per accettare tipi MIME completi
CREATE OR REPLACE FUNCTION public.validate_pet_analysis()
RETURNS TRIGGER AS $$
BEGIN
  -- Validazione file_type (ora accetta tipi MIME completi)
  IF NEW.file_type NOT IN ('text') AND 
     NOT (NEW.file_type LIKE 'audio/%' OR 
          NEW.file_type LIKE 'video/%' OR 
          NEW.file_type LIKE 'image/%') THEN
    RAISE EXCEPTION 'Tipo di file non valido: %. Sono accettati audio/*, video/*, image/*, text', NEW.file_type;
  END IF;
  
  -- Per analisi testuali, storage_path può essere NULL
  IF NEW.file_type = 'text' AND NEW.storage_path IS NOT NULL THEN
    RAISE EXCEPTION 'Le analisi testuali non devono avere storage_path';
  END IF;
  
  -- Per altri tipi di file, storage_path è richiesto
  IF NEW.file_type != 'text' AND NEW.storage_path IS NULL THEN
    RAISE EXCEPTION 'storage_path è richiesto per analisi di tipo %', NEW.file_type;
  END IF;
  
  -- Validazione confidenza
  IF NEW.primary_confidence < 0 OR NEW.primary_confidence > 1 THEN
    RAISE EXCEPTION 'primary_confidence deve essere tra 0 e 1';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;