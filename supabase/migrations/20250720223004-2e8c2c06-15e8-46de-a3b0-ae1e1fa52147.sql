-- Crea tabella per le valutazioni dei protocolli se non esiste
CREATE TABLE IF NOT EXISTS public.protocol_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  protocol_id UUID NOT NULL,
  effectiveness_rating DECIMAL(3,2) NOT NULL CHECK (effectiveness_rating >= 1.00 AND effectiveness_rating <= 5.00),
  ease_rating DECIMAL(3,2) NOT NULL CHECK (ease_rating >= 1.00 AND ease_rating <= 5.00),
  improvement_rating DECIMAL(3,2) NOT NULL CHECK (improvement_rating >= 1.00 AND improvement_rating <= 5.00),
  overall_satisfaction DECIMAL(3,2) NOT NULL CHECK (overall_satisfaction >= 1.00 AND overall_satisfaction <= 5.00),
  rating DECIMAL(3,2) GENERATED ALWAYS AS ((effectiveness_rating + ease_rating + improvement_rating + overall_satisfaction) / 4) STORED,
  completion_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, protocol_id)
);

-- Abilita RLS
ALTER TABLE public.protocol_ratings ENABLE ROW LEVEL SECURITY;

-- Politiche RLS
CREATE POLICY "Users can manage their own ratings" 
ON public.protocol_ratings 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view ratings for statistics" 
ON public.protocol_ratings 
FOR SELECT 
USING (true);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_protocol_ratings_protocol_id ON public.protocol_ratings(protocol_id);
CREATE INDEX IF NOT EXISTS idx_protocol_ratings_user_id ON public.protocol_ratings(user_id);

-- Funzione per calcolare il tasso di successo dinamico
CREATE OR REPLACE FUNCTION public.calculate_protocol_success_rate(p_protocol_id UUID)
RETURNS DECIMAL(5,2)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  avg_rating DECIMAL(5,2);
BEGIN
  SELECT ROUND(AVG(rating) * 20, 2) INTO avg_rating
  FROM public.protocol_ratings 
  WHERE protocol_id = p_protocol_id;
  
  RETURN COALESCE(avg_rating, 0);
END;
$$;

-- Funzione per ottenere conteggio valutazioni
CREATE OR REPLACE FUNCTION public.get_protocol_ratings_count(p_protocol_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM public.protocol_ratings 
    WHERE protocol_id = p_protocol_id
  );
END;
$$;

-- Trigger per aggiornare updated_at
CREATE TRIGGER update_protocol_ratings_updated_at
BEFORE UPDATE ON public.protocol_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();