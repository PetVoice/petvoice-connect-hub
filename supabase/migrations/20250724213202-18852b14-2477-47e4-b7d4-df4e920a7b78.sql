-- Risolve l'avvertimento di sicurezza impostando il search_path
CREATE OR REPLACE FUNCTION update_protocol_ratings_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;