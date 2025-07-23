-- Modifica numerazione esercizi da formato "giorno.esercizio" a numerazione sequenziale "1, 2, 3, ..."

-- PROTOCOLLO: Controllo Aggressività Reattiva (7 giorni x 3 esercizi = 21 esercizi)
WITH protocol_id AS (SELECT id FROM ai_training_protocols WHERE title = 'Controllo Aggressività Reattiva' AND is_public = true)
UPDATE ai_training_exercises 
SET title = CASE 
  WHEN day_number = 1 AND title LIKE '%1 - Gestione Soglia%' THEN 'Esercizio 1 - Gestione Soglia'
  WHEN day_number = 1 AND title LIKE '%2 - Controllo Impulsi%' THEN 'Esercizio 2 - Controllo Impulsi'  
  WHEN day_number = 1 AND title LIKE '%3 - Rinforzo Positivo%' THEN 'Esercizio 3 - Rinforzo Positivo'
  WHEN day_number = 2 AND title LIKE '%1 - Gestione Soglia%' THEN 'Esercizio 4 - Gestione Soglia'
  WHEN day_number = 2 AND title LIKE '%2 - Controllo Impulsi%' THEN 'Esercizio 5 - Controllo Impulsi'  
  WHEN day_number = 2 AND title LIKE '%3 - Rinforzo Positivo%' THEN 'Esercizio 6 - Rinforzo Positivo'
  WHEN day_number = 3 AND title LIKE '%1 - Gestione Soglia%' THEN 'Esercizio 7 - Gestione Soglia'
  WHEN day_number = 3 AND title LIKE '%2 - Controllo Impulsi%' THEN 'Esercizio 8 - Controllo Impulsi'  
  WHEN day_number = 3 AND title LIKE '%3 - Rinforzo Positivo%' THEN 'Esercizio 9 - Rinforzo Positivo'
  WHEN day_number = 4 AND title LIKE '%1 - Gestione Soglia%' THEN 'Esercizio 10 - Gestione Soglia'
  WHEN day_number = 4 AND title LIKE '%2 - Controllo Impulsi%' THEN 'Esercizio 11 - Controllo Impulsi'  
  WHEN day_number = 4 AND title LIKE '%3 - Rinforzo Positivo%' THEN 'Esercizio 12 - Rinforzo Positivo'
  WHEN day_number = 5 AND title LIKE '%1 - Gestione Soglia%' THEN 'Esercizio 13 - Gestione Soglia'
  WHEN day_number = 5 AND title LIKE '%2 - Controllo Impulsi%' THEN 'Esercizio 14 - Controllo Impulsi'  
  WHEN day_number = 5 AND title LIKE '%3 - Rinforzo Positivo%' THEN 'Esercizio 15 - Rinforzo Positivo'
  WHEN day_number = 6 AND title LIKE '%1 - Gestione Soglia%' THEN 'Esercizio 16 - Gestione Soglia'
  WHEN day_number = 6 AND title LIKE '%2 - Controllo Impulsi%' THEN 'Esercizio 17 - Controllo Impulsi'  
  WHEN day_number = 6 AND title LIKE '%3 - Rinforzo Positivo%' THEN 'Esercizio 18 - Rinforzo Positivo'
  WHEN day_number = 7 AND title LIKE '%1 - Gestione Soglia%' THEN 'Esercizio 19 - Gestione Soglia'
  WHEN day_number = 7 AND title LIKE '%2 - Controllo Impulsi%' THEN 'Esercizio 20 - Controllo Impulsi'  
  WHEN day_number = 7 AND title LIKE '%3 - Rinforzo Positivo%' THEN 'Esercizio 21 - Rinforzo Positivo'
  ELSE title
END
WHERE protocol_id = (SELECT id FROM protocol_id);

-- PROTOCOLLO: Gestione Ansia da Separazione (7 giorni x 3 esercizi = 21 esercizi)  
WITH protocol_id AS (SELECT id FROM ai_training_protocols WHERE title = 'Gestione Ansia da Separazione' AND is_public = true)
UPDATE ai_training_exercises 
SET title = 'Esercizio ' || ((day_number - 1) * 3 + 
  CASE 
    WHEN title LIKE '%Micro-Separazioni%' THEN 1
    WHEN title LIKE '%Oggetti Comfort%' THEN 2
    WHEN title LIKE '%Routine Partenza%' THEN 3
  END) || ' - ' || 
  CASE 
    WHEN title LIKE '%Micro-Separazioni%' THEN 'Micro-Separazioni' 
    WHEN title LIKE '%Oggetti Comfort%' THEN 'Oggetti Comfort'
    WHEN title LIKE '%Routine Partenza%' THEN 'Routine Partenza'
  END
