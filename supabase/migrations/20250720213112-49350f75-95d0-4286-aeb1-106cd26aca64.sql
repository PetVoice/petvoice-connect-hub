-- Rimuovi i protocolli duplicati di "Superare Fobie e Paure Specifiche"
-- Tieni solo quello più recente (12a29252-4ef5-4564-b943-46377ac252f9)

-- Prima rimuovi gli esercizi dei protocolli duplicati
DELETE FROM ai_training_exercises 
WHERE protocol_id IN ('e73afc47-6480-4c4e-a327-df8eac599100', '1d5ff1db-fe71-4c0f-818e-32c5ab6fef90');

-- Poi rimuovi i protocolli duplicati
DELETE FROM ai_training_protocols 
WHERE id IN ('e73afc47-6480-4c4e-a327-df8eac599100', '1d5ff1db-fe71-4c0f-818e-32c5ab6fef90');