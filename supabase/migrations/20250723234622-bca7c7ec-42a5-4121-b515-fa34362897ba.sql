-- Funzione per copiare un protocollo pubblico come protocollo personale attivo
CREATE OR REPLACE FUNCTION public.start_public_protocol(
  p_public_protocol_id UUID,
  p_user_id TEXT
) RETURNS UUID AS $$
DECLARE
  v_new_protocol_id UUID;
  v_exercise_record RECORD;
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

  RETURN v_new_protocol_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;