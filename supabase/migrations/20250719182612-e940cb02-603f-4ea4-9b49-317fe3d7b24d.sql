-- Aggiorna le durate dei protocolli per essere più realistiche
UPDATE ai_training_protocols SET duration_days = 7 WHERE title = 'Gestione Ansia da Separazione';
UPDATE ai_training_protocols SET duration_days = 5 WHERE title = 'Socializzazione Progressiva';
UPDATE ai_training_protocols SET duration_days = 10 WHERE title = 'Gestione Gelosia e Possessività';
UPDATE ai_training_protocols SET duration_days = 8 WHERE title = 'Stop Comportamenti Distruttivi';
UPDATE ai_training_protocols SET duration_days = 10 WHERE title = 'Superare Fobie e Paure Specifiche';

-- Verifica le durate aggiornate
SELECT title, duration_days, success_rate, community_rating 
FROM ai_training_protocols 
ORDER BY title;