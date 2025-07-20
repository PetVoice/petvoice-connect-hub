-- Rimuovo protocolli duplicati di "Stop Comportamenti Distruttivi"
-- Mantengo solo il più recente e rimuovo i precedenti
WITH duplicates AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
  FROM ai_training_protocols 
  WHERE title = 'Stop Comportamenti Distruttivi'
)
DELETE FROM ai_training_protocols 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);