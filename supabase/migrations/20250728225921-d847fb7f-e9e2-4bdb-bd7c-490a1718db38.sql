-- Crea una funzione per incrementare/decrementare i voti delle feature requests
CREATE OR REPLACE FUNCTION public.increment_feature_votes(request_id uuid, increment_value integer)
RETURNS void AS $$
BEGIN
  UPDATE public.support_feature_requests 
  SET votes = GREATEST(0, votes + increment_value)
  WHERE id = request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;