-- 1. Rendi disponibile il protocollo "Gestione Ansia da Separazione" 
UPDATE ai_training_protocols 
SET 
  status = 'available',
  is_public = true,
  success_rate = 85.7,
  community_rating = 4.6,
  updated_at = now()
WHERE title = 'Gestione Ansia da Separazione';

-- 2. Aggiungi triggers/emozioni negative per collegare i protocolli alle analisi
-- Controllo Aggressività Reattiva - per emozioni di aggressività, stress, irritazione
UPDATE ai_training_protocols 
SET triggers = ARRAY['aggressivo', 'stressato', 'irritato', 'dominante', 'territoriale', 'reattivo']
WHERE title = 'Controllo Aggressività Reattiva';

-- Gestione Ansia da Separazione - per emozioni di ansia, paura, abbandono
UPDATE ai_training_protocols 
SET triggers = ARRAY['ansioso', 'spaventato', 'nervoso', 'depresso', 'solo', 'agitato']
WHERE title = 'Gestione Ansia da Separazione';

-- Socializzazione Progressiva - per emozioni di timidezza, paura sociale, isolamento
UPDATE ai_training_protocols 
SET triggers = ARRAY['timido', 'riservato', 'spaventato', 'insicuro', 'evitante', 'isolato']
WHERE title = 'Socializzazione Progressiva';

-- 3. Verifica finale
SELECT 
  title, 
  status, 
  is_public, 
  success_rate, 
  community_rating,
  triggers,
  duration_days
FROM ai_training_protocols 
ORDER BY title;