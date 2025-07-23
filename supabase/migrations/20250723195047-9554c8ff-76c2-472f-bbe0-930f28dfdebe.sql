-- Sistemazione schema ai_training_protocols dopo cleanup multilingua

-- Correggi il tipo di id per essere UUID con default
ALTER TABLE ai_training_protocols 
ALTER COLUMN id SET DATA TYPE uuid USING id::uuid,
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Assicurati che tutti i campi numerici abbiano i tipi corretti
UPDATE ai_training_protocols 
SET 
  duration_days = COALESCE(duration_days, 7)::bigint,
  current_day = COALESCE(current_day, 1)::bigint,
  success_rate = COALESCE(success_rate, 0)::bigint,
  community_rating = COALESCE(community_rating, 0)::double precision
WHERE duration_days IS NULL OR current_day IS NULL OR success_rate IS NULL OR community_rating IS NULL;

-- Normalizza i campi di testo
UPDATE ai_training_protocols 
SET 
  difficulty = LOWER(difficulty),
  status = LOWER(status)
WHERE difficulty IS NOT NULL OR status IS NOT NULL;