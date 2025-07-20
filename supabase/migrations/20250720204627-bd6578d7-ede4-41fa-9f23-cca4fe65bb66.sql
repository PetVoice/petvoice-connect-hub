-- Continuo con tutti gli esercizi dei giorni rimanenti per il protocollo "Stop Comportamenti Distruttivi"
WITH protocol_id AS (
  SELECT id FROM ai_training_protocols 
  WHERE title = 'Stop Comportamenti Distruttivi' 
  ORDER BY created_at DESC 
  LIMIT 1
)

-- GIORNO 2: Rinforzo Prevenzione e Primi Successi
INSERT INTO public.ai_training_exercises (
  protocol_id,
  day_number,
  title,
  description,
  duration_minutes,
  exercise_type,
  instructions,
  materials,
  completed
) 
SELECT 
  p.id,
  2,
  'Tecnica Sostituzione Proattiva',
  'Anticipa i momenti di maggior rischio offrendo alternative prima che il comportamento inappropriato si manifesti.',
  12,
  'behavioral',
  ARRAY[
    'Osserva i segnali pre-distruttivi (annusare, girare, irrequietezza)',
    'Appena noti questi segnali, presenta immediatamente un Kong riempito',
    'Accompagna con comando positivo: "Prendi questo!" con tono entusiasta',
    'Resta vicino i primi 2-3 minuti per rinforzare la scelta corretta',
    'Documenta orari e trigger che hanno preceduto l''intervento',
    'Ripeti per almeno 6 episodi durante la giornata'
  ],
  ARRAY['Kong preparati', 'Timer', 'Quaderno osservazioni', 'Premi vocali entusiasti'],
  false
FROM protocol_id p

UNION ALL

SELECT 
  p.id,
  2,
  'Gioco Strutturato Anti-Noia',
  'Sessione di gioco intensivo per scaricare energia fisica e mentale, riducendo la probabilità di comportamenti distruttivi.',
  15,
  'physical',
  ARRAY[
    'Inizia con 5 minuti di gioco fisico attivo (tira e molla, palla)',
    'Introduci puzzle feeder con cibo/premi per stimolazione mentale',
    'Alterna tra attività fisica e mentale ogni 3-4 minuti',
    'Termina quando l''animale mostra segni di stanchezza positiva',
    'Lascia disponibile un giocattolo masticabile per il post-gioco',
    'Osserva se dopo questa sessione diminuiscono comportamenti distruttivi'
  ],
  ARRAY['Giocattolo tira e molla', 'Palla', 'Puzzle feeder', 'Premi/cibo', 'Acqua fresca'],
  false
FROM protocol_id p

UNION ALL

SELECT 
  p.id,
  2,
  'Routine Pre-Uscita Preventiva',
  'Stabilire una routine specifica prima di lasciare casa per prevenire ansia da separazione e comportamenti distruttivi.',
  8,
  'behavioral',
  ARRAY[
    '30 minuti prima di uscire: gioco fisico intenso per stancare',
    '15 minuti prima: presenta Kong super-appetitoso (con cibo speciale)',
    '10 minuti prima: ignora l''animale per ridurre ansia da separazione',
    'All''uscita: nessun saluto drammatico, esci normalmente',
    'Lascia radio/TV accesa a volume basso per compagnia',
    'Testa questa routine anche quando non devi uscire davvero'
  ],
  ARRAY['Kong speciale', 'Cibo ad alto valore', 'Radio/TV', 'Timer'],
  false
FROM protocol_id p;