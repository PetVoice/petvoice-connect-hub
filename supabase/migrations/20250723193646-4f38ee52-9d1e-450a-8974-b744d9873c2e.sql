-- PULIZIA COMPLETA SISTEMA MULTILINGUA
-- Rimuove tutte le colonne multilingua e mantiene solo l'italiano

-- Step 1: Crea nuove colonne semplici con dati italiani
ALTER TABLE ai_training_protocols 
ADD COLUMN title text,
ADD COLUMN description text,
ADD COLUMN category text,
ADD COLUMN difficulty text,
ADD COLUMN status text,
ADD COLUMN target_behavior text,
ADD COLUMN triggers jsonb,
ADD COLUMN required_materials jsonb;

-- Step 2: Copia i dati italiani nelle nuove colonne
UPDATE ai_training_protocols SET
  title = COALESCE(title_it, title_en, title_es),
  description = COALESCE(description_it, description_en, description_es),
  category = COALESCE(category_it, category_en, category_es),
  difficulty = COALESCE(difficulty_it, difficulty_en, difficulty_es),
  status = COALESCE(status_it, status_en, status_es),
  target_behavior = COALESCE(target_behavior_it, target_behavior_en, target_behavior_es),
  triggers = COALESCE(triggers_it, triggers_en, triggers_es),
  required_materials = COALESCE(required_materials_it, required_materials_en, required_materials_es);

-- Step 3: Rimuove tutte le colonne multilingua
ALTER TABLE ai_training_protocols 
DROP COLUMN IF EXISTS title_it,
DROP COLUMN IF EXISTS title_en,
DROP COLUMN IF EXISTS title_es,
DROP COLUMN IF EXISTS description_it,
DROP COLUMN IF EXISTS description_en,
DROP COLUMN IF EXISTS description_es,
DROP COLUMN IF EXISTS category_it,
DROP COLUMN IF EXISTS category_en,
DROP COLUMN IF EXISTS category_es,
DROP COLUMN IF EXISTS difficulty_it,
DROP COLUMN IF EXISTS difficulty_en,
DROP COLUMN IF EXISTS difficulty_es,
DROP COLUMN IF EXISTS status_it,
DROP COLUMN IF EXISTS status_en,
DROP COLUMN IF EXISTS status_es,
DROP COLUMN IF EXISTS target_behavior_it,
DROP COLUMN IF EXISTS target_behavior_en,
DROP COLUMN IF EXISTS target_behavior_es,
DROP COLUMN IF EXISTS triggers_it,
DROP COLUMN IF EXISTS triggers_en,
DROP COLUMN IF EXISTS triggers_es,
DROP COLUMN IF EXISTS required_materials_it,
DROP COLUMN IF EXISTS required_materials_en,
DROP COLUMN IF EXISTS required_materials_es;

-- Step 4: Rimuove colonna language da profiles se esiste
ALTER TABLE profiles DROP COLUMN IF EXISTS language;

-- Step 5: Elimina le funzioni di traduzione se esistono
DROP FUNCTION IF EXISTS translate_italian_to_english(text);
DROP FUNCTION IF EXISTS translate_english_to_italian(text);