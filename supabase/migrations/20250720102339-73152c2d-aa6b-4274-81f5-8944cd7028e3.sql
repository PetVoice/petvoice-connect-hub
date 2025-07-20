-- Elimina i protocolli duplicati senza esercizi
DELETE FROM ai_training_protocols 
WHERE title = 'Gestione Iperattività e Deficit Attenzione' 
  AND user_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5'
  AND id IN ('91b2da30-f5a1-4651-89f1-693c5ec86da5', '54a8ad7e-fe5b-44d0-bce2-95a953797684', 'ff96c209-1342-46e2-82ba-652f353a3639');

-- Attiva il protocollo con gli esercizi
UPDATE ai_training_protocols 
SET status = 'active', updated_at = now()
WHERE id = '68d3b442-7bb0-4fbb-a61a-8ce63d7c5214';

-- Verifica il risultato
SELECT p.id, p.title, p.status, COUNT(e.id) as exercise_count
FROM ai_training_protocols p 
LEFT JOIN ai_training_exercises e ON p.id = e.protocol_id 
WHERE p.title = 'Gestione Iperattività e Deficit Attenzione'
  AND p.user_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5'
GROUP BY p.id, p.title, p.status;