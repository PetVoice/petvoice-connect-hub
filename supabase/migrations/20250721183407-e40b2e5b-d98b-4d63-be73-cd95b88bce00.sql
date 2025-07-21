-- Correggi il vincolo per prediction_window
ALTER TABLE behavior_predictions DROP CONSTRAINT IF EXISTS behavior_predictions_prediction_window_check;

-- Aggiungi il vincolo corretto
ALTER TABLE behavior_predictions ADD CONSTRAINT behavior_predictions_prediction_window_check 
CHECK (prediction_window IN ('1_day', '7_days', '14_days', '30_days', '90_days'));

-- Inserisco dati di test
DO $$
DECLARE
    test_pet_id UUID;
    test_user_id UUID;
BEGIN
    -- Prendo il primo pet disponibile
    SELECT pets.id, pets.user_id INTO test_pet_id, test_user_id 
    FROM pets 
    WHERE pets.id IS NOT NULL 
    LIMIT 1;
    
    IF test_pet_id IS NOT NULL THEN
        -- Inserisco una previsione comportamentale
        INSERT INTO behavior_predictions (
            user_id, pet_id, prediction_date, prediction_window,
            predicted_behaviors, confidence_scores, contributing_factors
        ) VALUES (
            test_user_id, test_pet_id, CURRENT_DATE + INTERVAL '7 days', '7_days',
            '{"anxiety": 0.7, "playfulness": 0.3, "aggression": 0.1}',
            '{"anxiety": 0.85, "playfulness": 0.75, "aggression": 0.65}',
            '{"weather": "rainy", "recent_changes": "new_environment"}'
        );
        
        -- Inserisco un early warning
        INSERT INTO early_warnings (
            user_id, pet_id, warning_type, severity_level,
            pattern_detected, alert_message, suggested_actions
        ) VALUES (
            test_user_id, test_pet_id, 'behavioral_change', 'medium',
            '{"trend": "increasing_anxiety", "duration_days": 3}',
            'Il tuo pet sta mostrando segni crescenti di ansia negli ultimi giorni',
            '["Aumentare il tempo di gioco", "Considerare una consulenza veterinaria", "Monitorare l''ambiente"]'
        );
        
        -- Inserisco una raccomandazione di intervento
        INSERT INTO intervention_recommendations (
            user_id, pet_id, intervention_type, recommended_timing,
            priority_level, success_probability, estimated_cost,
            reasoning, expected_outcomes
        ) VALUES (
            test_user_id, test_pet_id, 'behavioral_training', NOW() + INTERVAL '2 days',
            'high', 0.85, 150.00,
            'Basato sui pattern comportamentali recenti, un training mirato può ridurre significativamente l''ansia',
            '{"anxiety_reduction": 0.6, "behavior_improvement": 0.7, "estimated_timeline_weeks": 4}'
        );
        
        RAISE NOTICE 'Dati di test inseriti per pet_id: %', test_pet_id;
    ELSE
        RAISE NOTICE 'Nessun pet trovato - crea prima un pet per testare il sistema';
    END IF;
END $$;