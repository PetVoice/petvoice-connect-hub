-- Reset success_rate dei protocolli pubblici a 0 se non hanno valutazioni reali
UPDATE ai_training_protocols 
SET success_rate = 0, community_rating = 0
WHERE is_public = true 
AND id NOT IN (SELECT DISTINCT protocol_id FROM protocol_ratings);

-- Aggiorna i protocolli che hanno valutazioni reali
UPDATE ai_training_protocols 
SET 
    success_rate = COALESCE((
        SELECT ((AVG(rating) - 1) / 9.0) * 100
        FROM protocol_ratings 
        WHERE protocol_id = ai_training_protocols.id
    ), 0),
    community_rating = COALESCE((
        SELECT AVG(rating)
        FROM protocol_ratings 
        WHERE protocol_id = ai_training_protocols.id
    ), 0)
WHERE id IN (SELECT DISTINCT protocol_id FROM protocol_ratings);

-- Verifica il risultato
SELECT p.id, p.title, p.success_rate, p.community_rating,
       (SELECT COUNT(*) FROM protocol_ratings WHERE protocol_id = p.id) as rating_count,
       (SELECT AVG(rating) FROM protocol_ratings WHERE protocol_id = p.id) as avg_rating
FROM ai_training_protocols p 
WHERE p.is_public = true 
ORDER BY rating_count DESC, p.title
LIMIT 10;