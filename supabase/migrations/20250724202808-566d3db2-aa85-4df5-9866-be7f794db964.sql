-- Aggiorna tutti gli altri esercizi di questo protocollo "Superare la Paura"
-- Prendo tutti gli esercizi dal protocollo '4799a1cb-dd9e-4d1e-ad10-809263f51e18' già aggiornato
-- e li copio in questo protocollo 'dcd5eb65-d547-4953-a7d6-57566bdd41dd'

UPDATE ai_training_exercises AS target
SET 
  instructions = source.instructions,
  description = source.description
FROM ai_training_exercises AS source
WHERE target.protocol_id = 'dcd5eb65-d547-4953-a7d6-57566bdd41dd'
  AND source.protocol_id = '4799a1cb-dd9e-4d1e-ad10-809263f51e18'
  AND target.title = source.title;