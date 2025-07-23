-- MODIFICA: 3 esercizi per ogni giorno di ogni protocollo

-- Elimina tutti gli esercizi esistenti
DELETE FROM ai_training_exercises;

-- PROTOCOLLO: Controllo Aggressività Reattiva (7 giorni x 3 esercizi = 21 esercizi)
WITH protocol_id AS (SELECT id FROM ai_training_protocols WHERE title = 'Controllo Aggressività Reattiva' AND is_public = true)
INSERT INTO ai_training_exercises (protocol_id, day_number, title, description, exercise_type, duration_minutes, instructions, materials)
SELECT 
  protocol_id.id,
  day_num,
  CASE exercise_num
    WHEN 1 THEN 'Esercizio ' || day_num || '.1 - Gestione Soglia'
    WHEN 2 THEN 'Esercizio ' || day_num || '.2 - Controllo Impulsi'  
    WHEN 3 THEN 'Esercizio ' || day_num || '.3 - Rinforzo Positivo'
  END,
  CASE exercise_num
    WHEN 1 THEN 'Identificazione e gestione della soglia di reattività dell''animale.'
    WHEN 2 THEN 'Tecniche per migliorare l''autocontrollo in situazioni di stress.'
    WHEN 3 THEN 'Rinforzo dei comportamenti calmi e appropriati.'
  END,
  'behavioral',
  CASE exercise_num WHEN 1 THEN 20 WHEN 2 THEN 15 WHEN 3 THEN 10 END,
  CASE exercise_num
    WHEN 1 THEN ARRAY['Osservare segnali corporei', 'Mantenere distanza sicura', 'Identificare trigger', 'Documentare reazioni']
    WHEN 2 THEN ARRAY['Esercizi respirazione', 'Comandi di base', 'Distrazione positiva', 'Controllo ambiente']
    WHEN 3 THEN ARRAY['Premiare comportamenti calmi', 'Ignorare reazioni negative', 'Timing rinforzi', 'Variare ricompense']
  END,
  CASE exercise_num
    WHEN 1 THEN ARRAY['guinzaglio lungo', 'clicker', 'metro distanze', 'diario osservazioni']
    WHEN 2 THEN ARRAY['snack high-value', 'giocattoli distrazione', 'tappetino rilassante', 'timer']
    WHEN 3 THEN ARRAY['snack premio', 'giocattoli preferiti', 'carezze', 'voce calma']
  END
FROM protocol_id, generate_series(1, 7) as day_num, generate_series(1, 3) as exercise_num;

-- PROTOCOLLO: Gestione Ansia da Separazione (7 giorni x 3 esercizi = 21 esercizi)
WITH protocol_id AS (SELECT id FROM ai_training_protocols WHERE title = 'Gestione Ansia da Separazione' AND is_public = true)
INSERT INTO ai_training_exercises (protocol_id, day_number, title, description, exercise_type, duration_minutes, instructions, materials)
SELECT 
  protocol_id.id,
  day_num,
  CASE exercise_num
    WHEN 1 THEN 'Esercizio ' || day_num || '.1 - Micro-Separazioni'
    WHEN 2 THEN 'Esercizio ' || day_num || '.2 - Oggetti Comfort'
    WHEN 3 THEN 'Esercizio ' || day_num || '.3 - Routine Partenza'
  END,
  CASE exercise_num
    WHEN 1 THEN 'Separazioni progressive di durata molto breve per abituare gradualmente.'
    WHEN 2 THEN 'Utilizzo di oggetti familiari per creare sicurezza durante l''assenza.'
    WHEN 3 THEN 'Creazione di routine positive associate alla partenza del proprietario.'
  END,
  'behavioral',
  CASE exercise_num WHEN 1 THEN 10 WHEN 2 THEN 15 WHEN 3 THEN 20 END,
  CASE exercise_num
    WHEN 1 THEN ARRAY['Iniziare con 30 secondi', 'Aumentare gradualmente tempo', 'Rimanere calmi', 'Non drammatizzare uscite']
    WHEN 2 THEN ARRAY['Scegliere oggetto familiare', 'Lasciare sempre disponibile', 'Associare a momenti positivi', 'Ruotare oggetti']
    WHEN 3 THEN ARRAY['Routine pre-partenza calma', 'Evitare eccessive coccole', 'Ignorare comportamenti ansiosi', 'Premiare calma']
  END,
  CASE exercise_num
    WHEN 1 THEN ARRAY['timer', 'camera monitoraggio', 'chiavi', 'borsa']
    WHEN 2 THEN ARRAY['peluche preferito', 'coperta', 'maglietta proprietario', 'giocattolo speciale']
    WHEN 3 THEN ARRAY['snack speciali', 'giocattolo puzzle', 'musica rilassante', 'routine checklist']
  END
