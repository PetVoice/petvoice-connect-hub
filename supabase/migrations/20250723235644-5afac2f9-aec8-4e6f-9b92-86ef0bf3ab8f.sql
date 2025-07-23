-- Aggiusta lo status dei protocolli pubblici - non dovrebbero essere 'active'
UPDATE ai_training_protocols 
SET status = 'available' 
WHERE is_public = true AND status = 'active';