-- Attiva il protocollo dell'utente
UPDATE ai_training_protocols 
SET status = 'active', updated_at = now()
WHERE id = '68d3b442-7bb0-4fbb-a61a-8ce63d7c5214';

-- Verifica il risultato finale
SELECT p.id, p.title, p.status, COUNT(e.id) as exercise_count
FROM ai_training_protocols p 
LEFT JOIN ai_training_exercises e ON p.id = e.protocol_id 
WHERE p.id = '68d3b442-7bb0-4fbb-a61a-8ce63d7c5214'
GROUP BY p.id, p.title, p.status;