FROM protocol_id, generate_series(1, 7) as day_num, generate_series(1, 3) as exercise_num;

-- PROTOCOLLO: Gestione Gelosia e Possessività (10 giorni x 3 esercizi = 30 esercizi)
WITH protocol_id AS (SELECT id FROM ai_training_protocols WHERE title = 'Gestione Gelosia e Possessività' AND is_public = true)
INSERT INTO ai_training_exercises (protocol_id, day_number, title, description, exercise_type, duration_minutes, instructions, materials)
SELECT 
  protocol_id.id,
  day_num,
  CASE exercise_num
    WHEN 1 THEN 'Esercizio ' || day_num || '.1 - Condivisione Spazi'
    WHEN 2 THEN 'Esercizio ' || day_num || '.2 - Controllo Risorse'
    WHEN 3 THEN 'Esercizio ' || day_num || '.3 - Socializzazione Guidata'
  END,
  CASE exercise_num
    WHEN 1 THEN 'Insegnamento della condivisione degli spazi comuni senza aggressività.'
    WHEN 2 THEN 'Gestione delle risorse (cibo, giocattoli) in modo pacifico.'
    WHEN 3 THEN 'Interazioni positive con altri animali o persone sotto supervisione.'
  END,
  'behavioral',
  CASE exercise_num WHEN 1 THEN 20 WHEN 2 THEN 25 WHEN 3 THEN 15 END,
  CASE exercise_num
    WHEN 1 THEN ARRAY['Definire spazi neutri', 'Supervisionare interazioni', 'Premiare condivisione', 'Ignorare comportamenti possessivi']
    WHEN 2 THEN ARRAY['Ciotole separate inizialmente', 'Avvicinare gradualmente', 'Premiare calma', 'Gestire conflitti']
    WHEN 3 THEN ARRAY['Incontri controllati', 'Distanze sicure', 'Rinforzi positivi', 'Sessioni brevi']
  END,
  CASE exercise_num
    WHEN 1 THEN ARRAY['barriere sicurezza', 'tappetini separati', 'snack premio', 'giocattoli multipli']
    WHEN 2 THEN ARRAY['ciotole multiple', 'snack high-value', 'divisori removibili', 'timer sessioni']
    WHEN 3 THEN ARRAY['guinzaglio lungo', 'snack speciali', 'giocattoli neutri', 'spazio aperto']
  END
FROM protocol_id, generate_series(1, 10) as day_num, generate_series(1, 3) as exercise_num;

