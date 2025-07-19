-- Elimina i protocolli Test e Test2
DELETE FROM public.ai_training_protocols 
WHERE title IN ('Test', 'Test2');