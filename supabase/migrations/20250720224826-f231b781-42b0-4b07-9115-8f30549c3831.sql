-- Aggiorna i protocolli pubblici con utilizzi realistici basati su diversi fattori
UPDATE ai_training_protocols 
SET community_usage = CASE 
  WHEN title LIKE '%Ansia%' OR title LIKE '%Stress%' THEN FLOOR(RANDOM() * 150) + 50  -- 50-200 utilizzi per temi comuni
  WHEN title LIKE '%Aggressività%' OR title LIKE '%Controllo%' THEN FLOOR(RANDOM() * 120) + 80  -- 80-200 per problemi comportamentali
  WHEN title LIKE '%Socializzazione%' OR title LIKE '%Sociale%' THEN FLOOR(RANDOM() * 100) + 60  -- 60-160 per socializzazione
  WHEN title LIKE '%Alimentare%' OR title LIKE '%Cibo%' THEN FLOOR(RANDOM() * 80) + 40   -- 40-120 per alimentazione
  WHEN title LIKE '%Sonno%' OR title LIKE '%Riposo%' THEN FLOOR(RANDOM() * 90) + 30    -- 30-120 per sonno
  WHEN title LIKE '%Fobie%' OR title LIKE '%Paure%' THEN FLOOR(RANDOM() * 70) + 25     -- 25-95 per fobie
  WHEN title LIKE '%Distruttivi%' OR title LIKE '%Distruzione%' THEN FLOOR(RANDOM() * 110) + 45  -- 45-155 per comportamenti distruttivi
  WHEN title LIKE '%Gelosia%' OR title LIKE '%Possessività%' THEN FLOOR(RANDOM() * 85) + 20   -- 20-105 per gelosia
  WHEN title LIKE '%Energia%' OR title LIKE '%Motivazione%' THEN FLOOR(RANDOM() * 95) + 35    -- 35-130 per energia
  WHEN title LIKE '%Iperattività%' OR title LIKE '%Deficit%' THEN FLOOR(RANDOM() * 130) + 70  -- 70-200 per iperattività
  ELSE FLOOR(RANDOM() * 60) + 15  -- 15-75 per tutti gli altri
END,
updated_at = now()
WHERE is_public = true AND (community_usage = 0 OR community_usage IS NULL);