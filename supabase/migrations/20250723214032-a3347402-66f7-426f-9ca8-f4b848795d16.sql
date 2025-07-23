-- Creazione degli esercizi per i protocolli di ansia, aggressività, tristezza, stress e iperattività
-- Ogni protocollo ha 3 esercizi progressivi per ogni giorno

-- Esercizi per GESTIONE DELL'ANSIA
INSERT INTO public.ai_training_exercises (
  id, protocol_id, day_number, title, description, exercise_type, duration_minutes, instructions, materials
)
SELECT 
  gen_random_uuid(),
  p.id,
  day_num,
  exercise_title,
  exercise_description,
  'behavioral',
  exercise_duration,
  exercise_instructions,
  exercise_materials
FROM (
  SELECT id FROM public.ai_training_protocols WHERE target_behavior = 'ansioso' LIMIT 1
) p
CROSS JOIN (
  VALUES 
    -- Giorno 1
    (1, 'Respirazione Guidata', 'Esercizio di rilassamento per calmare l''ansia attraverso la respirazione sincronizzata.', 15, 
     '["Posiziona il pet in un ambiente tranquillo", "Siediti accanto al pet", "Inspira lentamente per 4 secondi", "Trattieni il respiro per 2 secondi", "Espira lentamente per 6 secondi", "Ripeti per 15 minuti mantenendo il contatto visivo calmo"]'::text[], 
     '["Tappetino morbido", "Ambiente silenzioso"]'::text[]),
    (1, 'Zona Sicura', 'Creazione di uno spazio dedicato dove il pet può rifugiarsi quando si sente ansioso.', 20,
     '["Scegli un angolo tranquillo della casa", "Posiziona una coperta morbida", "Aggiungi il giocattolo preferito del pet", "Utilizza feromoni calmanti nell''area", "Guida gentilmente il pet verso la zona", "Rimani nelle vicinanze senza forzare l''interazione"]'::text[],
     '["Coperta morbida", "Giocattolo preferito", "Feromoni calmanti"]'::text[]),
    (1, 'Massaggio Rilassante', 'Tecniche di massaggio dolce per ridurre la tensione fisica e mentale.', 10,
     '["Inizia dalle orecchie con movimenti circolari dolci", "Procedi verso il collo con carezze lunghe", "Massaggia delicatamente le spalle", "Termina con carezze sulla schiena", "Mantieni movimenti lenti e costanti", "Osserva i segnali di rilassamento del pet"]'::text[],
     '["Mani pulite", "Ambiente calmo"]'::text[]),

    -- Giorno 2
    (2, 'Desensibilizzazione Graduale', 'Esposizione controllata ai trigger di ansia per ridurre la reattività.', 25,
     '["Identifica il trigger principale dell''ansia", "Inizia con una versione molto attenuata del trigger", "Mantieni una distanza sicura", "Premia la calma con snack", "Avvicinati gradualmente solo se il pet rimane calmo", "Termina sempre con un''esperienza positiva"]'::text[],
     '["Snack ad alto valore", "Giocattolo preferito", "Guinzaglio se necessario"]'::text[]),
    (2, 'Gioco Interattivo Calmo', 'Attività di gioco a bassa intensità per mantenere il pet impegnato senza sovrastimolazione.', 15,
     '["Utilizza puzzle alimentari semplici", "Nascondi snack in diversi punti della stanza", "Incoraggia la ricerca con voce calma", "Premia ogni successo", "Mantieni il ritmo lento e rilassato", "Concludi con coccole tranquille"]'::text[],
     '["Puzzle alimentari", "Snack piccoli", "Tempo e pazienza"]'::text[]),
    (2, 'Training di Base Rilassato', 'Comandi semplici praticati in modo calmo per aumentare la fiducia.', 20,
     '["Inizia con il comando ""seduto""", "Usa rinforzi positivi immediati", "Mantieni sessioni brevi (5 minuti per comando)", "Pratica ""resta"" per aumentare l''autocontrollo", "Termina con ""bravo"" e coccole", "Ripeti solo se il pet è rilassato"]'::text[],
     '["Snack di ricompensa", "Voce calma", "Pazienza"]'::text[])
) AS exercises(day_num, exercise_title, exercise_description, exercise_duration, exercise_instructions, exercise_materials);

