-- Aggiorna community_usage con i valori reali basati sugli utilizzi effettivi
UPDATE ai_training_protocols 
SET community_usage = (
  SELECT COUNT(*)
  FROM ai_training_protocols used
  WHERE used.title = ai_training_protocols.title 
    AND used.user_id IS NOT NULL 
    AND used.id != ai_training_protocols.id
),
updated_at = now()
WHERE is_public = true;