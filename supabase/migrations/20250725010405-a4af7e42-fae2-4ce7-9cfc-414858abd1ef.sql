-- Standardizza le difficoltà dei protocolli a solo 3 livelli: facile, intermedio, difficile

-- Cambia "medio" in "facile" 
UPDATE ai_training_protocols 
SET difficulty = 'facile'
WHERE difficulty = 'medio';

-- Cambia "avanzato" in "difficile"
UPDATE ai_training_protocols 
SET difficulty = 'difficile' 
WHERE difficulty = 'avanzato';

-- Verifica che ora abbiamo solo 3 livelli standard
-- Mostra il riepilogo delle difficoltà dopo l'aggiornamento