-- Pulizia e riorganizzazione finale dei protocolli con esercizi corretti

-- Elimina protocolli duplicati mantenendo solo quelli con esercizi
DELETE FROM ai_training_protocols 
WHERE id NOT IN (
  SELECT DISTINCT protocol_id 
  FROM ai_training_exercises
);

-- Verifica che abbiamo i protocolli corretti
SELECT p.title, p.duration_days, COUNT(e.id) as exercises_count, p.category
FROM ai_training_protocols p 
LEFT JOIN ai_training_exercises e ON p.id = e.protocol_id 
GROUP BY p.id, p.title, p.duration_days, p.category 
ORDER BY p.category, p.title;