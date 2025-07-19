-- Esercizi per "Socializzazione Progressiva" (5 giorni)
WITH protocol_id AS (
  SELECT id FROM ai_training_protocols WHERE title = 'Socializzazione Progressiva'
)
INSERT INTO ai_training_exercises (protocol_id, day_number, title, description, instructions, duration_minutes, materials)
SELECT 
  protocol_id.id,
  day_number,
  title,
  description,
  instructions,
  duration_minutes,
  materials
FROM protocol_id,
(VALUES
  (1, 'Assessment Sociale Iniziale', 'Valutare il livello attuale di comfort sociale del pet', ARRAY['Porta il pet in un''area pubblica tranquilla (parco, piazza poco frequentata)', 'Osserva la reazione a: persone che passano, bambini, altri cani a distanza', 'Annota segni di stress: ansimare, tremare, nascondersi, evitare', 'Annota segni di interesse positivo: coda che scodinzola, orecchie in avanti', 'Mantieni sempre distanza di sicurezza, NON forzare interazioni', 'Durata: 20 minuti di osservazione passiva'], 30, ARRAY['Guinzaglio', 'Blocco appunti', 'Premi tranquillizzanti', 'Borraccia per il pet']),
  
  (2, 'Socializzazione a Distanza con Persone', 'Abituare gradualmente alla presenza umana mantenendo controllo', ARRAY['Scegli un posto dove puoi controllare la distanza dalle persone', 'Inizia a 10 metri di distanza da persone ferme (panchina, fermata bus)', 'Quando il pet guarda le persone senza stress, premia', 'Se si avvicina spontaneamente ma senza eccitazione, permetti 1-2 passi', 'Se mostra stress, aumenta distanza immediatamente', 'Sessioni brevi: 15 minuti x 2 volte'], 35, ARRAY['Premi di alto valore', 'Guinzaglio da addestramento', 'Pazienza estrema']),
  
  (3, 'Incontri Controllati con Cani Calmi', 'Interazioni positive con cani ben socializzati', ARRAY['Organizza incontro con cane amichevole e ben addestrato (chiedi aiuto ad amici)', 'I cani devono essere al guinzaglio, a 5 metri di distanza inizialmente', 'Camminate parallele senza contatto diretto', 'Se entrambi i cani sono rilassati, diminuisci distanza gradualmente', 'Permetti annusata SOLO se entrambi mostrano segnali positivi', 'Interrompi al primo segno di tensione'], 40, ARRAY['Cane helper ben socializzato', 'Due guinzagli lunghi', 'Due persone', 'Premi per entrambi i cani']),
  
  (4, 'Interazione Diretta Supervisionata', 'Prime interazioni sociali guidate e controllate', ARRAY['Invita persona amica e tranquilla a casa o in spazio neutro', 'La persona deve ignorare completamente il pet all''inizio', 'Siediti normalmente, fai conversazione, ignora il pet', 'Se il pet si avvicina spontaneamente, la persona può offrire premio', 'NO carezze iniziali, solo premiare vicinanza volontaria', 'Gradualmente permettere tocco dolce se pet è a suo agio'], 45, ARRAY['Persona collaborativa e paziente', 'Premi speciali', 'Ambiente familiare al pet']),
  
  (5, 'Consolidamento in Ambiente Pubblico', 'Test finale delle competenze sociali acquisite', ARRAY['Porta il pet in ambiente moderatamente stimolante (centro città tranquillo)', 'Cammina normale, fermate occasionali per osservare', 'Se persone vogliono accarezzare, gestisci tu l''interazione', 'Permetti contatto SOLO se il pet mostra interesse', 'Premia ogni comportamento sociale positivo', 'Documenta i progressi rispetto al giorno 1'], 50, ARRAY['Guinzaglio comodo', 'Premi celebrativi', 'Fiducia nei progressi fatti'])
) AS exercises(day_number, title, description, instructions, duration_minutes, materials);

-- Aggiorna la durata del protocollo per essere coerente
UPDATE ai_training_protocols 
SET duration_days = 5 
WHERE title = 'Socializzazione Progressiva';