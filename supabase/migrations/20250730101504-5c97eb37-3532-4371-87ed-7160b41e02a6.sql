-- Elimina il record di respirazione problematico per questo pet specifico
DELETE FROM public.health_metrics 
WHERE pet_id = 'e5a4d77d-7c92-49fe-8999-d6248194b2a8' 
  AND user_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5' 
  AND metric_type = 'respiration';