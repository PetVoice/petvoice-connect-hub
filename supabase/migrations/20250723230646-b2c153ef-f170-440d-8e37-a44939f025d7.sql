-- ============ ESERCIZI PER "Superare la Tristezza" (5 giorni x 3 = 15 esercizi) ============
INSERT INTO public.ai_training_exercises (protocol_id, day_number, title, description, duration_minutes, instructions, materials)
SELECT 
  p.id,
  exercises.day_number,
  exercises.title,
  exercises.description,
  exercises.duration_minutes,
  exercises.instructions,
  exercises.materials
FROM (SELECT id FROM public.ai_training_protocols WHERE target_behavior = 'triste' LIMIT 1) p
CROSS JOIN (VALUES
  -- Giorno 1
  (1, 'Attivazione Fisica Dolce', 'Movimento leggero per stimolare endorfine', 20, ARRAY['Passeggiata lenta ma costante', 'Evita sforzi eccessivi', 'Mantieni ritmo regolare', 'Premia partecipazione attiva'], ARRAY['Guinzaglio comodo', 'Percorso piacevole', 'Acqua fresca']),
  (1, 'Stimolazione Sensoriale Positiva', 'Esperienze piacevoli per risollevare umore', 15, ARRAY['Offri odori interessanti da annusare', 'Texture piacevoli da toccare', 'Suoni rilassanti ma energizzanti', 'Premia curiosità ed esplorazione'], ARRAY['Essenze naturali', 'Materiali tattili', 'Musica uplifting']),
  (1, 'Gioco Motivazionale Leggero', 'Attività ludica per riaccendere interesse', 25, ARRAY['Usa il suo giocattolo preferito del passato', 'Movimenti lenti ma incoraggianti', 'Celebra ogni piccola partecipazione', 'Non forzare se non risponde'], ARRAY['Giocattolo del cuore', 'Premi motivanti', 'Pazienza infinita']),
  
  -- Giorno 2
  (2, 'Socializzazione Gentile', 'Incontri positivi per stimolare interazione', 25, ARRAY['Invita persona o animale che ama', 'Ambiente familiare e sicuro', 'Interazioni brevi ma piacevoli', 'Premia ogni segnale di apertura sociale'], ARRAY['Amico fidato', 'Ambiente sicuro', 'Snack condivisi']),
  (2, 'Attività Creative e Mentali', 'Stimolazione cognitiva per distogliere da tristezza', 20, ARRAY['Puzzle alimentari semplici', 'Nascondino con snack', 'Giochi di problem solving facili', 'Premia tentativi e creatività'], ARRAY['Puzzle facili', 'Snack nascosti', 'Problemi semplici']),
  (2, 'Routine di Comfort', 'Attività rassicuranti che danno sicurezza', 15, ARRAY['Momenti di coccole se gradisce', 'Spazzolamento rilassante', 'Massaggio dolce', 'Creare senso di sicurezza e amore'], ARRAY['Spazzola morbida', 'Mani dolci', 'Ambiente caldo']),
  
  -- Giorno 3
  (3, 'Esplorazione Guidata', 'Scoperta di nuovi ambienti stimolanti', 30, ARRAY['Porta in posto nuovo ma non troppo eccitante', 'Lascia esplorare al suo ritmo', 'Incoraggia curiosità naturale', 'Documenta momenti di interesse'], ARRAY['Nuova location interessante', 'Tempo libero', 'Supporto discreto']),
  (3, 'Training Positivo Motivante', 'Apprendimento di nuove competenze per autostima', 25, ARRAY['Insegna trick molto semplice', 'Usa solo rinforzo positivo', 'Sessioni brevi e di successo', 'Celebra ogni piccolo progresso'], ARRAY['Trick facile', 'Clicker se gradisce', 'Premi eccellenti']),
  (3, 'Attività di Gruppo Familiare', 'Coinvolgimento con tutta la famiglia', 20, ARRAY['Attività che coinvolgono tutti', 'Giochi di famiglia', 'Momenti condivisi positivi', 'Focus su connessione e appartenenza'], ARRAY['Coinvolgimento familiare', 'Attività condivise', 'Amore collettivo']),
  
  -- Giorno 4
  (4, 'Sfida Motivazionale Progressiva', 'Obiettivi raggiungibili per aumentare fiducia', 35, ARRAY['Imposta obiettivo ambizioso ma fattibile', 'Suddividi in passi molto piccoli', 'Celebra ogni milestone raggiunto', 'Costruisci senso di realizzazione'], ARRAY['Obiettivo personalizzato', 'Piano step-by-step', 'Celebrazioni frequent']),
  (4, 'Attività Fisiche Energizzanti', 'Movimento più intenso per produrre endorfine', 30, ARRAY['Aumenta intensità esercizio gradualmente', 'Giochi più dinamici', 'Corsa leggera se appropriato', 'Premia energia e vitalità mostrate'], ARRAY['Spazio per movimento', 'Giochi dinamici', 'Energia crescente']),
  (4, 'Stimolazione Multi-sensoriale', 'Esperienze ricche per risvegliare interesse', 15, ARRAY['Combina odori, suoni, texture, sapori', 'Crea esperienza immersiva positiva', 'Premia esplorazione attiva', 'Varia stimoli per mantenere interesse'], ARRAY['Setup multisensoriale', 'Varietà stimoli', 'Esperienza ricca']),
  
  -- Giorno 5
  (5, 'Celebrazione dei Progressi', 'Festa per riconoscere miglioramenti', 30, ARRAY['Organizza piccola festa per lui', 'Invita le sue persone/animali preferiti', 'Attività tutte positive e premianti', 'Documenta momenti di gioia'], ARRAY['Festa personalizzata', 'Amici del cuore', 'Attività preferite']),
  (5, 'Consolidamento Energie Positive', 'Rinforzo delle nuove abitudini energetiche', 25, ARRAY['Ripeti le attività che l hanno più motivato', 'Combina elementi che hanno funzionato meglio', 'Stabilisci routine energetica quotidiana', 'Pianifica mantenimento energia'], ARRAY['Mix attività efficaci', 'Routine energetica', 'Piano futuro']),
  (5, 'Proiezione Futura Positiva', 'Impostazione per mantenere umore sollevato', 15, ARRAY['Stabilisci attività settimanali anti-tristezza', 'Identifica segnali precoci di calo umore', 'Prepara interventi rapidi', 'Mantieni momentum positivo conquistato'], ARRAY['Piano settimanale', 'Sistema early warning', 'Kit anti-tristezza'])
) AS exercises(day_number, title, description, duration_minutes, instructions, materials);