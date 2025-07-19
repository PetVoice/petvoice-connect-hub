-- Fix the success rate calculation in the trigger function
-- The formula was showing 1% instead of 100% for a 10/10 rating

CREATE OR REPLACE FUNCTION update_protocol_success_rate()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating NUMERIC;
  rating_count INTEGER;
BEGIN
  -- Calcola la media delle valutazioni per questo protocollo
  SELECT 
    AVG(rating)::NUMERIC, 
    COUNT(*)
  INTO avg_rating, rating_count
  FROM public.protocol_ratings 
  WHERE protocol_id = COALESCE(NEW.protocol_id, OLD.protocol_id);
  
  -- Aggiorna il success_rate del protocollo (convertiamo da scala 1-10 a 0-100 invece di 0-1)
  UPDATE public.ai_training_protocols 
  SET 
    success_rate = CASE 
      WHEN avg_rating IS NOT NULL THEN ((avg_rating - 1) / 9.0) * 100  -- Converte da 1-10 a 0-100
      ELSE 0 
    END,
    community_rating = COALESCE(avg_rating, 0),
    updated_at = now()
  WHERE id = COALESCE(NEW.protocol_id, OLD.protocol_id);
  
  -- Log dell'aggiornamento
  INSERT INTO public.activity_log (
    user_id,
    activity_type,
    activity_description,
    metadata
  ) VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    'protocol_rated',
    'Protocollo valutato: ' || COALESCE(NEW.rating, OLD.rating) || '/10',
    jsonb_build_object(
      'protocol_id', COALESCE(NEW.protocol_id, OLD.protocol_id),
      'rating', COALESCE(NEW.rating, OLD.rating),
      'avg_rating', avg_rating,
      'rating_count', rating_count,
      'new_success_rate', ((avg_rating - 1) / 9.0) * 100
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;