-- Rimuovi il vincolo NOT NULL da storage_path per permettere analisi testuali
ALTER TABLE public.pet_analyses 
ALTER COLUMN storage_path DROP NOT NULL;

-- Aggiungi un commento per chiarire l'uso
COMMENT ON COLUMN public.pet_analyses.storage_path IS 'Path del file nel storage Supabase. NULL per analisi testuali che non richiedono file.';

-- Aggiorna la funzione di validazione se esiste per gestire meglio i tipi di analisi
CREATE OR REPLACE FUNCTION public.validate_pet_analysis()
RETURNS TRIGGER AS $$
BEGIN
  -- Validazione file_type
  IF NEW.file_type NOT IN ('audio', 'video', 'image', 'text') THEN
    RAISE EXCEPTION 'Tipo di file non valido: %', NEW.file_type;
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

-- Applica il trigger se non esiste già
DROP TRIGGER IF EXISTS validate_pet_analysis_trigger ON public.pet_analyses;
CREATE TRIGGER validate_pet_analysis_trigger
  BEFORE INSERT OR UPDATE ON public.pet_analyses
  FOR EACH ROW EXECUTE FUNCTION public.validate_pet_analysis();