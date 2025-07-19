-- Aggiorna tutti i protocolli ai_generated per assicurarsi che siano disponibili e pubblici
UPDATE ai_training_protocols 
SET 
  status = 'available',
  is_public = true,
  user_id = NULL  -- I protocolli pubblici non devono avere user_id
WHERE ai_generated = true;

-- Verifica lo stato finale
SELECT title, status, is_public, user_id, ai_generated 
FROM ai_training_protocols 
ORDER BY title;