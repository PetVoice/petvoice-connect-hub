UPDATE public.ai_training_exercises 
SET level = 'avanzato'
WHERE title = 'Training di Calma Avanzato' 
AND protocol_id IN (
  SELECT id FROM public.ai_training_protocols 
  WHERE title = 'Controllo dell''Aggressività' AND is_public = true
);