-- PROTOCOLLO: Gestione Iperattività e Deficit Attenzione (10 giorni x 3 esercizi = 30 esercizi)
WITH protocol_id AS (SELECT id FROM ai_training_protocols WHERE title = 'Gestione Iperattività e Deficit Attenzione' AND is_public = true)
INSERT INTO ai_training_exercises (protocol_id, day_number, title, description, exercise_type, duration_minutes, instructions, materials)
SELECT 
  protocol_id.id,
  day_num,
  CASE exercise_num
    WHEN 1 THEN 'Esercizio ' || day_num || '.1 - Focus e Attenzione'
    WHEN 2 THEN 'Esercizio ' || day_num || '.2 - Controllo Energia'
    WHEN 3 THEN 'Esercizio ' || day_num || '.3 - Rilassamento Guidato'
  END,
  CASE exercise_num
    WHEN 1 THEN 'Esercizi per migliorare concentrazione e mantenimento dell''attenzione.'
    WHEN 2 THEN 'Canalizzare l''energia in eccesso attraverso attività strutturate.'
    WHEN 3 THEN 'Tecniche di rilassamento per ridurre l''iperattivazione.'
  END,
  'behavioral',
  CASE exercise_num WHEN 1 THEN 15 WHEN 2 THEN 30 WHEN 3 THEN 20 END,
  CASE exercise_num
    WHEN 1 THEN ARRAY['Comandi di base ripetuti', 'Esercizi di "guarda"', 'Aumentare durata focus', 'Premiare attenzione']
    WHEN 2 THEN ARRAY['Attività fisiche intense', 'Giochi interattivi', 'Percorsi agility', 'Alternare attività']
    WHEN 3 THEN ARRAY['Respirazione guidata', 'Massaggi rilassanti', 'Musica calma', 'Ambiente tranquillo']
  END,
  CASE exercise_num
    WHEN 1 THEN ARRAY['clicker', 'snack micro', 'target stick', 'timer sessioni']
    WHEN 2 THEN ARRAY['palla', 'corda', 'ostacoli', 'giocattoli interattivi']
    WHEN 3 THEN ARRAY['tappetino morbido', 'musica rilassante', 'luci soffuse', 'oli essenziali']
  END
FROM protocol_id, generate_series(1, 10) as day_num, generate_series(1, 3) as exercise_num;

-- PROTOCOLLO: Ottimizzazione Ciclo Sonno-Veglia (7 giorni x 3 esercizi = 21 esercizi)
WITH protocol_id AS (SELECT id FROM ai_training_protocols WHERE title = 'Ottimizzazione Ciclo Sonno-Veglia' AND is_public = true)
INSERT INTO ai_training_exercises (protocol_id, day_number, title, description, exercise_type, duration_minutes, instructions, materials)
SELECT 
  protocol_id.id,
  day_num,
  CASE exercise_num
    WHEN 1 THEN 'Esercizio ' || day_num || '.1 - Routine Pre-Sonno'
    WHEN 2 THEN 'Esercizio ' || day_num || '.2 - Ambiente Ottimale'
    WHEN 3 THEN 'Esercizio ' || day_num || '.3 - Regolarità Orari'
  END,
  CASE exercise_num
    WHEN 1 THEN 'Creazione di una routine rilassante che precede il momento del sonno.'
    WHEN 2 THEN 'Ottimizzazione dell''ambiente di riposo per favorire un sonno ristoratore.'
    WHEN 3 THEN 'Stabilimento di orari fissi per sonno e veglia per regolare il ritmo circadiano.'
  END,
  'behavioral',
  CASE exercise_num WHEN 1 THEN 15 WHEN 2 THEN 10 WHEN 3 THEN 5 END,
  CASE exercise_num
    WHEN 1 THEN ARRAY['Attività calme pre-sonno', 'Spegnere luci gradualmente', 'Routine igiene', 'Coccole tranquille']
    WHEN 2 THEN ARRAY['Temperatura ideale', 'Ridurre rumori', 'Cuccia comoda', 'Oscurare ambiente']
    WHEN 3 THEN ARRAY['Orari fissi sonno', 'Sveglia stessa ora', 'Rispettare ritmi', 'Evitare sonnellini lunghi']
  END,
  CASE exercise_num
    WHEN 1 THEN ARRAY['luci dimmerabili', 'musica soft', 'spazzola', 'coperta preferita']
    WHEN 2 THEN ARRAY['termometro', 'tende oscuranti', 'cuccia ergonomica', 'riduttori rumore']
    WHEN 3 THEN ARRAY['sveglia', 'calendario routine', 'timer', 'diario sonno']
  END
FROM protocol_id, generate_series(1, 7) as day_num, generate_series(1, 3) as exercise_num;