WHERE protocol_id = (SELECT id FROM protocol_id);

-- PROTOCOLLO: Gestione Gelosia e Possessività (10 giorni x 3 esercizi = 30 esercizi)
WITH protocol_id AS (SELECT id FROM ai_training_protocols WHERE title = 'Gestione Gelosia e Possessività' AND is_public = true)
UPDATE ai_training_exercises 
SET title = 'Esercizio ' || ((day_number - 1) * 3 + 
  CASE 
    WHEN title LIKE '%Condivisione Spazi%' THEN 1
    WHEN title LIKE '%Controllo Risorse%' THEN 2
    WHEN title LIKE '%Socializzazione Guidata%' THEN 3
  END) || ' - ' || 
  CASE 
    WHEN title LIKE '%Condivisione Spazi%' THEN 'Condivisione Spazi'
    WHEN title LIKE '%Controllo Risorse%' THEN 'Controllo Risorse'
    WHEN title LIKE '%Socializzazione Guidata%' THEN 'Socializzazione Guidata'
  END
WHERE protocol_id = (SELECT id FROM protocol_id);

-- PROTOCOLLO: Gestione Iperattività e Deficit Attenzione (10 giorni x 3 esercizi = 30 esercizi)
WITH protocol_id AS (SELECT id FROM ai_training_protocols WHERE title = 'Gestione Iperattività e Deficit Attenzione' AND is_public = true)
UPDATE ai_training_exercises 
SET title = 'Esercizio ' || ((day_number - 1) * 3 + 
  CASE 
    WHEN title LIKE '%Focus e Attenzione%' THEN 1
    WHEN title LIKE '%Controllo Energia%' THEN 2
    WHEN title LIKE '%Rilassamento Guidato%' THEN 3
  END) || ' - ' || 
  CASE 
    WHEN title LIKE '%Focus e Attenzione%' THEN 'Focus e Attenzione'
    WHEN title LIKE '%Controllo Energia%' THEN 'Controllo Energia'
    WHEN title LIKE '%Rilassamento Guidato%' THEN 'Rilassamento Guidato'
  END
WHERE protocol_id = (SELECT id FROM protocol_id);

-- PROTOCOLLO: Ottimizzazione Ciclo Sonno-Veglia (7 giorni x 3 esercizi = 21 esercizi)
WITH protocol_id AS (SELECT id FROM ai_training_protocols WHERE title = 'Ottimizzazione Ciclo Sonno-Veglia' AND is_public = true)
UPDATE ai_training_exercises 
SET title = 'Esercizio ' || ((day_number - 1) * 3 + 
  CASE 
    WHEN title LIKE '%Routine Pre-Sonno%' THEN 1
    WHEN title LIKE '%Ambiente Ottimale%' THEN 2
    WHEN title LIKE '%Regolarità Orari%' THEN 3
  END) || ' - ' || 
  CASE 
    WHEN title LIKE '%Routine Pre-Sonno%' THEN 'Routine Pre-Sonno'
    WHEN title LIKE '%Ambiente Ottimale%' THEN 'Ambiente Ottimale'
    WHEN title LIKE '%Regolarità Orari%' THEN 'Regolarità Orari'
  END
WHERE protocol_id = (SELECT id FROM protocol_id);

-- PROTOCOLLO: Riattivazione Energia e Motivazione (8 giorni x 3 esercizi = 24 esercizi)
WITH protocol_id AS (SELECT id FROM ai_training_protocols WHERE title = 'Riattivazione Energia e Motivazione' AND is_public = true)
UPDATE ai_training_exercises 
SET title = 'Esercizio ' || ((day_number - 1) * 3 + 
  CASE 
    WHEN title LIKE '%Stimolazione Fisica%' THEN 1
    WHEN title LIKE '%Giochi Motivazionali%' THEN 2
    WHEN title LIKE '%Socializzazione Attiva%' THEN 3
  END) || ' - ' || 
  CASE 
    WHEN title LIKE '%Stimolazione Fisica%' THEN 'Stimolazione Fisica'
    WHEN title LIKE '%Giochi Motivazionali%' THEN 'Giochi Motivazionali'
    WHEN title LIKE '%Socializzazione Attiva%' THEN 'Socializzazione Attiva'
  END
