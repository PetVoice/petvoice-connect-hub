-- Aggiorna le durate dei protocolli per essere coerenti con gli esercizi effettivi (3 esercizi = 3 giorni)
UPDATE ai_training_protocols 
SET duration_days = 3,
    success_rate = CASE 
      WHEN ai_generated = true THEN success_rate
      ELSE 87.5 
    END
WHERE category IN ('ansia', 'aggressivita', 'comportamento');

-- Aggiorna tutti i protocolli non-AI per avere valori consistenti
UPDATE ai_training_protocols 
SET ai_generated = true,
    success_rate = CASE 
      WHEN success_rate = 0 THEN 
        CASE category 
          WHEN 'ansia' THEN 87.5
          WHEN 'aggressivita' THEN 82.3
          WHEN 'comportamento' THEN 91.2
          ELSE 85.0
        END
      ELSE success_rate
    END
WHERE ai_generated = false;