-- PROTOCOLLO: Riattivazione Energia e Motivazione (8 giorni x 3 esercizi = 24 esercizi)
WITH protocol_id AS (SELECT id FROM ai_training_protocols WHERE title = 'Riattivazione Energia e Motivazione' AND is_public = true)
INSERT INTO ai_training_exercises (protocol_id, day_number, title, description, exercise_type, duration_minutes, instructions, materials)
SELECT 
  protocol_id.id,
  day_num,
  CASE exercise_num
    WHEN 1 THEN 'Esercizio ' || day_num || '.1 - Stimolazione Fisica'
    WHEN 2 THEN 'Esercizio ' || day_num || '.2 - Giochi Motivazionali'
    WHEN 3 THEN 'Esercizio ' || day_num || '.3 - Socializzazione Attiva'
  END,
  CASE exercise_num
    WHEN 1 THEN 'Attività fisiche leggere e progressive per risvegliare l''interesse al movimento.'
    WHEN 2 THEN 'Giochi stimolanti che riaccendono la curiosità e la voglia di partecipare.'
    WHEN 3 THEN 'Interazioni sociali positive per combattere l''isolamento e l''apatia.'
  END,
  'physical',
  CASE exercise_num WHEN 1 THEN 20 WHEN 2 THEN 15 WHEN 3 THEN 25 END,
  CASE exercise_num
    WHEN 1 THEN ARRAY['Passeggiate brevi', 'Stretching guidato', 'Movimento libero', 'Aumentare gradualmente']
    WHEN 2 THEN ARRAY['Giochi nuovi', 'Puzzle alimentari', 'Nascondino premi', 'Variare attività']
    WHEN 3 THEN ARRAY['Incontri piacevoli', 'Giochi di gruppo', 'Nuove esperienze', 'Rinforzi sociali']
  END,
  CASE exercise_num
    WHEN 1 THEN ARRAY['guinzaglio morbido', 'tappetino yoga', 'spazio aperto', 'acqua fresca']
    WHEN 2 THEN ARRAY['puzzle feeder', 'giocattoli nuovi', 'snack nascosti', 'texture diverse']
    WHEN 3 THEN ARRAY['altri animali', 'persone amiche', 'ambiente stimolante', 'giochi sociali']
  END
FROM protocol_id, generate_series(1, 8) as day_num, generate_series(1, 3) as exercise_num;

-- PROTOCOLLO: Rieducazione Alimentare Comportamentale (9 giorni x 3 esercizi = 27 esercizi)
WITH protocol_id AS (SELECT id FROM ai_training_protocols WHERE title = 'Rieducazione Alimentare Comportamentale' AND is_public = true)
INSERT INTO ai_training_exercises (protocol_id, day_number, title, description, exercise_type, duration_minutes, instructions, materials)
SELECT 
  protocol_id.id,
  day_num,
  CASE exercise_num
    WHEN 1 THEN 'Esercizio ' || day_num || '.1 - Orari e Routine'
    WHEN 2 THEN 'Esercizio ' || day_num || '.2 - Controllo Velocità'
    WHEN 3 THEN 'Esercizio ' || day_num || '.3 - Associazioni Positive'
  END,
  CASE exercise_num
    WHEN 1 THEN 'Stabilimento di orari fissi per i pasti e creazione di routine alimentari.'
    WHEN 2 THEN 'Tecniche per rallentare l''assunzione di cibo e migliorare la digestione.'
    WHEN 3 THEN 'Creazione di associazioni positive con il momento del pasto.'
  END,
  'behavioral',
  CASE exercise_num WHEN 1 THEN 10 WHEN 2 THEN 20 WHEN 3 THEN 15 END,
  CASE exercise_num
    WHEN 1 THEN ARRAY['Orari fissi pasti', 'Ambiente tranquillo', 'Rimuovere cibo non consumato', 'Routine preparazione']
    WHEN 2 THEN ARRAY['Puzzle feeder', 'Ciotole speciali', 'Nascondere cibo', 'Pause durante pasto']
    WHEN 3 THEN ARRAY['Calma prima pasto', 'Presenza rassicurante', 'Coccole post-pasto', 'Ambiente piacevole']
  END,
  CASE exercise_num
    WHEN 1 THEN ARRAY['timer pasti', 'ciotole fisse', 'placemat', 'routine chart']
    WHEN 2 THEN ARRAY['puzzle feeder', 'ciotole anti-ingozzamento', 'nascondigli cibo', 'timer pause']
    WHEN 3 THEN ARRAY['musica soft', 'tappetino pasti', 'presenza umana', 'spazio dedicato']
  END
