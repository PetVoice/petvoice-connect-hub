-- Crea una copia del protocollo per l'utente
INSERT INTO ai_training_protocols (
  title, description, category, difficulty, duration_days, 
  target_behavior, triggers, required_materials, 
  current_day, progress_percentage, status, success_rate, 
  ai_generated, is_public, veterinary_approved, 
  community_rating, community_usage, mentor_recommended, 
  notifications_enabled, last_activity_at, user_id
) VALUES (
  'Stop Comportamenti Distruttivi',
  'Programma completo per eliminare comportamenti distruttivi attraverso tecniche comportamentali avanzate e rinforzo positivo',
  'comportamento',
  'medio',
  8,
  'Ridurre comportamenti distruttivi',
  ARRAY['stress', 'noia', 'ansia da separazione', 'territorio'],
  ARRAY['premi', 'giochi', 'clicker'],
  1,
  0,
  'active',
  0,
  true,
  false,
  false,
  0,
  0,
  false,
  true,
  now(),
  '5d336311-bfc2-40f4-8cd8-3ad17bd246d5'
) RETURNING id;