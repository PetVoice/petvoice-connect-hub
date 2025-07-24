-- Aggiungi il campo updated_at alla tabella protocol_ratings
ALTER TABLE public.protocol_ratings 
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Crea un trigger per aggiornare automaticamente updated_at
CREATE OR REPLACE FUNCTION update_protocol_ratings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applica il trigger alla tabella
DROP TRIGGER IF EXISTS update_protocol_ratings_updated_at_trigger ON public.protocol_ratings;
CREATE TRIGGER update_protocol_ratings_updated_at_trigger
    BEFORE UPDATE ON public.protocol_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_protocol_ratings_updated_at();