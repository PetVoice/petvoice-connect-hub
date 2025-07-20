-- Copia tutti gli esercizi dal protocollo pubblico a quello dell'utente
INSERT INTO ai_training_exercises (
  protocol_id, title, description, exercise_type, day_number, 
  duration_minutes, instructions, materials, effectiveness_score
)
SELECT 
  '68d3b442-7bb0-4fbb-a61a-8ce63d7c5214'::uuid as protocol_id,
  title, description, exercise_type, day_number,
  duration_minutes, instructions, materials, effectiveness_score
FROM ai_training_exercises 
WHERE protocol_id = 'f1e2d3c4-b5a6-4d5c-8f9e-1a2b3c4d5e6f';

-- Verifica che gli esercizi siano stati copiati
SELECT COUNT(*) as exercises_copied 
FROM ai_training_exercises 
WHERE protocol_id = '68d3b442-7bb0-4fbb-a61a-8ce63d7c5214';