-- Ricalcola manualmente il success_rate per il protocollo "Gestione Iperattività e Deficit Attenzione"
DO $$
DECLARE
  avg_rating NUMERIC;
  rating_count INTEGER;
  public_protocol_id UUID := 'f1e2d3c4-b5a6-4d5c-8f9e-1a2b3c4d5e6f';
  protocol_title TEXT := 'Gestione Iperattività e Deficit Attenzione';
BEGIN
  -- Calcola la media delle valutazioni per TUTTI i protocolli con questo titolo
  SELECT 
    AVG(pr.rating)::NUMERIC, 
    COUNT(*)
  INTO avg_rating, rating_count
  FROM public.protocol_ratings pr
  JOIN public.ai_training_protocols p ON pr.protocol_id = p.id
  WHERE p.title = protocol_title;
  
  -- Aggiorna il protocollo pubblico
  UPDATE public.ai_training_protocols 
  SET 
    success_rate = CASE 
      WHEN avg_rating IS NOT NULL THEN ((avg_rating - 1) / 9.0) * 100
      ELSE 0 
    END,
    community_rating = COALESCE(avg_rating, 0),
    updated_at = now()
  WHERE id = public_protocol_id;
  
  -- Mostra il risultato
  RAISE NOTICE 'Protocollo: %, Valutazioni: %, Media: %, Success Rate: %', 
    protocol_title, rating_count, avg_rating, 
    CASE WHEN avg_rating IS NOT NULL THEN ((avg_rating - 1) / 9.0) * 100 ELSE 0 END;
END $$;

-- Verifica il risultato
SELECT p.id, p.title, p.success_rate, p.community_rating,
       (SELECT COUNT(*) 
        FROM protocol_ratings pr2 
        JOIN ai_training_protocols p2 ON pr2.protocol_id = p2.id 
        WHERE p2.title = p.title) as total_ratings_for_title
FROM ai_training_protocols p 
WHERE p.title = 'Gestione Iperattività e Deficit Attenzione' AND p.is_public = true;