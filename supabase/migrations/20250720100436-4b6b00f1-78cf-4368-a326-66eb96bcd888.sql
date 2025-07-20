-- Elimina anche il protocollo attivo senza esercizi
DELETE FROM ai_training_protocols 
WHERE title = 'Gestione Iperattività e Deficit Attenzione' 
  AND user_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5'
  AND id = '44b68a8d-8fed-428d-93fc-5dc6777d58e2';

-- Verifica che sia rimasto solo quello con esercizi
SELECT p.id, p.title, p.status, p.is_public, p.user_id, COUNT(e.id) as exercise_count
FROM ai_training_protocols p 
LEFT JOIN ai_training_exercises e ON p.id = e.protocol_id 
WHERE p.title = 'Gestione Iperattività e Deficit Attenzione'
GROUP BY p.id, p.title, p.status, p.is_public, p.user_id;