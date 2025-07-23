-- Prima, salva eventuali protocolli utente dalla vecchia tabella (solo quelli con user_id non nullo)
CREATE TEMP TABLE user_protocols AS 
SELECT * FROM ai_training_protocols WHERE user_id IS NOT NULL;

-- Elimina la vecchia tabella ai_training_protocols 
DROP TABLE IF EXISTS ai_training_protocols CASCADE;

-- Rinomina ai_training_protocols1 in ai_training_protocols
ALTER TABLE ai_training_protocols1 RENAME TO ai_training_protocols;

-- Abilita RLS sulla nuova tabella
ALTER TABLE ai_training_protocols ENABLE ROW LEVEL SECURITY;

-- Ricrea le policy RLS
CREATE POLICY "Users can manage their own training protocols" ON ai_training_protocols
FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view public protocols" ON ai_training_protocols
FOR SELECT USING (is_public = true);

-- Ripristina eventuali protocolli utente (se ce ne erano)
INSERT INTO ai_training_protocols (
  id, user_id, pet_id, title_it, title_en, title_es,
  description_it, description_en, description_es,
  category_it, category_en, category_es,
  difficulty_it, difficulty_en, difficulty_es,
  duration_days, current_day, progress_percentage,
  status_it, status_en, status_es,
  target_behavior_it, target_behavior_en, target_behavior_es,
  triggers_it, triggers_en, triggers_es,
  required_materials_it, required_materials_en, required_materials_es,
  success_rate, ai_generated, is_public, veterinary_approved,
  community_rating, community_usage, mentor_recommended,
  notifications_enabled, last_activity_at, created_at, updated_at
)
SELECT 
  up.id, up.user_id, up.pet_id,
  up.title, up.title, up.title, -- Usa il titolo esistente per tutte le lingue
  up.description, up.description, up.description,
  up.category, up.category, up.category,
  up.difficulty, up.difficulty, up.difficulty,
  up.duration_days, up.current_day, up.progress_percentage,
  up.status, up.status, up.status,
  up.target_behavior, up.target_behavior, up.target_behavior,
  array_to_json(up.triggers)::jsonb, array_to_json(up.triggers)::jsonb, array_to_json(up.triggers)::jsonb,
  array_to_json(up.required_materials)::jsonb, array_to_json(up.required_materials)::jsonb, array_to_json(up.required_materials)::jsonb,
  up.success_rate, up.ai_generated, up.is_public, up.veterinary_approved,
  up.community_rating, up.community_usage, up.mentor_recommended,
  up.notifications_enabled, up.last_activity_at, up.created_at, up.updated_at
FROM user_protocols up
ON CONFLICT (id) DO NOTHING;

-- Cleanup
DROP TABLE IF EXISTS user_protocols;