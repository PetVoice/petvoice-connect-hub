-- Rimuovi il duplicato del protocollo "Controllo Aggressività Reattiva"
-- Mantieni solo quello più recente pubblico (abe1baef-06fe-4850-aaf6-1defa06a2dff)

-- Prima rimuovi gli esercizi del protocollo duplicato
DELETE FROM ai_training_exercises 
WHERE protocol_id = 'a6b8ca21-c042-4a9a-9739-9d7ead57c209';

-- Poi rimuovi il protocollo duplicato più vecchio
DELETE FROM ai_training_protocols 
WHERE id = 'a6b8ca21-c042-4a9a-9739-9d7ead57c209';