-- Esercizi per CONTROLLO DELL'AGGRESSIVITÀ
INSERT INTO public.ai_training_exercises (
  id, protocol_id, day_number, title, description, exercise_type, duration_minutes, instructions, materials
)
SELECT 
  gen_random_uuid(),
  p.id,
  day_num,
  exercise_title,
  exercise_description,
  'behavioral',
  exercise_duration,
  exercise_instructions,
  exercise_materials
FROM (
  SELECT id FROM public.ai_training_protocols WHERE target_behavior = 'aggressivo' LIMIT 1
) p
CROSS JOIN (
  VALUES 
    -- Giorno 1
    (1, 'Controllo degli Impulsi', 'Esercizio per insegnare l''autocontrollo davanti a stimoli scatenanti.', 20,
     '["Posiziona il pet in posizione seduta", "Mostra un oggetto desiderabile a distanza", "Usa il comando ""aspetta""", "Premia solo quando il pet rimane calmo", "Avvicinati gradualmente all''oggetto", "Termina permettendo l''interazione controllata"]'::text[],
     '["Giocattolo Kong", "Snack ad alto valore", "Guinzaglio corto"]'::text[]),
    (1, 'Redirezione Positiva', 'Tecniche per spostare l''attenzione da comportamenti aggressivi ad attività positive.', 15,
     '["Riconosci i primi segnali di aggressività", "Distrai immediatamente con un comando diverso", "Usa ""guarda"" per catturare l''attenzione", "Premia il comportamento alternativo", "Ripeti la sequenza più volte", "Mantieni sempre il controllo della situazione"]'::text[],
     '["Premi ad alto valore", "Giocattolo preferito", "Voce ferma ma calma"]'::text[]),
    (1, 'Spazio Personale', 'Insegnare il rispetto dello spazio e la gestione delle interazioni sociali.', 25,
     '["Stabilisci confini chiari nell''ambiente", "Usa barriere fisiche se necessario", "Pratica comandi di ""vai al tuo posto""", "Ricompensa quando il pet rispetta lo spazio", "Gradualmente riduci le barriere fisiche", "Mantieni coerenza nelle regole"]'::text[],
     '["Barriera di sicurezza", "Tappetino per ""posto""", "Premi di rinforzo"]'::text[])
) AS exercises(day_num, exercise_title, exercise_description, exercise_duration, exercise_instructions, exercise_materials);

-- Esercizi per SUPERARE LA TRISTEZZA
INSERT INTO public.ai_training_exercises (
  id, protocol_id, day_number, title, description, exercise_type, duration_minutes, instructions, materials
)
SELECT 
  gen_random_uuid(),
  p.id,
  day_num,
  exercise_title,
  exercise_description,
  'emotional',
  exercise_duration,
  exercise_instructions,
  exercise_materials
FROM (
  SELECT id FROM public.ai_training_protocols WHERE target_behavior = 'triste' LIMIT 1
) p
CROSS JOIN (
  VALUES 
    -- Giorno 1
    (1, 'Gioco Energico Guidato', 'Attività fisica divertente per stimolare la produzione di endorfine.', 30,
     '["Inizia con gioco di riporto con palla", "Usa voce allegra e incoraggiante", "Varia i tipi di gioco ogni 5 minuti", "Include corsa leggera se appropriato", "Premia ogni partecipazione attiva", "Termina con coccole energiche"]'::text[],
     '["Palla da tennis", "Frisbee", "Corda da gioco", "Snack motivazionali"]'::text[]),
    (1, 'Socializzazione Positiva', 'Interazioni sociali per migliorare l''umore attraverso il contatto.', 20,
     '["Organizza incontri con altri pet amichevoli", "Supervisiona tutte le interazioni", "Premia comportamenti sociali positivi", "Mantieni incontri brevi ma frequenti", "Includi proprietari familiari", "Documenta miglioramenti nell''umore"]'::text[],
     '["Guinzagli", "Premi per tutti i pet", "Area sicura per incontri"]'::text[]),
    (1, 'Stimolazione Mentale Divertente', 'Puzzle e giochi mentali per mantenere la mente attiva e impegnata.', 15,
     '["Utilizza puzzle alimentari progressivi", "Nascondi giocattoli in casa", "Crea percorsi di ricerca indoor", "Premia ogni scoperta", "Varia la difficoltà gradualmente", "Celebra ogni successo con entusiasmo"]'::text[],
     '["Puzzle alimentari", "Giocattoli nascondibili", "Snack vari"]'::text[])
) AS exercises(day_num, exercise_title, exercise_description, exercise_duration, exercise_instructions, exercise_materials);