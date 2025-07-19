-- Elimina tutti gli esercizi esistenti per ricrearli correttamente
DELETE FROM ai_training_exercises;

-- Rimuovi i protocolli duplicati di "Socializzazione Progressiva"
DELETE FROM ai_training_protocols 
WHERE title = 'Socializzazione Progressiva' 
AND id != (
  SELECT id FROM ai_training_protocols 
  WHERE title = 'Socializzazione Progressiva' 
  ORDER BY created_at ASC 
  LIMIT 1
);

-- Verifica che ora abbiamo solo un protocollo per titolo
SELECT title, COUNT(*) as count 
FROM ai_training_protocols 
GROUP BY title 
HAVING COUNT(*) > 1;