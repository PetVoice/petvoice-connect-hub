-- Funzione per resettare tutti gli esercizi di un protocollo quando viene riavviato
CREATE OR REPLACE FUNCTION public.reset_protocol_exercises(p_protocol_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Reset di tutti gli esercizi del protocollo
  UPDATE public.ai_training_exercises 
  SET 
    completed = false,
    completed_at = NULL,
    effectiveness_score = NULL,
    feedback = NULL,
    updated_at = NOW()
  WHERE protocol_id = p_protocol_id;
  
  -- Log dell'operazione
  INSERT INTO public.activity_log (
    user_id,
    activity_type,
    activity_description,
    metadata
  )
  SELECT 
    (SELECT user_id::uuid FROM public.ai_training_protocols WHERE id = p_protocol_id),
    'protocol_exercises_reset',
    'Esercizi del protocollo resettati per riavvio',
    jsonb_build_object(
      'protocol_id', p_protocol_id,
      'reset_date', NOW()
    );
END;
$function$;