-- Rimuovi il duplicato più vecchio di "Ottimizzazione Ciclo Sonno-Veglia"
-- Mantieni solo quello più recente (68a5aaea-cdd2-4300-86fd-5119eda67ec6)

-- Prima rimuovi gli esercizi del protocollo duplicato
DELETE FROM ai_training_exercises 
WHERE protocol_id = 'd844c73e-97be-4aa6-b951-81555f0eb7fb';

-- Poi rimuovi il protocollo duplicato
DELETE FROM ai_training_protocols 
WHERE id = 'd844c73e-97be-4aa6-b951-81555f0eb7fb';