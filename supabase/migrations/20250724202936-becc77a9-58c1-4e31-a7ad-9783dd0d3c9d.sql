-- Aggiorna QUESTO protocollo "Superare la Paura" (ce3124aa-375f-4418-b7a4-de355ac855a5)
-- copiando tutti gli esercizi aggiornati dal protocollo già fatto

UPDATE ai_training_exercises AS target
SET 
  instructions = source.instructions,
  description = source.description,
  updated_at = NOW()
FROM ai_training_exercises AS source
WHERE target.protocol_id = 'ce3124aa-375f-4418-b7a4-de355ac855a5'
  AND source.protocol_id = '4799a1cb-dd9e-4d1e-ad10-809263f51e18'
  AND target.title = source.title;