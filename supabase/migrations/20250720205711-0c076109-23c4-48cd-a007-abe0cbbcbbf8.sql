-- Ripristina il protocollo come pubblico e disponibile
UPDATE ai_training_protocols 
SET is_public = true, status = 'available' 
WHERE title = 'Stop Comportamenti Distruttivi' 
AND id = '7036439d-8a2d-43dd-8a62-71b866f7b661';