-- Aggiorna community_usage con il conteggio reale degli utilizzi per protocolli pubblici
UPDATE ai_training_protocols 
SET community_usage = (
  SELECT COUNT(*)::text
  FROM ai_training_protocols p2 
  WHERE p2.title = ai_training_protocols.title
    AND p2.user_id IS NOT NULL
    AND p2.user_id != ''
)::text,
updated_at = now()
WHERE is_public = true;