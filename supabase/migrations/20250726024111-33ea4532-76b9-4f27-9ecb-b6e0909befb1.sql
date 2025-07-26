-- Aggiungi il campo user_description per salvare il testo originale delle analisi testuali
ALTER TABLE public.pet_analyses 
ADD COLUMN user_description TEXT DEFAULT NULL;

-- Aggiungi un commento per documentare il campo
COMMENT ON COLUMN public.pet_analyses.user_description IS 'Testo originale fornito dall''utente per le analisi testuali';