-- Aggiorna la funzione start_public_protocol per incrementare community_usage
CREATE OR REPLACE FUNCTION public.start_public_protocol(p_public_protocol_id uuid, p_user_id text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_new_protocol_id UUID;
  v_exercise_record RECORD;
  v_current_usage INTEGER;
BEGIN
  -- Crea una copia del protocollo pubblico per l'utente
  INSERT INTO public.ai_training_protocols (
    user_id,
    pet_id,
    title,
    description,
    category,
    difficulty,
    duration_days,
    status,
    current_day,
    progress_percentage,
    target_behavior,
    required_materials,
    triggers,
    estimated_cost,
    ai_generated,
    is_public,
    created_at,
    updated_at,
    last_activity_at
  )
  SELECT 
    p_user_id,
    NULL, -- pet_id sarà impostato dall'utente se necessario
    title,
    description,
    category,
    difficulty,
    duration_days,
    'active', -- Status attivo per l'utente
    1, -- Inizia dal giorno 1
    '0', -- Progresso 0%
    target_behavior,
    required_materials,
    triggers,
    estimated_cost,
    ai_generated,
    false, -- NON pubblico - è la copia personale
    NOW(),
    NOW(),
    NOW()
  FROM public.ai_training_protocols
  WHERE id = p_public_protocol_id AND is_public = true
  RETURNING id INTO v_new_protocol_id;

  -- Verifica che il protocollo sia stato creato
  IF v_new_protocol_id IS NULL THEN
    RAISE EXCEPTION 'Protocollo pubblico non trovato o non copiabile: %', p_public_protocol_id;
  END IF;

  -- Copia tutti gli esercizi del protocollo pubblico
  FOR v_exercise_record IN
    SELECT * FROM public.ai_training_exercises 
    WHERE protocol_id = p_public_protocol_id
  LOOP
    INSERT INTO public.ai_training_exercises (
      protocol_id,
      day_number,
      title,
      description,
      duration_minutes,
      exercise_type,
      instructions,
      materials,
      video_url,
      completed,
      created_at,
      updated_at
    ) VALUES (
      v_new_protocol_id,
      v_exercise_record.day_number,
      v_exercise_record.title,
      v_exercise_record.description,
      v_exercise_record.duration_minutes,
      v_exercise_record.exercise_type,
      v_exercise_record.instructions,
      v_exercise_record.materials,
      v_exercise_record.video_url,
      false, -- Tutti gli esercizi iniziano come non completati
      NOW(),
      NOW()
    );
  END LOOP;

  -- INCREMENTA il community_usage del protocollo pubblico
  SELECT COALESCE(CAST(community_usage AS INTEGER), 0) INTO v_current_usage
  FROM public.ai_training_protocols 
  WHERE id = p_public_protocol_id;
  
  UPDATE public.ai_training_protocols 
  SET 
    community_usage = CAST((v_current_usage + 1) AS TEXT),
    updated_at = NOW()
  WHERE id = p_public_protocol_id AND is_public = true;

  -- Log dell'utilizzo
  INSERT INTO public.activity_log (
    user_id,
    activity_type,
    activity_description,
    metadata
  ) VALUES (
    p_user_id::uuid,
    'protocol_started',
    'Protocollo pubblico avviato e utilizzi incrementati',
    jsonb_build_object(
      'public_protocol_id', p_public_protocol_id,
      'new_protocol_id', v_new_protocol_id,
      'previous_usage', v_current_usage,
      'new_usage', v_current_usage + 1
    )
  );

  RETURN v_new_protocol_id;
END;
$function$;