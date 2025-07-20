-- Crea protocollo "Controllo Aggressività Reattiva"
-- Durata: 7 giorni, Livello: difficile, 21 esercizi totali

INSERT INTO public.ai_training_protocols (
  id,
  title,
  description,
  category,
  difficulty,
  duration_days,
  target_behavior,
  triggers,
  required_materials,
  status,
  is_public,
  ai_generated,
  veterinary_approved,
  success_rate,
  community_rating,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Controllo Aggressività Reattiva',
  'Protocollo avanzato per la gestione sicura dell''aggressività reattiva. Priorità assoluta sulla sicurezza, controllo impulsi e sviluppo comportamenti alternativi. Richiede supervisione professionale.',
  'comportamento',
  'difficile',
  7,
  'Ridurre reattività aggressiva, sviluppare autocontrollo, implementare comportamenti alternativi sicuri',
  ARRAY['trigger specifici', 'over-arousal', 'frustrazioni', 'resource guarding', 'territorial response', 'fear-based aggression'],
  ARRAY['guinzaglio sicurezza rinforzato', 'barriere fisiche', 'snack altissimo valore', 'spazi controllati', 'timer', 'misuratore distanza'],
  'available',
  true,
  true,
  false,
  82.0,
  4.2,
  now(),
  now()
);

-- Ottieni l'ID del protocollo appena creato
WITH new_protocol AS (
  SELECT id FROM public.ai_training_protocols 
  WHERE title = 'Controllo Aggressività Reattiva' 
  ORDER BY created_at DESC LIMIT 1
)

