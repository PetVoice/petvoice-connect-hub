-- Rimuovi i duplicati del protocollo "Gestione Ansia da Separazione"
-- Mantieni solo quello più recente pubblico (d19a882e-db8b-47f4-b760-371379f0a7ad)

-- Prima rimuovi gli esercizi dei protocolli duplicati
DELETE FROM ai_training_exercises 
WHERE protocol_id IN (
  'c0e3c4e3-aa10-45af-ab7d-4097c2002d40',
  '8eeac245-59dc-4776-a1d5-4f0de67811e7'
);

-- Poi rimuovi i protocolli duplicati
DELETE FROM ai_training_protocols 
WHERE id IN (
  'c0e3c4e3-aa10-45af-ab7d-4097c2002d40',
  '8eeac245-59dc-4776-a1d5-4f0de67811e7'
);