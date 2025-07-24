-- Aggiorna TUTTI i protocolli "Superare la Paura" che non sono ancora stati aggiornati
UPDATE ai_training_exercises AS target
SET 
  instructions = source.instructions,
  description = source.description,
  updated_at = NOW()
FROM ai_training_exercises AS source,
     ai_training_protocols AS target_protocol
WHERE target.protocol_id = target_protocol.id
  AND target_protocol.title = 'Superare la Paura'
  AND target.protocol_id != '4799a1cb-dd9e-4d1e-ad10-809263f51e18'  -- Escludi quello fonte
  AND source.protocol_id = '4799a1cb-dd9e-4d1e-ad10-809263f51e18'   -- Usa come fonte
  AND target.title = source.title;