-- Aggiungi gli esercizi mancanti per il protocollo "Gestione dell'Ansia" (giorni 3, 4, 5)
INSERT INTO public.ai_training_exercises (
  id, protocol_id, day_number, title, description, duration_minutes, 
  exercise_type, instructions, materials, completed, effectiveness_score
)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM public.ai_training_protocols WHERE target_behavior = 'ansioso' LIMIT 1),
  day_number,
  title,
  description,
  duration_minutes,
  'behavioral',
  instructions,
  materials,
  false,
  0
FROM (VALUES
  -- GIORNO 3
  (3, 'Respirazione 4-7-8 Avanzata', 'Tecnica di respirazione profonda per calmare il sistema nervoso del pet', 20, 
   ARRAY['Siediti accanto al tuo pet in un luogo tranquillo', 'Inspira per 4 secondi guardando il pet', 'Trattieni il respiro per 7 secondi mantenendo contatto visivo', 'Espira lentamente per 8 secondi', 'Ripeti per 5-7 cicli', 'Osserva come il pet si rilassa con te'],
   ARRAY['Ambiente silenzioso', 'Posto comodo per sedersi', 'Timer']),
  
  (3, 'Massaggio Anti-Stress', 'Massaggio dolce per ridurre la tensione fisica e mentale', 25,
   ARRAY['Inizia con carezze leggere sulla testa', 'Massaggia delicatamente dietro le orecchie', 'Procedi con movimenti circolari sul collo', 'Massaggia dolcemente le spalle', 'Termina con carezze lungo la schiena', 'Osserva i segnali di rilassamento'],
   ARRAY['Olio per massaggi pet-safe', 'Asciugamano morbido', 'Ambiente caldo']),
  
  (3, 'Zona Sicura Personalizzata', 'Creazione di uno spazio dedicato al relax e alla sicurezza', 30,
   ARRAY['Scegli un angolo tranquillo della casa', 'Posiziona la cuccia o coperta preferita', 'Aggiungi un capo di abbigliamento che profuma di te', 'Metti a disposizione acqua fresca', 'Testa lo spazio insieme al pet', 'Rinforza positivamente quando usa la zona'],
   ARRAY['Cuccia o coperta morbida', 'Capo di abbigliamento del proprietario', 'Ciotola per acqua', 'Giocattolo preferito']),

  -- GIORNO 4
  (4, 'Desensibilizzazione Graduale', 'Esposizione controllata a stimoli che causano ansia', 35,
   ARRAY['Identifica il trigger principale dell''ansia', 'Presenta il trigger a distanza/volume bassi', 'Premia immediatamente la calma', 'Aumenta gradualmente l''intensità solo se resta calmo', 'Interrompi se mostra segni di stress', 'Termina sempre con successo'],
   ARRAY['Snack ad alto valore', 'Trigger controllabile', 'Clicker o marker vocale', 'Lista dei segnali di stress']),
  
  (4, 'Gioco Interattivo Calmante', 'Attività ludica che promuove rilassamento e fiducia', 25,
   ARRAY['Scegli giochi a bassa intensità', 'Inizia con movimenti lenti e prevedibili', 'Premia la partecipazione tranquilla', 'Evita competizione o eccitazione eccessiva', 'Mantieni il controllo del ritmo', 'Termina prima che diventi troppo stimolante'],
   ARRAY['Giocattoli morbidi', 'Snack motivanti', 'Spazio sicuro per giocare']),
  
  (4, 'Training di Base Rilassato', 'Comandi semplici insegnati in modo calmo e rassicurante', 20,
   ARRAY['Inizia con "seduto" usando solo voce dolce', 'Premia ogni tentativo, anche imperfetto', 'Mantieni le sessioni brevi', 'Usa rinforzi positivi abbondanti', 'Pratica "resta" per aumentare autocontrollo', 'Termina sempre con successo'],
   ARRAY['Snack piccoli e gustosi', 'Voce calma e paziente', 'Ambiente familiare']),

  -- GIORNO 5
  (5, 'Routine di Rilassamento Quotidiana', 'Stabilire una routine serale per promuovere calma', 40,
   ARRAY['Inizia sempre alla stessa ora', 'Riduci luci e rumori gradualmente', 'Pratica respirazione insieme', 'Massaggio breve e dolce', 'Lettura ad alta voce con voce calma', 'Termina con posizione di riposo'],
   ARRAY['Luci soffuse', 'Musica rilassante', 'Libro da leggere', 'Coperta morbida']),
  
  (5, 'Test di Fiducia', 'Valutazione del progresso e rafforzamento del legame', 30,
   ARRAY['Simula situazioni che prima causavano ansia', 'Osserva le reazioni senza intervenire immediatamente', 'Premia le risposte calme', 'Prendi note sui miglioramenti', 'Celebra ogni piccolo progresso', 'Pianifica prossimi passi'],
   ARRAY['Situazioni test graduate', 'Quaderno per appunti', 'Premi speciali', 'Telefono per registrare progressi']),
  
  (5, 'Valutazione e Pianificazione Futura', 'Analisi dei risultati e pianificazione del mantenimento', 25,
   ARRAY['Rivedi tutti gli esercizi della settimana', 'Identifica le tecniche più efficaci', 'Nota le situazioni che necessitano ancora lavoro', 'Crea un piano di mantenimento', 'Stabilisci controlli periodici', 'Celebra i successi ottenuti'],
   ARRAY['Diario degli esercizi', 'Calendario per pianificazione', 'Lista delle tecniche efficaci', 'Piano di mantenimento'])
) AS exercises(day_number, title, description, duration_minutes, instructions, materials);

-- Verifica che ora abbiamo tutti gli esercizi
SELECT COUNT(*) as total_exercises 
FROM public.ai_training_exercises 
WHERE protocol_id = (SELECT id FROM public.ai_training_protocols WHERE target_behavior = 'ansioso' LIMIT 1);