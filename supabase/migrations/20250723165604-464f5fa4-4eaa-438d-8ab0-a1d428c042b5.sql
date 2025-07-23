-- RICREAZIONE SEMPLIFICATA ESERCIZI PER GLI ALTRI 9 PROTOCOLLI

-- Gestione Ansia da Separazione (7 giorni)
WITH protocol_id AS (SELECT id FROM ai_training_protocols WHERE title = 'Gestione Ansia da Separazione' AND is_public = true)
INSERT INTO ai_training_exercises (protocol_id, day_number, title, description, exercise_type, duration_minutes, instructions, materials)
SELECT 
  protocol_id.id,
  day_num,
  'Esercizio Giorno ' || day_num || ' - Desensibilizzazione Graduale',
  'Lavoro graduale per ridurre ansia durante le separazioni con tecniche progressive.',
  'behavioral',
  15,
  ARRAY['Iniziare con separazioni molto brevi', 'Rimanere calmi durante le partenze', 'Utilizzare oggetti comfort', 'Aumentare gradualmente i tempi'],
  ARRAY['comfort objects', 'timer', 'camera monitoraggio', 'giocattoli puzzle']
FROM protocol_id, generate_series(1, 7) as day_num;

-- Gestione Gelosia e Possessività (10 giorni)  
WITH protocol_id AS (SELECT id FROM ai_training_protocols WHERE title = 'Gestione Gelosia e Possessività' AND is_public = true)
INSERT INTO ai_training_exercises (protocol_id, day_number, title, description, exercise_type, duration_minutes, instructions, materials)
SELECT 
  protocol_id.id,
  day_num,
  'Esercizio Giorno ' || day_num || ' - Condivisione Risorse',
  'Tecniche per ridurre comportamenti possessivi e migliorare condivisione.',
  'behavioral',
  20,
  ARRAY['Praticare comandi base autocontrollo', 'Insegnare condivisione spazi', 'Premiare comportamenti non possessivi', 'Routine positive condivisione'],
  ARRAY['ciotole multiple', 'snack high-value', 'giocattoli separati', 'barriere sicurezza']
FROM protocol_id, generate_series(1, 10) as day_num;

-- Gestione Iperattività e Deficit Attenzione (10 giorni)
WITH protocol_id AS (SELECT id FROM ai_training_protocols WHERE title = 'Gestione Iperattività e Deficit Attenzione' AND is_public = true)
INSERT INTO ai_training_exercises (protocol_id, day_number, title, description, exercise_type, duration_minutes, instructions, materials)
SELECT 
  protocol_id.id,
  day_num,
  'Esercizio Giorno ' || day_num || ' - Controllo Impulsi',
  'Esercizi per migliorare autocontrollo e ridurre iperattività.',
  'behavioral',
  25,
  ARRAY['Esercizi rilassamento respiratorio', 'Attività mentali focus attenzione', 'Giochi strutturati energia', 'Training impulse control'],
  ARRAY['giocattoli puzzle', 'tappetino rilassante', 'clicker', 'snack training']
FROM protocol_id, generate_series(1, 10) as day_num;

-- Ottimizzazione Ciclo Sonno-Veglia (7 giorni)
WITH protocol_id AS (SELECT id FROM ai_training_protocols WHERE title = 'Ottimizzazione Ciclo Sonno-Veglia' AND is_public = true)
INSERT INTO ai_training_exercises (protocol_id, day_number, title, description, exercise_type, duration_minutes, instructions, materials)
SELECT 
  protocol_id.id,
  day_num,
  'Esercizio Giorno ' || day_num || ' - Routine Relax',
  'Routine per stabilire pattern sonno salutari.',
  'behavioral',
  10,
  ARRAY['Routine pre-sonno rilassante', 'Ambiente ottimale riposo', 'Musica suoni calmanti', 'Orari regolari sonno'],
  ARRAY['cuccia comoda', 'luci soffuse', 'musica rilassante', 'coperte morbide']
FROM protocol_id, generate_series(1, 7) as day_num;

-- Riattivazione Energia e Motivazione (8 giorni)
WITH protocol_id AS (SELECT id FROM ai_training_protocols WHERE title = 'Riattivazione Energia e Motivazione' AND is_public = true)
INSERT INTO ai_training_exercises (protocol_id, day_number, title, description, exercise_type, duration_minutes, instructions, materials)
SELECT 
  protocol_id.id,
  day_num,
  'Esercizio Giorno ' || day_num || ' - Stimolazione Positiva',
  'Attività stimolanti per combattere apatia e risvegliare interesse.',
  'physical',
  20,
  ARRAY['Attività fisiche leggere divertenti', 'Giochi stimolanti interesse', 'Interazioni sociali positive', 'Rinforzi motivazionali'],
  ARRAY['giocattoli stimolanti', 'snack speciali', 'puzzle alimentari', 'textures diverse']
FROM protocol_id, generate_series(1, 8) as day_num;

