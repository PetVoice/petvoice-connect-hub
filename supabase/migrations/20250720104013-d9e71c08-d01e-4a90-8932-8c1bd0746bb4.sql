-- Aggiorna la funzione per calcolare il success_rate includendo le valutazioni dei protocolli derivati
CREATE OR REPLACE FUNCTION public.update_protocol_success_rate()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  avg_rating NUMERIC;
  rating_count INTEGER;
  public_protocol_id UUID;
  protocol_title TEXT;
BEGIN
  -- Ottieni il titolo del protocollo valutato
  SELECT title INTO protocol_title
  FROM public.ai_training_protocols 
  WHERE id = COALESCE(NEW.protocol_id, OLD.protocol_id);
  
  -- Trova il protocollo pubblico con lo stesso titolo
  SELECT id INTO public_protocol_id
  FROM public.ai_training_protocols 
  WHERE title = protocol_title AND is_public = true
  LIMIT 1;
  
  -- Se esiste un protocollo pubblico, aggiorna le sue statistiche
  IF public_protocol_id IS NOT NULL THEN
    -- Calcola la media delle valutazioni per TUTTI i protocolli con lo stesso titolo
    SELECT 
      AVG(pr.rating)::NUMERIC, 
      COUNT(*)
    INTO avg_rating, rating_count
    FROM public.protocol_ratings pr
    JOIN public.ai_training_protocols p ON pr.protocol_id = p.id
    WHERE p.title = protocol_title;
    
    -- Aggiorna SOLO il protocollo pubblico con le statistiche aggregate
    UPDATE public.ai_training_protocols 
    SET 
      success_rate = CASE 
        WHEN avg_rating IS NOT NULL THEN ((avg_rating - 1) / 9.0) * 100
        ELSE 0 
      END,
      community_rating = COALESCE(avg_rating, 0),
      updated_at = now()
    WHERE id = public_protocol_id;
    
    -- Log dell'aggiornamento
    INSERT INTO public.activity_log (
      user_id,
      activity_type,
      activity_description,
      metadata
    ) VALUES (
      COALESCE(NEW.user_id, OLD.user_id),
      'protocol_rated_aggregated',
      'Valutazione aggregata per protocollo: ' || protocol_title,
      jsonb_build_object(
        'protocol_title', protocol_title,
        'public_protocol_id', public_protocol_id,
        'rated_protocol_id', COALESCE(NEW.protocol_id, OLD.protocol_id),
        'rating', COALESCE(NEW.rating, OLD.rating),
        'avg_rating', avg_rating,
        'total_ratings', rating_count,
        'new_success_rate', ((avg_rating - 1) / 9.0) * 100
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;