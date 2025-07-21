-- Aggiungi la colonna metadata mancante alla tabella pet_analyses
ALTER TABLE public.pet_analyses ADD COLUMN IF NOT EXISTS metadata JSONB;