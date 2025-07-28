-- Correggi la funzione per incrementare i voti con search_path sicuro
CREATE OR REPLACE FUNCTION public.increment_feature_votes(request_id uuid, increment_value integer)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  UPDATE public.support_feature_requests 
  SET votes = GREATEST(0, votes + increment_value)
  WHERE id = request_id;
END;
$$;