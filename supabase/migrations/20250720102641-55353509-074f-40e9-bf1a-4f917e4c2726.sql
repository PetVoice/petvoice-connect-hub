-- Attiva definitivamente il protocollo che ha gli esercizi
UPDATE ai_training_protocols 
SET status = 'active', updated_at = now()
WHERE id = '68d3b442-7bb0-4fbb-a61a-8ce63d7c5214';

-- Verifica lo stato finale
SELECT p.id, p.title, p.status, p.current_day, COUNT(e.id) as total_exercises,
       COUNT(CASE WHEN e.day_number = p.current_day THEN 1 END) as exercises_today
FROM ai_training_protocols p 
LEFT JOIN ai_training_exercises e ON p.id = e.protocol_id 
WHERE p.id = '68d3b442-7bb0-4fbb-a61a-8ce63d7c5214'
GROUP BY p.id, p.title, p.status, p.current_day;