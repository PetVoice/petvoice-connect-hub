-- Rimuovi il duplicato del protocollo "Socializzazione Progressiva"
-- Mantieni solo quello più recente pubblico (1ece2f5b-29cf-4f36-9987-26523a96e3f6)

-- Prima rimuovi gli esercizi del protocollo duplicato
DELETE FROM ai_training_exercises 
WHERE protocol_id = '7c482329-3f3c-44e6-b8b4-ef8d33c3d8cc';

-- Poi rimuovi il protocollo duplicato più vecchio
DELETE FROM ai_training_protocols 
WHERE id = '7c482329-3f3c-44e6-b8b4-ef8d33c3d8cc';