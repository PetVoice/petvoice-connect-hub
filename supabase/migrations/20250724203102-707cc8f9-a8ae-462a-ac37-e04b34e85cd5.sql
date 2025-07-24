-- Aggiorna ANCHE questo protocollo "Superare la Paura" (b0bea0b6-1786-4d22-9c3b-e65ea5acf14b)
-- con tutte le istruzioni dettagliate punto per punto

UPDATE ai_training_exercises AS target
SET 
  instructions = source.instructions,
  description = source.description,
  updated_at = NOW()
FROM ai_training_exercises AS source
WHERE target.protocol_id = 'b0bea0b6-1786-4d22-9c3b-e65ea5acf14b'
  AND source.protocol_id = '4799a1cb-dd9e-4d1e-ad10-809263f51e18'
  AND target.title = source.title;