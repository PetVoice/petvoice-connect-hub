-- Copia tutti gli esercizi dal protocollo pubblico a quello dell'utente
INSERT INTO ai_training_exercises (
  protocol_id, title, description, exercise_type, day_number, 
  duration_minutes, instructions, materials, effectiveness_score
)
SELECT 
  '4fe772dd-ad64-4231-9129-5f784ed866bb', -- ID del protocollo dell'utente
  title, description, exercise_type, day_number,
  duration_minutes, instructions, materials, effectiveness_score
FROM ai_training_exercises 
WHERE protocol_id = '7036439d-8a2d-43dd-8a62-71b866f7b661' -- ID del protocollo pubblico
ORDER BY day_number, created_at;