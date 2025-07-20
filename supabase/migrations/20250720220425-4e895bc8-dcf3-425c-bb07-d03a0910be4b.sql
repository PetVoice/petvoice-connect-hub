-- Rimuovi i duplicati del protocollo "Rieducazione Alimentare Comportamentale"
-- Mantieni solo quello più recente pubblico (bec45e80-b900-4058-b3c8-2da6e82464d0)

-- Prima rimuovi gli esercizi dei protocolli duplicati
DELETE FROM ai_training_exercises 
WHERE protocol_id IN (
  '83605705-3406-4fe2-9cbe-85c7b63efb62',
  '7c1e5b88-cf4c-4880-8335-3a5ed1101344', 
  '0bd3859e-18d2-49c6-8dc7-22667c743e44'
);

-- Poi rimuovi i protocolli duplicati
DELETE FROM ai_training_protocols 
WHERE id IN (
  '83605705-3406-4fe2-9cbe-85c7b63efb62',
  '7c1e5b88-cf4c-4880-8335-3a5ed1101344',
  '0bd3859e-18d2-49c6-8dc7-22667c743e44'
);