WHERE protocol_id = (SELECT id FROM protocol_id);

-- PROTOCOLLO: Rieducazione Alimentare Comportamentale (9 giorni x 3 esercizi = 27 esercizi)
WITH protocol_id AS (SELECT id FROM ai_training_protocols WHERE title = 'Rieducazione Alimentare Comportamentale' AND is_public = true)
UPDATE ai_training_exercises 
SET title = 'Esercizio ' || ((day_number - 1) * 3 + 
  CASE 
    WHEN title LIKE '%Orari e Routine%' THEN 1
    WHEN title LIKE '%Controllo Velocità%' THEN 2
    WHEN title LIKE '%Associazioni Positive%' THEN 3
  END) || ' - ' || 
  CASE 
    WHEN title LIKE '%Orari e Routine%' THEN 'Orari e Routine'
    WHEN title LIKE '%Controllo Velocità%' THEN 'Controllo Velocità'
    WHEN title LIKE '%Associazioni Positive%' THEN 'Associazioni Positive'
  END
WHERE protocol_id = (SELECT id FROM protocol_id);

-- PROTOCOLLO: Socializzazione Progressiva (5 giorni x 3 esercizi = 15 esercizi)
WITH protocol_id AS (SELECT id FROM ai_training_protocols WHERE title = 'Socializzazione Progressiva' AND is_public = true)
UPDATE ai_training_exercises 
SET title = 'Esercizio ' || ((day_number - 1) * 3 + 
  CASE 
    WHEN title LIKE '%Incontri Controllati%' THEN 1
    WHEN title LIKE '%Nuovi Ambienti%' THEN 2
    WHEN title LIKE '%Interazioni Multi-Specie%' THEN 3
  END) || ' - ' || 
  CASE 
    WHEN title LIKE '%Incontri Controllati%' THEN 'Incontri Controllati'
    WHEN title LIKE '%Nuovi Ambienti%' THEN 'Nuovi Ambienti'
    WHEN title LIKE '%Interazioni Multi-Specie%' THEN 'Interazioni Multi-Specie'
  END
WHERE protocol_id = (SELECT id FROM protocol_id);

-- PROTOCOLLO: Stop Comportamenti Distruttivi (8 giorni x 3 esercizi = 24 esercizi)
WITH protocol_id AS (SELECT id FROM ai_training_protocols WHERE title = 'Stop Comportamenti Distruttivi' AND is_public = true)
UPDATE ai_training_exercises 
SET title = 'Esercizio ' || ((day_number - 1) * 3 + 
  CASE 
    WHEN title LIKE '%Identificazione Trigger%' THEN 1
    WHEN title LIKE '%Redirezione Comportamento%' THEN 2
    WHEN title LIKE '%Alternative Positive%' THEN 3
  END) || ' - ' || 
  CASE 
    WHEN title LIKE '%Identificazione Trigger%' THEN 'Identificazione Trigger'
    WHEN title LIKE '%Redirezione Comportamento%' THEN 'Redirezione Comportamento'
    WHEN title LIKE '%Alternative Positive%' THEN 'Alternative Positive'
  END
WHERE protocol_id = (SELECT id FROM protocol_id);

-- PROTOCOLLO: Superare Fobie e Paure Specifiche (10 giorni x 3 esercizi = 30 esercizi)
WITH protocol_id AS (SELECT id FROM ai_training_protocols WHERE title = 'Superare Fobie e Paure Specifiche' AND is_public = true)
UPDATE ai_training_exercises 
SET title = 'Esercizio ' || ((day_number - 1) * 3 + 
  CASE 
    WHEN title LIKE '%Desensibilizzazione Graduale%' THEN 1
    WHEN title LIKE '%Controesposizione Positiva%' THEN 2
    WHEN title LIKE '%Costruzione Fiducia%' THEN 3
  END) || ' - ' || 
  CASE 
    WHEN title LIKE '%Desensibilizzazione Graduale%' THEN 'Desensibilizzazione Graduale'
    WHEN title LIKE '%Controesposizione Positiva%' THEN 'Controesposizione Positiva'
    WHEN title LIKE '%Costruzione Fiducia%' THEN 'Costruzione Fiducia'
  END
WHERE protocol_id = (SELECT id FROM protocol_id);

-- Messaggio finale
DO $$
BEGIN
  RAISE NOTICE '✅ Numerazione esercizi aggiornata! Gli esercizi ora usano numeri sequenziali (1, 2, 3, ...) invece del formato giorno.esercizio';
END $$;