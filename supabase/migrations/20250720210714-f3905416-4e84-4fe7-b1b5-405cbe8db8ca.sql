-- Rimuove tutti i protocolli attivi dell'utente
DELETE FROM ai_training_protocols 
WHERE user_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5' 
AND status = 'active';