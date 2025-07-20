-- Corregge il campo ai_generated per il protocollo Stop Comportamenti Distruttivi
UPDATE ai_training_protocols 
SET ai_generated = true 
WHERE title = 'Stop Comportamenti Distruttivi' 
AND id = '7036439d-8a2d-43dd-8a62-71b866f7b661';