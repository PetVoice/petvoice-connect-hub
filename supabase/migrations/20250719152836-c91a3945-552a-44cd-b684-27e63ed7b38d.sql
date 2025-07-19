-- Crea tabella per le valutazioni dei protocolli
CREATE TABLE public.protocol_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  protocol_id UUID NOT NULL,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Un utente può valutare un protocollo solo una volta
  UNIQUE(protocol_id, user_id)
);

-- Abilita RLS
ALTER TABLE public.protocol_ratings ENABLE ROW LEVEL SECURITY;

-- Policy per permettere agli utenti di creare valutazioni per protocolli che hanno completato
CREATE POLICY "Users can rate completed protocols" 
ON public.protocol_ratings 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  EXISTS (
    SELECT 1 FROM public.ai_training_protocols 
    WHERE id = protocol_id 
    AND user_id = auth.uid() 
    AND status = 'completed'
  )
);

-- Policy per permettere agli utenti di vedere le proprie valutazioni
CREATE POLICY "Users can view own ratings" 
ON public.protocol_ratings 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy per permettere agli utenti di aggiornare le proprie valutazioni
CREATE POLICY "Users can update own ratings" 
ON public.protocol_ratings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Funzione per aggiornare il success_rate del protocollo basandosi sulle valutazioni
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
  
  -- Aggiorna il success_rate del protocollo (convertiamo da scala 1-10 a 0-1)
  UPDATE public.ai_training_protocols 
  SET 
    success_rate = CASE 
      WHEN avg_rating IS NOT NULL THEN (avg_rating - 1) / 9.0  -- Converte da 1-10 a 0-1
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
      'new_success_rate', (avg_rating - 1) / 9.0
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger per aggiornare automaticamente il success_rate quando viene inserita/aggiornata una valutazione
CREATE TRIGGER update_protocol_success_rate_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.protocol_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_protocol_success_rate();