-- GIORNO 1: SAFETY MANAGEMENT E THRESHOLD IDENTIFICATION
INSERT INTO public.ai_training_exercises (
  protocol_id, day_number, title, description, duration_minutes, 
  exercise_type, instructions, materials, created_at, updated_at
)
SELECT 
  new_protocol.id, 1, 'Identificazione Threshold Sicurezza',
  'Determinare la distanza minima sicura dai trigger prima che inizi arousal. FONDAMENTALE per tutti gli esercizi successivi.',
  10,
  'behavioral',
  ARRAY[
    'Identificare trigger principale con animale sotto controllo totale',
    'Avvicinare gradualmente misurando ogni metro di distanza',
    'Fermarsi IMMEDIATAMENTE al primo segno di tensione corporea',
    'Annotare distanza esatta e non scendere mai sotto questa soglia'
  ],
  ARRAY['guinzaglio sicurezza', 'metro misuratore', 'barriere', 'notes per documentazione'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 1, 'Protocollo Sicurezza Emergenza',
  'Stabilire procedure chiare per gestire escalation e garantire sicurezza assoluta.',
  8,
  'behavioral',
  ARRAY[
    'Praticare manovra di allontanamento rapido dal trigger',
    'Testare efficacia comando "via" per uscita immediata',
    'Verificare che guinzaglio e equipment siano sicuri al 100%',
    'Stabilire rotta di fuga sicura in ogni ambiente di training'
  ],
  ARRAY['guinzaglio rinforzato', 'spazio con uscite multiple', 'equipment sicurezza'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 1, 'Baseline Impulse Control',
  'Valutare livello attuale di autocontrollo in condizioni neutrali per stabilire punto di partenza.',
  12,
  'behavioral',
  ARRAY[
    'Testare comando "aspetta" con snack ad alto valore',
    'Misurare durata massima di autocontrollo senza stress',
    'Osservare segnali precoci di frustrazione',
    'Stabilire durata baseline per futuri progressi'
  ],
  ARRAY['snack altissimo valore', 'timer', 'ambiente neutrale'],
  now(), now()
FROM new_protocol

-- GIORNO 2: RAFFORZAMENTO SAFETY E THRESHOLD
UNION ALL
SELECT 
  new_protocol.id, 2, 'Training "Look At Me" Sotto Soglia',
  'Sviluppare attention e focus mantenendo sempre distanza di sicurezza dal trigger.',
  10,
  'behavioral',
  ARRAY[
    'Posizionarsi 2 metri OLTRE la threshold identificata',
    'Richiedere contatto visivo con comando "guardami"',
    'Premiare immediatamente ogni sguardo anche brevissimo',
    'Non aumentare mai criteri se mostra tensione'
  ],
  ARRAY['snack premium', 'trigger a distanza sicura', 'guinzaglio sicurezza'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 2, 'Condizionamento Marker di Calma',
  'Creare associazione tra marker specifico e stato di calma per interruzione rapida arousal.',
  15,
  'behavioral',
  ARRAY[
    'Utilizzare marker distintivo (es. "bravo calmo") solo per stati zen',
    'Associare marker con snack di valore massimo',
    'Praticare in assenza completa di trigger',
    'Ripetere fino a risposta condizionata automatica'
  ],
  ARRAY['marker audio distintivo', 'snack massimo valore', 'ambiente neutrale'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 2, 'Distance Management Training',
  'Insegnare movimento controllato per mantenere sempre distanza di sicurezza.',
  12,
  'physical',
  ARRAY[
    'Praticare movimento laterale e indietreggiamento su comando',
    'Utilizzare comando "indietro" per aumentare distanza da trigger',
    'Premiare ogni movimento che aumenta sicurezza',
    'Non praticare mai avvicinamento, solo allontanamento'
  ],
  ARRAY['guinzaglio lungo', 'spazio aperto', 'target di movimento'],
  now(), now()
FROM new_protocol

-- GIORNO 3: IMPULSE CONTROL TRAINING INTENSIVO
UNION ALL
SELECT 
  new_protocol.id, 3, 'Impulse Control Graduato',
  'Sviluppare autocontrollo con incrementi minimi per evitare fallimenti.',
  15,
  'behavioral',
  ARRAY[
    'Iniziare con "aspetta" per 2 secondi con snack normale',
    'Aumentare di 1 secondo solo se precedente è perfetto',
    'Utilizzare snack valore crescente per durate maggiori',
    'Fermarsi immediatamente se mostra frustrazione'
  ],
  ARRAY['timer preciso', 'snack valore graduato', 'ambiente controllato'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 3, 'Training "Stop" di Emergenza',
  'Sviluppare comando di arresto immediato per interruzione rapida escalation.',
  10,
  'behavioral',
  ARRAY[
    'Insegnare "stop" durante movimento normale (non reattivo)',
    'Associare arresto immediato con premio massimo',
    'Praticare da diverse andature e situazioni',
    'Garantire risposta istantanea prima di applicare a reattività'
  ],
  ARRAY['snack massimo valore', 'spazio movimento', 'guinzaglio sicurezza'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 3, 'Cognitive Load Training',
  'Aumentare carico cognitivo per ridurre risorse disponibili per reattività.',
  12,
  'mental',
  ARRAY[
    'Richiedere sequenza comandi: seduto-terra-resta-vieni',
    'Aumentare complessità solo se mantiene calma',
    'Utilizzare durante presenza molto distante di trigger',
    'Fermarsi se mostra sovraccarico mentale'
  ],
  ARRAY['sequenza comandi scritta', 'snack rinforzo', 'trigger molto distante'],
  now(), now()
FROM new_protocol

-- GIORNO 4: CONSOLIDAMENTO IMPULSE CONTROL
UNION ALL
SELECT 
  new_protocol.id, 4, 'Testing Threshold con Control',
  'Testare soglia con strumenti di controllo sviluppati, senza mai superarla.',
  15,
  'behavioral',
  ARRAY[
    'Avvicinarsi alla threshold (non superarla) con "guardami" attivo',
    'Mantenere posizione sicura con controllo completo',
    'Utilizzare marker di calma alla minima tensione',
    'Allontanarsi immediatamente se perde focus'
  ],
  ARRAY['metro misuratore', 'marker calma', 'snack premium', 'via di fuga'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 4, 'Autocontrollo con Frustrazione',
  'Sviluppare tolleranza a frustrazione minima mantenendo autocontrollo.',
  10,
  'behavioral',
  ARRAY[
    'Ritardare gratificazione di 5-10 secondi oltre comfort zone',
    'Osservare segnali di mounting frustration',
    'Interrompere PRIMA di escalation con marker calma',
    'Premiare qualsiasi autocontrollo mostrato'
  ],
  ARRAY['timer', 'snack alto valore', 'marker calma', 'osservazione attenta'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 4, 'Alternative Response Training',
  'Iniziare insegnamento comportamento alternativo da eseguire invece di reazione.',
  12,
  'behavioral',
  ARRAY[
    'Insegnare "seduto-guardami" come risposta standard a stress',
    'Praticare in assenza di trigger fino a automatismo',
    'Premiare massimamente ogni esecuzione volontaria',
    'Non richiedere performance, solo partecipazione'
  ],
  ARRAY['target comportamento alternativo', 'snack massimo valore', 'ambiente neutrale'],
  now(), now()
FROM new_protocol

-- GIORNO 5: COUNTER-CONDITIONING E ALTERNATIVE BEHAVIORS
UNION ALL
SELECT 
  new_protocol.id, 5, 'Counter-Conditioning Distanza Massima',
  'Iniziare associazione positiva con trigger mantenendo distanza massima di sicurezza.',
  15,
  'behavioral',
  ARRAY[
    'Posizionare trigger alla distanza massima tollerata',
    'Associare presenza trigger con snack massimo valore',
    'Non richiedere performances, solo tolleranza passiva',
    'Interrompere se mostra qualsiasi arousal'
  ],
  ARRAY['trigger controllato', 'distanza misurata', 'snack valore massimo'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 5, 'Training Comportamento Sostitutivo',
  'Rafforzare comportamento alternativo specifico da usare invece di reattività.',
  10,
  'behavioral',
  ARRAY[
    'Consolidare "target hand" come alternativa a lunge forward',
    'Praticare con crescente intensità di distrazione',
    'Premiare ogni tentativo anche imperfetto',
    'Rendere comportamento più gratificante della reattività'
  ],
  ARRAY['target hand', 'snack valore estremo', 'distrazioni graduate'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 5, 'Threshold Expansion Micro-Step',
  'Tentare riduzione threshold di solo 10cm se controllo è perfetto.',
  12,
  'behavioral',
  ARRAY[
    'Ridurre distanza di SOLI 10cm se giorni precedenti perfetti',
    'Mantenere nuova distanza per tutto esercizio',
    'Tornare a distanza maggiore al primo segno tensione',
    'Documentare ogni cambiamento per progressi futuri'
  ],
  ARRAY['metro preciso', 'documentazione progressi', 'marker calma', 'via fuga'],
  now(), now()
FROM new_protocol

-- GIORNO 6: COMPORTAMENTI ALTERNATIVI AVANZATI
UNION ALL
SELECT 
  new_protocol.id, 6, 'Integration Alternative Behaviors',
  'Integrare tutti i comportamenti alternativi in sequenza fluida.',
  15,
  'behavioral',
  ARRAY[
    'Praticare sequenza: "guardami" → "seduto" → "target hand" → "marker calma"',
    'Eseguire in presenza trigger a distanza sicura',
    'Permettere auto-selezione del comportamento preferito',
    'Premiare qualsiasi comportamento della sequenza'
  ],
  ARRAY['sequenza comportamenti', 'trigger distante', 'snack valore massimo'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 6, 'Emergency Redirect Training',
  'Perfezionare redirect immediato per prevenire escalation.',
  10,
  'behavioral',
  ARRAY[
    'Praticare redirect rapido con "stop" → "guardami" → "via"',
    'Utilizzare trigger a threshold per testare efficacia',
    'Timing deve essere perfetto: intervenire prima di arousal',
    'Premiare massimamente ogni redirect riuscito'
  ],
  ARRAY['sequenza emergency', 'trigger threshold', 'timing perfetto'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 6, 'Stress Recovery Training',
  'Insegnare recupero rapido da episodi di stress per prevenire accumulo.',
  12,
  'behavioral',
  ARRAY[
    'Simulare stress lieve e praticare recovery con marker calma',
    'Utilizzare tecniche respirazione profonda (modellando)',
    'Associare recovery con ricompense ultra-high value',
    'Misurare tempo di recovery per monitorare progressi'
  ],
  ARRAY['marker calma', 'snack ultra-premium', 'timer recovery', 'tecniche calma'],
  now(), now()
FROM new_protocol

-- GIORNO 7: INTEGRATION E REAL-WORLD APPLICATION
UNION ALL
SELECT 
  new_protocol.id, 7, 'Test Integration Completa',
  'Valutare integrazione di tutti gli strumenti sviluppati in scenario controllato.',
  15,
  'behavioral',
  ARRAY[
    'Esporre a trigger alla threshold con tutti strumenti disponibili',
    'Permettere auto-selezione delle strategie apprese',
    'Osservare per miglioramenti rispetto al baseline',
    'Documentare successi e aree che necessitano rinforzo'
  ],
  ARRAY['toolkit completo', 'trigger threshold', 'osservazione strutturata'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 7, 'Real-World Simulation',
  'Simulare scenario reale mantenendo controllo e sicurezza assoluti.',
  12,
  'behavioral',
  ARRAY[
    'Replicare situazione problema in versione controllata',
    'Mantenere sempre possibilità di controllo e uscita',
    'Utilizzare tutti strumenti e strategie sviluppate',
    'Interrompere immediatamente se supera capacità'
  ],
  ARRAY['scenario controllato', 'safety equipment', 'exit strategy', 'toolkit completo'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 7, 'Protocollo Mantenimento Sicurezza',
  'Stabilire piano mantenimento per prevenire regressioni e garantire sicurezza continua.',
  10,
  'behavioral',
  ARRAY[
    'Creare schedule pratica quotidiana degli strumenti chiave',
    'Identificare warning signs per intervento precoce',
    'Stabilire contingency plan per situazioni impreviste',
    'Pianificare follow-up regolari per monitoraggio'
  ],
  ARRAY['piano scritto', 'schedule mantenimento', 'protocolli emergenza'],
  now(), now()
FROM new_protocol;