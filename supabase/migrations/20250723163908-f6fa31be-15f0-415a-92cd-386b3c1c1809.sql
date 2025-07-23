-- RICREAZIONE ESERCIZI PER TUTTI I PROTOCOLLI PULITI

-- Controllo Aggressività Reattiva (7 giorni)
WITH protocol_ids AS (
  SELECT id, title FROM ai_training_protocols WHERE is_public = true
)
INSERT INTO ai_training_exercises (protocol_id, day_number, title, description, exercise_type, duration_minutes, instructions, materials, effectiveness_score)
SELECT 
  p.id,
  day_data.day_number,
  day_data.title,
  day_data.description,
  day_data.exercise_type,
  day_data.duration_minutes,
  day_data.instructions,
  day_data.materials,
  day_data.effectiveness_score
FROM protocol_ids p,
LATERAL (VALUES 
  -- Controllo Aggressività Reattiva - Giorno 1
  (1, 'Protocollo Sicurezza Emergenza', 'Stabilire procedure chiare per gestire escalation e garantire sicurezza assoluta.', 'behavioral', 8, 
   ARRAY['Praticare manovra di allontanamento rapido dal trigger', 'Testare efficacia comando "via" per uscita immediata', 'Verificare che guinzaglio e equipment siano sicuri al 100%', 'Stabilire rotta di fuga sicura in ogni ambiente di allenamento'], 
   ARRAY['guinzaglio rinforzato', 'spazio con uscite multiple', 'equipment sicurezza'], 0),
   
  (1, 'Identificazione Threshold Sicurezza', 'Determinare la distanza minima sicura dai trigger prima che inizi arousal. FONDAMENTALE per tutti gli esercizi successivi.', 'behavioral', 10,
   ARRAY['Identificare trigger principale con animale sotto controllo totale', 'Avvicinare gradualmente misurando ogni metro di distanza', 'Fermarsi IMMEDIATAMENTE al primo segno di tensione corporea', 'Annotare distanza esatta e non scendere mai sotto questa soglia'],
   ARRAY['guinzaglio sicurezza', 'metro misuratore', 'barriere', 'notes per documentazione'], 0),
   
  (1, 'Baseline Impulse Control', 'Evaluate current level of self-control in neutral conditions to establish starting point.', 'behavioral', 12,
   ARRAY['Testare comando "aspetta" con snack ad alto valore', 'Misurare durata massima di autocontrollo senza stress', 'Osservare segnali precoci di frustrazione', 'Stabilire durata baseline per futuri progressi'],
   ARRAY['snack altissimo valore', 'timer', 'ambiente neutrale'], 0),
   
  -- Controllo Aggressività Reattiva - Giorno 2
  (2, 'Look At Me Training Under Threshold', 'Sviluppare attention e focus mantenendo sempre distanza di sicurezza dal trigger.', 'behavioral', 10,
   ARRAY['Posizionarsi 2 metri OLTRE la threshold identificata', 'Richiedere contatto visivo con comando "guardami"', 'Premiare immediatamente ogni sguardo anche brevissimo', 'Non aumentare mai criteri se mostra tensione'],
   ARRAY['snack premium', 'trigger a distanza sicura', 'guinzaglio sicurezza'], 0),
   
  (2, 'Distance Management Training', 'Insegnare movimento controllato per mantenere sempre distanza di sicurezza.', 'physical', 12,
   ARRAY['Praticare movimento laterale e indietreggiamento su comando', 'Utilizzare comando "indietro" per aumentare distanza da trigger', 'Premiare ogni movimento che aumenta sicurezza', 'Non praticare mai avvicinamento, solo allontanamento'],
   ARRAY['guinzaglio lungo', 'spazio aperto', 'target di movimento'], 0),
   
  (2, 'Calm Marker Conditioning', 'Create association between specific marker and calm state for rapid arousal interruption.', 'behavioral', 15,
   ARRAY['Utilizzare marker distintivo (es. "bravo calmao") solo per stati zen', 'Associare marker con snack di valore massimo', 'Praticare in assenza completa di trigger', 'Ripetere fino a risposta condizionata automatica'],
   ARRAY['marker audio distintivo', 'snack massimo valore', 'ambiente neutrale'], 0),
   
  -- Controllo Aggressività Reattiva - Giorno 3
  (3, 'Emergency Stop Training', 'Sviluppare comando di arresto immediato per interruzione rapida escalation.', 'behavioral', 10,
   ARRAY['Insegnare "stop" durante movimento normale (non reattivo)', 'Associare arresto immediato con premio massimo', 'Praticare da diverse andature e situazioni', 'Garantire risposta istantanea prima di applicare a reattività'],
   ARRAY['snack massimo valore', 'spazio movimento', 'guinzaglio sicurezza'], 0),
   
  (3, 'Graduated Impulse Control', 'Sviluppare autocontrollo con incrementi minimi per evitare fallimenti.', 'behavioral', 15,
   ARRAY['Iniziare con "aspetta" per 2 secondi con snack normale', 'Aumentare di 1 secondo solo se precedente è perfetto', 'Utilizzare snack valore crescente per durate maggiori', 'Fermarsi immediatamente se mostra frustrazione'],
   ARRAY['timer preciso', 'snack valore graduato', 'ambiente controllato'], 0),
   
  (3, 'Cognitive Load Training', 'Increase cognitive load to reduce resources available for reactivity.', 'mental', 12,
   ARRAY['Richiedere sequenza comandi: seduto-terra-resta-vieni', 'Aumentare complessità solo se mantiene calma', 'Utilizzare durante presenza molto distante di trigger', 'Fermarsi se mostra sovraccarico mentale'],
   ARRAY['sequenza comandi scritta', 'snack rinforzo', 'trigger molto distante'], 0),
   
  -- Giorni 4-7 continuano...
  (4, 'Alternative Response Training', 'Start teaching alternative behavior to perform instead of reaction.', 'behavioral', 12,
   ARRAY['Insegnare "seduto-guardami" come risposta standard a stress', 'Praticare in assenza di trigger fino a automatismo', 'Premiare massimamente ogni esecuzione volontaria', 'Non richiedere performance, solo partecipazione'],
   ARRAY['target comportamento alternativo', 'snack massimo valore', 'ambiente neutrale'], 0),
   
  (5, 'Substitute Behavior Training', 'Rafforzare comportamento alternativo specifico da usare invece di reattività.', 'behavioral', 10,
   ARRAY['Consolidare "target hand" come alternativa a lunge forward', 'Praticare con crescente intensità di distrazione', 'Premiare ogni tentativo anche imperfetto', 'Rendere comportamento più gratificante della reattività'],
   ARRAY['target hand', 'snack valore estremo', 'distrazioni graduate'], 0),
   
  (6, 'Emergency Redirect Training', 'Perfezionare redirect immediato per prevenire escalation.', 'behavioral', 10,
   ARRAY['Praticare redirect rapido con "stop" → "guardami" → "via"', 'Utilizzare trigger a threshold per testare efficacia', 'Timing deve essere perfetto: intervenire prima di arousal', 'Premiare massimamente ogni redirect riuscito'],
   ARRAY['sequenza emergency', 'trigger threshold', 'timing perfetto'], 0),
   
  (7, 'Safety Maintenance Protocol', 'Stabilire piano mantenimento per prevenire regressioni e garantire sicurezza continua.', 'behavioral', 10,
   ARRAY['Creare schedule pratica quotidiana degli strumenti chiave', 'Identificare warning signs per intervento precoce', 'Stabilire contingency plan per situazioni impreviste', 'Pianificare follow-up regolari per monitoraggio'],
   ARRAY['piano scritto', 'schedule mantenimento', 'protocolli emergenza'], 0)
) AS day_data(day_number, title, description, exercise_type, duration_minutes, instructions, materials, effectiveness_score)
WHERE p.title = 'Controllo Aggressività Reattiva';

-- Log completamento
DO $$
BEGIN
  RAISE NOTICE 'Creati esercizi per Controllo Aggressività Reattiva: % esercizi', 
    (SELECT COUNT(*) FROM ai_training_exercises WHERE protocol_id IN (SELECT id FROM ai_training_protocols WHERE title = 'Controllo Aggressività Reattiva'));
END $$;