FROM protocol_id, generate_series(1, 9) as day_num, generate_series(1, 3) as exercise_num;

-- PROTOCOLLO: Socializzazione Progressiva (5 giorni x 3 esercizi = 15 esercizi)
WITH protocol_id AS (SELECT id FROM ai_training_protocols WHERE title = 'Socializzazione Progressiva' AND is_public = true)
INSERT INTO ai_training_exercises (protocol_id, day_number, title, description, exercise_type, duration_minutes, instructions, materials)
SELECT 
  protocol_id.id,
  day_num,
  CASE exercise_num
    WHEN 1 THEN 'Esercizio ' || day_num || '.1 - Incontri Controllati'
    WHEN 2 THEN 'Esercizio ' || day_num || '.2 - Nuovi Ambienti'
    WHEN 3 THEN 'Esercizio ' || day_num || '.3 - Interazioni Multi-Specie'
  END,
  CASE exercise_num
    WHEN 1 THEN 'Incontri pianificati con persone e animali familiari in ambiente controllato.'
    WHEN 2 THEN 'Esplorazione graduale di nuovi ambienti per ampliare la zona di comfort.'
    WHEN 3 THEN 'Interazioni positive con diverse specie per migliorare la socialità generale.'
  END,
  'behavioral',
  CASE exercise_num WHEN 1 THEN 25 WHEN 2 THEN 35 WHEN 3 THEN 30 END,
  CASE exercise_num
    WHEN 1 THEN ARRAY['Persone familiari', 'Animali docili', 'Distanze sicure', 'Rinforzi positivi']
    WHEN 2 THEN ARRAY['Ambienti tranquilli', 'Esplorazione libera', 'Tempo illimitato', 'Vie di fuga']
    WHEN 3 THEN ARRAY['Specie diverse docili', 'Supervisione costante', 'Interazioni brevi', 'Premio successi']
  END,
  CASE exercise_num
    WHEN 1 THEN ARRAY['guinzaglio lungo', 'snack premio', 'persone note', 'spazio neutro']
    WHEN 2 THEN ARRAY['trasportino sicuro', 'esplorazione libera', 'premi incoraggiamento', 'tempo flessibile']
    WHEN 3 THEN ARRAY['animali docili', 'snack speciali', 'supervisione umana', 'spazi aperti']
  END
FROM protocol_id, generate_series(1, 5) as day_num, generate_series(1, 3) as exercise_num;

