-- Continuazione esercizi per tutti i protocolli rimanenti

-- Esercizi aggiuntivi per CONTROLLO DELL'AGGRESSIVITÀ (giorni 2-3)
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
    -- Giorno 2 
    (2, 'Training di Calma Avanzato', 'Esercizi per mantenere la calma in situazioni di stress crescente.', 30,
     ARRAY['Inizia in ambiente controllato', 'Introduci gradualmente distrazioni', 'Usa comando "calmo" con rinforzo', 'Aumenta il tempo di mantenimento', 'Premia solo comportamenti calmi', 'Termina con successo garantito'],
     ARRAY['Ambiente controllabile', 'Distrazioni graduate', 'Premi ad alto valore']),
    (2, 'Socializzazione Controllata', 'Interazioni supervisionate con altri animali per ridurre reattività.', 25,
     ARRAY['Scegli partner calmi e ben socializzati', 'Mantieni distanze di sicurezza iniziali', 'Supervisiona ogni interazione', 'Interrompi ai primi segni di tensione', 'Premia comportamenti calmi', 'Gradualmente riduci le distanze'],
     ARRAY['Guinzagli lunghi', 'Partner adatti', 'Premi per entrambi i pet']),
    (2, 'Gestione delle Risorse', 'Insegnare a condividere spazi e oggetti senza conflitti.', 20,
     ARRAY['Stabilisci regole chiare per cibo e giocattoli', 'Pratica "lascia" con oggetti desiderabili', 'Usa rinforzi per comportamenti di condivisione', 'Non forzare mai la condivisione', 'Crea turni per le risorse', 'Mantieni sempre il controllo'],
     ARRAY['Ciotole separate', 'Giocattoli vari', 'Snack per rinforzi']),

    -- Giorno 3
    (3, 'Autocontrollo in Movimento', 'Mantenere la calma durante passeggiate e spostamenti.', 35,
     ARRAY['Inizia con brevi passeggiate in aree tranquille', 'Usa guinzaglio corto per controllo', 'Fermati a ogni segno di agitazione', 'Pratica comandi di base durante il movimento', 'Premia la camminata calma', 'Evita aree troppo stimolanti'],
     ARRAY['Guinzaglio anti-tiro', 'Sacchetti per premi', 'Percorsi pianificati'])
) AS exercises(day_num, exercise_title, exercise_description, exercise_duration, exercise_instructions, exercise_materials);

-- Esercizi per RIDUZIONE DELLO STRESS (giorni 1-2)
INSERT INTO public.ai_training_exercises (
  id, protocol_id, day_number, title, description, exercise_type, duration_minutes, instructions, materials
)
SELECT 
  gen_random_uuid(),
  p.id,
  day_num,
  exercise_title,
  exercise_description,
  'environmental',
  exercise_duration,
  exercise_instructions,
  exercise_materials
FROM (
  SELECT id FROM public.ai_training_protocols WHERE target_behavior = 'stressato' LIMIT 1
) p
CROSS JOIN (
  VALUES 
    -- Giorno 1
    (1, 'Ambiente di Rilassamento', 'Creazione di uno spazio anti-stress ottimale per il pet.', 30,
     ARRAY['Scegli la stanza più tranquilla', 'Riduci al minimo rumori e luci intense', 'Aggiungi musica rilassante a basso volume', 'Posiziona diffusori di feromoni calmanti', 'Crea angoli morbidi con cuscini', 'Mantieni temperatura confortevole'],
     ARRAY['Diffusore feromoni', 'Musica rilassante', 'Cuscini morbidi', 'Luci soffuse']),
    (1, 'Routine di Calma', 'Stabilire orari fissi per attività rilassanti.', 20,
     ARRAY['Crea orari fissi per i pasti', 'Stabilisci momenti di coccole regolari', 'Introduci rituali pre-sonno', 'Mantieni costanza negli orari', 'Evita cambiamenti bruschi', 'Documenta i progressi'],
     ARRAY['Orario fisso', 'Agenda delle attività', 'Timer per routine']),
    (1, 'Tecniche di Respirazione Condivisa', 'Esercizi di rilassamento attraverso la sincronizzazione del respiro.', 15,
     ARRAY['Siediti comodamente con il pet', 'Respira lentamente e profondamente', 'Mantieni contatto fisico dolce', 'Sincronizza il tuo respiro con quello del pet', 'Parla con voce morbida e rassicurante', 'Ripeti per 15 minuti'],
     ARRAY['Spazio tranquillo', 'Tempo dedicato', 'Pazienza'])
) AS exercises(day_num, exercise_title, exercise_description, exercise_duration, exercise_instructions, exercise_materials);

-- Esercizi per CONTROLLO DELL'IPERATTIVITÀ (giorni 1-2)
INSERT INTO public.ai_training_exercises (
  id, protocol_id, day_number, title, description, exercise_type, duration_minutes, instructions, materials
)
SELECT 
  gen_random_uuid(),
  p.id,
  day_num,
  exercise_title,
  exercise_description,
  'physical',
  exercise_duration,
  exercise_instructions,
  exercise_materials
FROM (
  SELECT id FROM public.ai_training_protocols WHERE target_behavior = 'iperattivo' LIMIT 1
) p
CROSS JOIN (
  VALUES 
    -- Giorno 1
    (1, 'Esercizio Fisico Strutturato', 'Attività fisica intensa per scaricare energia in eccesso.', 40,
     ARRAY['Inizia con riscaldamento di 5 minuti', 'Alterna corsa e camminata veloce', 'Include giochi di riporto intensi', 'Aggiungi ostacoli semplici da superare', 'Mantieni ritmo elevato ma controllato', 'Termina con defaticamento graduale'],
     ARRAY['Ostacoli portatili', 'Palla da riporto', 'Spazio ampio sicuro', 'Acqua per idratazione']),
    (1, 'Puzzle Mentali Progressivi', 'Stimolazione cognitiva per stancare la mente oltre al corpo.', 25,
     ARRAY['Inizia con puzzle alimentari semplici', 'Aumenta gradualmente la difficoltà', 'Varia i tipi di giochi mentali', 'Limita il tempo per ogni puzzle', 'Premia la persistenza', 'Alterna con brevi pause'],
     ARRAY['Puzzle di diversi livelli', 'Snack piccoli', 'Timer', 'Varietà di giochi cognitivi']),
    (1, 'Training di Autocontrollo Dinamico', 'Esercizi per imparare a fermarsi e calmarsi durante l''attività.', 20,
     ARRAY['Inizia attività fisica intensa', 'Introduci comando "stop" improvviso', 'Premia immediatamente la fermata', 'Riprendi attività dopo pausa breve', 'Ripeti sequenza più volte', 'Aumenta gradualmente i tempi di stop'],
     ARRAY['Fischietto per "stop"', 'Premi immediati', 'Spazio per movimento libero'])
) AS exercises(day_num, exercise_title, exercise_description, exercise_duration, exercise_instructions, exercise_materials);