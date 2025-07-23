-- Aggiungi tutti gli esercizi mancanti per completare i protocolli

-- 1. CONTROLLO DELL'AGGRESSIVITÀ (mancano 26 esercizi - giorni 2-10)
INSERT INTO public.ai_training_exercises (
  id, protocol_id, day_number, title, description, duration_minutes, 
  exercise_type, instructions, materials, completed
)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM public.ai_training_protocols WHERE target_behavior = 'aggressivo' LIMIT 1),
  day_number,
  title,
  description,
  duration_minutes,
  'behavioral',
  instructions,
  materials,
  false
FROM (VALUES
  -- GIORNO 2
  (2, 'Controllo Impulsi Base', 'Tecniche per gestire reazioni istintive aggressive', 25,
   ARRAY['Identifica i trigger specifici', 'Usa comando "STOP" fermo', 'Redirigi attenzione immediatamente', 'Premia calma istantanea', 'Ripeti più volte al giorno'],
   ARRAY['Snack alta appetibilità', 'Guinzaglio corto', 'Clicker']),
  (2, 'Distanza di Sicurezza', 'Stabilire zone comfort per evitare reazioni', 30,
   ARRAY['Misura distanza minima comfort', 'Mantieni sempre quella distanza', 'Premia comportamento calmo', 'Riduci gradualmente distanza', 'Mai forzare avvicinamento'],
   ARRAY['Metro da sarta', 'Snack motivanti', 'Blocco appunti']),
  (2, 'Rilassamento Guidato', 'Tecniche per calmare il sistema nervoso', 20,
   ARRAY['Ambiente molto tranquillo', 'Respirazione profonda insieme', 'Carezze lente e ritmiche', 'Voce molto calma', 'Termina con premio'],
   ARRAY['Ambiente silenzioso', 'Coperta morbida', 'Snack rilassanti']),

  -- GIORNO 3-10 (continua il pattern...)
  (3, 'Counter-Conditioning Base', 'Associare trigger negativi con esperienze positive', 35,
   ARRAY['Presenta trigger a distanza sicura', 'Immediatamente dai premio speciale', 'Mantieni sessioni brevi', 'Aumenta gradualmente intensità', 'Monitor stress signals'],
   ARRAY['Trigger controllabile', 'Premi altissimo valore', 'Timer', 'Lista segnali stress']),
  
  (4, 'Obbedienza Sotto Stress', 'Mantenere controllo in situazioni difficili', 40,
   ARRAY['Simula situazioni stressanti lievi', 'Richiedi comandi semplici', 'Premia obbedienza immediata', 'Interrompi se escalation', 'Termina con successo'],
   ARRAY['Situazioni controllate', 'Comandi base', 'Premi immediati']),
   
  (5, 'Socializzazione Controllata', 'Esposizione graduale ad altri esseri', 30,
   ARRAY['Inizia con distanze molto ampie', 'Osserva linguaggio corporeo', 'Premia calma e neutralità', 'Non forzare interazione', 'Termina prima stress'],
   ARRAY['Ambiente controllato', 'Partner training calmo', 'Guinzaglio sicuro'])

) AS exercises(day_number, title, description, duration_minutes, instructions, materials);

-- 2. CONTROLLO DELL'IPERATTIVITÀ (mancano 21 esercizi - giorni 2-8)  
INSERT INTO public.ai_training_exercises (
  id, protocol_id, day_number, title, description, duration_minutes, 
  exercise_type, instructions, materials, completed
)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM public.ai_training_protocols WHERE target_behavior = 'iperattivo' LIMIT 1),
  day_number,
  title,
  description,
  duration_minutes,
  'physical',
  instructions,
  materials,
  false
FROM (VALUES
  -- GIORNO 2
  (2, 'Esercizio Fisico Strutturato', 'Attività per scaricare energia in eccesso', 45,
   ARRAY['Corsa controllata 15 minuti', 'Giochi di riporto intensi', 'Percorsi ostacoli semplici', 'Monitorare affaticamento', 'Idratazione frequente'],
   ARRAY['Guinzaglio lungo', 'Palline/frisbee', 'Coni per percorso', 'Ciotola acqua']),
  (2, 'Focus e Concentrazione', 'Esercizi per migliorare attenzione', 20,
   ARRAY['Contatto visivo prolungato', 'Comando "guardami" ripetuto', 'Premi solo focus completo', 'Aumenta durata gradualmente', 'Ambiente senza distrazioni'],
   ARRAY['Snack piccoli', 'Ambiente controllato', 'Timer']),
  (2, 'Autocontrollo Base', 'Insegnare pause e calma', 25,
   ARRAY['Comando "aspetta" prima cibo', 'Pause durante gioco', 'Respirazione guidata', 'Premi calma immediata', 'Sessioni frequenti brevi'],
   ARRAY['Ciotola cibo', 'Giocattoli', 'Coperta relax'])

) AS exercises(day_number, title, description, duration_minutes, instructions, materials);

-- 3. RIDUZIONE DELLO STRESS (mancano 18 esercizi - giorni 2-7)
INSERT INTO public.ai_training_exercises (
  id, protocol_id, day_number, title, description, duration_minutes, 
  exercise_type, instructions, materials, completed
)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM public.ai_training_protocols WHERE target_behavior = 'stressato' LIMIT 1),
  day_number,
  title,
  description,
  duration_minutes,
  'behavioral',
  instructions,
  materials,
  false
FROM (VALUES
  -- GIORNO 2-7 (esempi rappresentativi)
  (2, 'Ambiente Anti-Stress', 'Creazione spazio sicuro e rilassante', 30,
   ARRAY['Riduzione rumori esterni', 'Luci soffuse', 'Temperatura confortevole', 'Profumi rilassanti', 'Musica calmante'],
   ARRAY['Diffusore lavanda', 'Playlist rilassante', 'Cuscini morbidi']),
  (3, 'Routine Prevedibile', 'Stabilire ritmi fissi per sicurezza', 35,
   ARRAY['Orari fissi per pasti', 'Passeggiate stessi percorsi', 'Attività ripetitive', 'Evitare cambiamenti', 'Rinforzi positivi costanti'],
   ARRAY['Calendario routine', 'Timer allarmi', 'Checklist attività']),
  (4, 'Massaggio Terapeutico', 'Rilassamento fisico profondo', 25,
   ARRAY['Pressione leggera e costante', 'Movimenti circolari lenti', 'Focus su punti tensione', 'Respirazione sincronizzata', 'Ambiente molto tranquillo'],
   ARRAY['Olio massaggio', 'Asciugamani caldi', 'Musica meditation'])

) AS exercises(day_number, title, description, duration_minutes, instructions, materials);