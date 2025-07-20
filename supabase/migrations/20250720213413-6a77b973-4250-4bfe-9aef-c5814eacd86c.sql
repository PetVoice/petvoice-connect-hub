-- Cambia lo status del protocollo da 'paused' a 'available'
UPDATE ai_training_protocols 
SET status = 'available'
WHERE id = '12a29252-4ef5-4564-b943-46377ac252f9';