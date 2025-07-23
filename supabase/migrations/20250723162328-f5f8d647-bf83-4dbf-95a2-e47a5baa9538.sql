-- Crea funzione per fare upsert delle valutazioni dei protocolli
CREATE OR REPLACE FUNCTION public.upsert_protocol_rating(
  p_protocol_id UUID,
  p_user_id UUID, 
  p_effectiveness_rating DECIMAL(3,2),
  p_ease_rating DECIMAL(3,2),
  p_improvement_rating DECIMAL(3,2),
  p_overall_satisfaction DECIMAL(3,2)
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  INSERT INTO public.protocol_ratings (
    protocol_id,
    user_id,
    effectiveness_rating,
    ease_rating,
    improvement_rating,
    overall_satisfaction,
    completion_date
  ) VALUES (
    p_protocol_id,
    p_user_id,
    p_effectiveness_rating,
    p_ease_rating,
    p_improvement_rating,
    p_overall_satisfaction,
    NOW()
  )
  ON CONFLICT (user_id, protocol_id) 
  DO UPDATE SET
    effectiveness_rating = EXCLUDED.effectiveness_rating,
    ease_rating = EXCLUDED.ease_rating,
    improvement_rating = EXCLUDED.improvement_rating,
    overall_satisfaction = EXCLUDED.overall_satisfaction,
    completion_date = EXCLUDED.completion_date,
    updated_at = NOW();
END;
$$;