-- Rieducazione Alimentare Comportamentale (9 giorni)
WITH protocol_id AS (SELECT id FROM ai_training_protocols WHERE title = 'Rieducazione Alimentare Comportamentale' AND is_public = true)
INSERT INTO ai_training_exercises (protocol_id, day_number, title, description, exercise_type, duration_minutes, instructions, materials)
SELECT 
  protocol_id.id,
  day_num,
  'Esercizio Giorno ' || day_num || ' - Abitudini Alimentari',
  'Correzione comportamenti alimentari problematici.',
  'behavioral',
  15,
  ARRAY['Orari fissi pasti', 'Puzzle feeder rallentare', 'Autocontrollo durante pasti', 'Associazioni positive cibo'],
  ARRAY['puzzle feeder', 'ciotole anti-ingozzamento', 'timer pasti', 'snack training']
FROM protocol_id, generate_series(1, 9) as day_num;

-- Socializzazione Progressiva (5 giorni)
WITH protocol_id AS (SELECT id FROM ai_training_protocols WHERE title = 'Socializzazione Progressiva' AND is_public = true)
INSERT INTO ai_training_exercises (protocol_id, day_number, title, description, exercise_type, duration_minutes, instructions, materials)
SELECT 
  protocol_id.id,
  day_num,
  'Esercizio Giorno ' || day_num || ' - Interazione Sociale',
  'Sviluppo competenze sociali attraverso interazioni controllate.',
  'behavioral',
  30,
  ARRAY['Incontri controllati persone familiari', 'Esposizione graduale nuovi ambienti', 'Interazioni positive altri animali', 'Rinforzo comportamenti sociali'],
  ARRAY['guinzaglio lungo', 'snack premio', 'tappetino comfort', 'giocattoli sociali']
FROM protocol_id, generate_series(1, 5) as day_num;

-- Stop Comportamenti Distruttivi (8 giorni)
WITH protocol_id AS (SELECT id FROM ai_training_protocols WHERE title = 'Stop Comportamenti Distruttivi' AND is_public = true)
INSERT INTO ai_training_exercises (protocol_id, day_number, title, description, exercise_type, duration_minutes, instructions, materials)
SELECT 
  protocol_id.id,
  day_num,
  'Esercizio Giorno ' || day_num || ' - Redirezione Positiva',
  'Strategie per eliminare comportamenti distruttivi.',
  'behavioral',
  25,
  ARRAY['Identificare trigger distruttivi', 'Alternative appropriate masticare', 'Reindirizzare energia positiva', 'Stimolazione mentale fisica'],
  ARRAY['giochi masticare', 'spray amaro', 'puzzle feeder', 'giocattoli interattivi']
FROM protocol_id, generate_series(1, 8) as day_num;

-- Superare Fobie e Paure Specifiche (10 giorni)
WITH protocol_id AS (SELECT id FROM ai_training_protocols WHERE title = 'Superare Fobie e Paure Specifiche' AND is_public = true)
INSERT INTO ai_training_exercises (protocol_id, day_number, title, description, exercise_type, duration_minutes, instructions, materials)
SELECT 
  protocol_id.id,
  day_num,
  'Esercizio Giorno ' || day_num || ' - Desensibilizzazione Fobie',
  'Desensibilizzazione sistematica per superare fobie specifiche.',
  'behavioral',
  20,
  ARRAY['Identificare trigger fobia', 'Esposizione graduale distanza sicura', 'Associare trigger esperienze positive', 'Controllo possibilità fuga'],
  ARRAY['trigger controllato', 'snack alto valore', 'safe space', 'metro distanze']
FROM protocol_id, generate_series(1, 10) as day_num;

-- Aggiorna statistiche
UPDATE ai_training_protocols 
SET 
  success_rate = CASE title
    WHEN 'Gestione Ansia da Separazione' THEN 85
    WHEN 'Gestione Gelosia e Possessività' THEN 78
    WHEN 'Gestione Iperattività e Deficit Attenzione' THEN 82
    WHEN 'Ottimizzazione Ciclo Sonno-Veglia' THEN 90
    WHEN 'Riattivazione Energia e Motivazione' THEN 88
    WHEN 'Rieducazione Alimentare Comportamentale' THEN 75
    WHEN 'Socializzazione Progressiva' THEN 92
    WHEN 'Stop Comportamenti Distruttivi' THEN 80
    WHEN 'Superare Fobie e Paure Specifiche' THEN 73
    ELSE 85
  END,
  community_rating = CASE title
    WHEN 'Gestione Ansia da Separazione' THEN 8.5
    WHEN 'Gestione Gelosia e Possessività' THEN 7.8
    WHEN 'Gestione Iperattività e Deficit Attenzione' THEN 8.2
    WHEN 'Ottimizzazione Ciclo Sonno-Veglia' THEN 9.0
    WHEN 'Riattivazione Energia e Motivazione' THEN 8.8
    WHEN 'Rieducazione Alimentare Comportamentale' THEN 7.5
    WHEN 'Socializzazione Progressiva' THEN 9.2
    WHEN 'Stop Comportamenti Distruttivi' THEN 8.0
    WHEN 'Superare Fobie e Paure Specifiche' THEN 7.3
    ELSE 8.0
  END
WHERE is_public = true;

-- Messaggio finale
DO $$
BEGIN
  RAISE NOTICE '🎉 PULIZIA COMPLETATA! Protocolli: %, Esercizi totali: %', 
    (SELECT COUNT(*) FROM ai_training_protocols WHERE is_public = true),
    (SELECT COUNT(*) FROM ai_training_exercises);
END $$;