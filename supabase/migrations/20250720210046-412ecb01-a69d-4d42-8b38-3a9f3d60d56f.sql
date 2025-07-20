-- Corregge il protocollo pubblico rimuovendo user_id
UPDATE ai_training_protocols 
SET user_id = NULL 
WHERE title = 'Stop Comportamenti Distruttivi' 
AND is_public = true 
AND id = '7036439d-8a2d-43dd-8a62-71b866f7b661';