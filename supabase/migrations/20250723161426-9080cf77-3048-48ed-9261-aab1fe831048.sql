-- Crea il trigger per aggiornare automaticamente il success_rate quando viene valutato un protocollo
CREATE TRIGGER update_protocol_success_rate_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.protocol_ratings
    FOR EACH ROW EXECUTE FUNCTION public.update_protocol_success_rate();

-- Aggiorna anche tutti i protocolli esistenti basandosi sui rating attuali
DO $$
DECLARE
    protocol_record RECORD;
    avg_rating NUMERIC;
    rating_count INTEGER;
    public_protocol_id UUID;
BEGIN
    -- Per ogni protocollo pubblico, ricalcola il success_rate
    FOR protocol_record IN 
        SELECT DISTINCT title FROM public.ai_training_protocols WHERE is_public = true
    LOOP
        -- Trova il protocollo pubblico
        SELECT id INTO public_protocol_id
        FROM public.ai_training_protocols 
        WHERE title = protocol_record.title AND is_public = true
        LIMIT 1;
        
        -- Calcola la media delle valutazioni per tutti i protocolli con lo stesso titolo
        SELECT 
            AVG(pr.rating)::NUMERIC, 
            COUNT(*)
        INTO avg_rating, rating_count
        FROM public.protocol_ratings pr
        JOIN public.ai_training_protocols p ON pr.protocol_id = p.id
        WHERE p.title = protocol_record.title;
        
        -- Aggiorna il protocollo pubblico
        IF avg_rating IS NOT NULL AND public_protocol_id IS NOT NULL THEN
            UPDATE public.ai_training_protocols 
            SET 
                success_rate = ((avg_rating - 1) / 9.0) * 100,
                community_rating = avg_rating,
                updated_at = now()
            WHERE id = public_protocol_id;
        END IF;
    END LOOP;
END $$;