-- PROTOCOLLO: Stop Comportamenti Distruttivi (8 giorni x 3 esercizi = 24 esercizi)
WITH protocol_id AS (SELECT id FROM ai_training_protocols WHERE title = 'Stop Comportamenti Distruttivi' AND is_public = true)
INSERT INTO ai_training_exercises (protocol_id, day_number, title, description, exercise_type, duration_minutes, instructions, materials)
SELECT 
  protocol_id.id,
  day_num,
  CASE exercise_num
    WHEN 1 THEN 'Esercizio ' || day_num || '.1 - Identificazione Trigger'
    WHEN 2 THEN 'Esercizio ' || day_num || '.2 - Redirezione Comportamento'
    WHEN 3 THEN 'Esercizio ' || day_num || '.3 - Alternative Positive'
  END,
  CASE exercise_num
    WHEN 1 THEN 'Identificazione delle cause scatenanti dei comportamenti distruttivi.'
    WHEN 2 THEN 'Tecniche per interrompere e redirigere i comportamenti non desiderati.'
    WHEN 3 THEN 'Fornire alternative appropriate per soddisfare i bisogni comportamentali.'
  END,
  'behavioral',
  CASE exercise_num WHEN 1 THEN 15 WHEN 2 THEN 25 WHEN 3 THEN 20 END,
  CASE exercise_num
    WHEN 1 THEN ARRAY['Osservare patterns', 'Documentare episodi', 'Identificare stress', 'Notare orari']
    WHEN 2 THEN ARRAY['Interruzione ferma', 'Distrazione immediata', 'Reindirizzamento', 'Non punire dopo']
    WHEN 3 THEN ARRAY['Giochi masticare', 'Attività mentali', 'Esercizio fisico', 'Stimolazione appropriata']
  END,
  CASE exercise_num
    WHEN 1 THEN ARRAY['diario comportamenti', 'camera monitoraggio', 'timer', 'checklist trigger']
    WHEN 2 THEN ARRAY['spray sicuro', 'giocattoli distrazione', 'clicker', 'comandi base']
    WHEN 3 THEN ARRAY['giochi masticare', 'puzzle feeder', 'corde gioco', 'attività fisiche']
  END
FROM protocol_id, generate_series(1, 8) as day_num, generate_series(1, 3) as exercise_num;

-- PROTOCOLLO: Superare Fobie e Paure Specifiche (10 giorni x 3 esercizi = 30 esercizi)
WITH protocol_id AS (SELECT id FROM ai_training_protocols WHERE title = 'Superare Fobie e Paure Specifiche' AND is_public = true)
INSERT INTO ai_training_exercises (protocol_id, day_number, title, description, exercise_type, duration_minutes, instructions, materials)
SELECT 
  protocol_id.id,
  day_num,
  CASE exercise_num
    WHEN 1 THEN 'Esercizio ' || day_num || '.1 - Desensibilizzazione Graduale'
    WHEN 2 THEN 'Esercizio ' || day_num || '.2 - Controesposizione Positiva'
    WHEN 3 THEN 'Esercizio ' || day_num || '.3 - Costruzione Fiducia'
  END,
  CASE exercise_num
    WHEN 1 THEN 'Esposizione molto graduale al trigger della fobia mantenendo calma.'
    WHEN 2 THEN 'Associazione del trigger con esperienze positive e rilassanti.'
    WHEN 3 THEN 'Costruzione della fiducia attraverso successi progressivi e rinforzi.'
  END,
  'behavioral',
  CASE exercise_num WHEN 1 THEN 20 WHEN 2 THEN 25 WHEN 3 THEN 15 END,
  CASE exercise_num
    WHEN 1 THEN ARRAY['Distanza massima sicura', 'Esposizione brevissima', 'Osservare reazioni', 'Aumentare gradualmente']
    WHEN 2 THEN ARRAY['Trigger + premio', 'Associazioni positive', 'Rilassamento', 'Pazienza costante']
    WHEN 3 THEN ARRAY['Celebrare piccoli successi', 'Rinforzi immediati', 'Fiducia reciproca', 'Progressi costanti']
  END,
  CASE exercise_num
    WHEN 1 THEN ARRAY['metro distanze', 'trigger controllato', 'cronometro', 'safe space']
    WHEN 2 THEN ARRAY['snack eccezionali', 'giocattoli preferiti', 'coccole', 'musica rilassante']
    WHEN 3 THEN ARRAY['diario progressi', 'snack celebrativi', 'sessioni brevi', 'rinforzi vari']
  END
FROM protocol_id, generate_series(1, 10) as day_num, generate_series(1, 3) as exercise_num;

-- Messaggio finale con conteggio
DO $$
BEGIN
  RAISE NOTICE '🎯 COMPLETATO! Ogni protocollo ora ha 3 esercizi per giorno. Totale esercizi: %', 
    (SELECT COUNT(*) FROM ai_training_exercises);
END $$;