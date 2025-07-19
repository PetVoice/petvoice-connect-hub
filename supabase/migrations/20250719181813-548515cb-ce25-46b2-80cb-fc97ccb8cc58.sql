-- Correggi il protocollo "Gestione Ansia da Separazione" per essere AI-generated
UPDATE ai_training_protocols 
SET 
  ai_generated = true,
  user_id = NULL,
  is_public = true,
  status = 'available'
WHERE title = 'Gestione Ansia da Separazione';

-- Verifica il risultato
SELECT title, ai_generated, user_id, is_public, status 
FROM ai_training_protocols 
WHERE title = 'Gestione Ansia da Separazione';