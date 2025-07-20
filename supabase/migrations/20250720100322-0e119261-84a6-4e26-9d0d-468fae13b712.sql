-- Elimina i protocolli duplicati senza esercizi per l'utente
DELETE FROM ai_training_protocols 
WHERE title = 'Gestione Iperattività e Deficit Attenzione' 
  AND user_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5'
  AND id IN (
    SELECT p.id 
    FROM ai_training_protocols p 
    LEFT JOIN ai_training_exercises e ON p.id = e.protocol_id 
    WHERE p.title = 'Gestione Iperattività e Deficit Attenzione'
      AND p.user_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5'
    GROUP BY p.id 
    HAVING COUNT(e.id) = 0
  );

-- Elimina anche i protocolli pubblici duplicati senza esercizi
DELETE FROM ai_training_protocols 
WHERE title = 'Gestione Iperattività e Deficit Attenzione' 
  AND user_id IS NULL
  AND id IN (
    SELECT p.id 
    FROM ai_training_protocols p 
    LEFT JOIN ai_training_exercises e ON p.id = e.protocol_id 
    WHERE p.title = 'Gestione Iperattività e Deficit Attenzione'
      AND p.user_id IS NULL
    GROUP BY p.id 
    HAVING COUNT(e.id) = 0
  );

-- Verifica che rimanga solo il protocollo con gli esercizi
SELECT p.id, p.title, p.status, p.user_id, COUNT(e.id) as exercise_count
FROM ai_training_protocols p 
LEFT JOIN ai_training_exercises e ON p.id = e.protocol_id 
WHERE p.title = 'Gestione Iperattività e Deficit Attenzione' 
GROUP BY p.id, p.title, p.status, p.user_id;