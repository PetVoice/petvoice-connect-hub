-- Creazione degli esercizi per i protocolli - correzione formato array
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
     ARRAY['Posiziona il pet in un ambiente tranquillo', 'Siediti accanto al pet', 'Inspira lentamente per 4 secondi', 'Trattieni il respiro per 2 secondi', 'Espira lentamente per 6 secondi', 'Ripeti per 15 minuti mantenendo il contatto visivo calmo'], 
     ARRAY['Tappetino morbido', 'Ambiente silenzioso']),
    (1, 'Zona Sicura', 'Creazione di uno spazio dedicato dove il pet può rifugiarsi quando si sente ansioso.', 20,
     ARRAY['Scegli un angolo tranquillo della casa', 'Posiziona una coperta morbida', 'Aggiungi il giocattolo preferito del pet', 'Utilizza feromoni calmanti nell''area', 'Guida gentilmente il pet verso la zona', 'Rimani nelle vicinanze senza forzare l''interazione'],
     ARRAY['Coperta morbida', 'Giocattolo preferito', 'Feromoni calmanti']),
    (1, 'Massaggio Rilassante', 'Tecniche di massaggio dolce per ridurre la tensione fisica e mentale.', 10,
     ARRAY['Inizia dalle orecchie con movimenti circolari dolci', 'Procedi verso il collo con carezze lunghe', 'Massaggia delicatamente le spalle', 'Termina con carezze sulla schiena', 'Mantieni movimenti lenti e costanti', 'Osserva i segnali di rilassamento del pet'],
     ARRAY['Mani pulite', 'Ambiente calmo']),

    -- Giorno 2
    (2, 'Desensibilizzazione Graduale', 'Esposizione controllata ai trigger di ansia per ridurre la reattività.', 25,
     ARRAY['Identifica il trigger principale dell''ansia', 'Inizia con una versione molto attenuata del trigger', 'Mantieni una distanza sicura', 'Premia la calma con snack', 'Avvicinati gradualmente solo se il pet rimane calmo', 'Termina sempre con un''esperienza positiva'],
     ARRAY['Snack ad alto valore', 'Giocattolo preferito', 'Guinzaglio se necessario']),
    (2, 'Gioco Interattivo Calmo', 'Attività di gioco a bassa intensità per mantenere il pet impegnato senza sovrastimolazione.', 15,
     ARRAY['Utilizza puzzle alimentari semplici', 'Nascondi snack in diversi punti della stanza', 'Incoraggia la ricerca con voce calma', 'Premia ogni successo', 'Mantieni il ritmo lento e rilassato', 'Concludi con coccole tranquille'],
     ARRAY['Puzzle alimentari', 'Snack piccoli', 'Tempo e pazienza']),
    (2, 'Training di Base Rilassato', 'Comandi semplici praticati in modo calmo per aumentare la fiducia.', 20,
     ARRAY['Inizia con il comando "seduto"', 'Usa rinforzi positivi immediati', 'Mantieni sessioni brevi (5 minuti per comando)', 'Pratica "resta" per aumentare l''autocontrollo', 'Termina con "bravo" e coccole', 'Ripeti solo se il pet è rilassato'],
     ARRAY['Snack di ricompensa', 'Voce calma', 'Pazienza'])
) AS exercises(day_num, exercise_title, exercise_description, exercise_duration, exercise_instructions, exercise_materials);