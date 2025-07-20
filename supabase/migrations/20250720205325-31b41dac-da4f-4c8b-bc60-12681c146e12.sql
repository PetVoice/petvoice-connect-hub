-- Ricreo tutti gli esercizi per il protocollo "Stop Comportamenti Distruttivi"
-- Prima rimuovo eventuali esercizi orfani
DELETE FROM ai_training_exercises 
WHERE protocol_id IN (
  SELECT e.protocol_id 
  FROM ai_training_exercises e
  LEFT JOIN ai_training_protocols p ON e.protocol_id = p.id
  WHERE p.id IS NULL
);

-- Ora inserisco tutti gli esercizi collegati al protocollo corretto
WITH protocol_data AS (
  SELECT id FROM ai_training_protocols 
  WHERE title = 'Stop Comportamenti Distruttivi' 
  LIMIT 1
)

-- GIORNO 1: Identificazione Trigger e Prevenzione Base
INSERT INTO public.ai_training_exercises (
  protocol_id, day_number, title, description, duration_minutes, exercise_type, instructions, materials, completed
) 
SELECT 
  p.id, 1, 'Audit Casa e Identificazione Zone Rischio',
  'Mappatura completa degli oggetti a rischio e identificazione dei trigger ambientali che scatenano comportamenti distruttivi.',
  12, 'behavioral',
  ARRAY['Cammina per casa identificando tutti gli oggetti morsi/danneggiati', 'Fotografa le zone più colpite per documentare il pattern', 'Annota orari e situazioni quando avvengono i danni', 'Rimuovi temporaneamente oggetti di valore dalle zone accessibili', 'Identifica 3 fattori scatenanti principali (noia, ansia, energia)', 'Crea una mappa visiva delle "zone proibite" vs "zone permesse"'],
  ARRAY['Quaderno/app per annotazioni', 'Fotocamera smartphone', 'Nastro segna-pavimento'],
  false
FROM protocol_data p

UNION ALL SELECT p.id, 1, 'Setup Ambiente Anti-Distruttivo', 'Preparazione strategica dell''ambiente per ridurre opportunità di comportamenti inappropriati e creare alternative positive.', 15, 'behavioral', ARRAY['Applica spray deterrente naturale su mobili e oggetti a rischio', 'Posiziona giocattoli masticabili appropriati in ogni stanza', 'Crea una "stazione masticazione" con 3-4 opzioni diverse', 'Installa barriere fisiche dove necessario (baby gates)', 'Prepara Kong riempiti con cibo e congelali per utilizzo futuro', 'Verifica che non ci siano oggetti piccoli pericolosi a portata'], ARRAY['Spray deterrente', '4-5 giocattoli masticabili diversi', 'Kong', 'Cibo umido/pasta', 'Baby gates se necessario'], false FROM protocol_data p

UNION ALL SELECT p.id, 1, 'Primo Training "NO" e Redirezione', 'Introduzione del comando "NO" seguito da immediata redirezione su oggetto appropriato per stabilire associazioni positive.', 10, 'behavioral', ARRAY['Quando vedi il tuo animale avvicinarsi a oggetto proibito, di "NO" fermo', 'Immediatamente offri un giocattolo masticabile appropriato', 'Loda entusiasticamente quando accetta l''alternativa ("Bravo! Questo sì!")', 'Ripeti 5-8 volte durante la sessione con oggetti diversi', 'Non urlare o punire fisicamente - solo redirezione positiva', 'Termina sempre con successo: gioco con oggetto appropriato'], ARRAY['Giocattoli masticabili', 'Premi piccoli', 'Pazienza e consistenza'], false FROM protocol_data p

-- GIORNO 2
UNION ALL SELECT p.id, 2, 'Tecnica Sostituzione Proattiva', 'Anticipa i momenti di maggior rischio offrendo alternative prima che il comportamento inappropriato si manifesti.', 12, 'behavioral', ARRAY['Osserva i segnali pre-distruttivi (annusare, girare, irrequietezza)', 'Appena noti questi segnali, presenta immediatamente un Kong riempito', 'Accompagna con comando positivo: "Prendi questo!" con tono entusiasta', 'Resta vicino i primi 2-3 minuti per rinforzare la scelta corretta', 'Documenta orari e trigger che hanno preceduto l''intervento', 'Ripeti per almeno 6 episodi durante la giornata'], ARRAY['Kong preparati', 'Timer', 'Quaderno osservazioni', 'Premi vocali entusiasti'], false FROM protocol_data p

UNION ALL SELECT p.id, 2, 'Gioco Strutturato Anti-Noia', 'Sessione di gioco intensivo per scaricare energia fisica e mentale, riducendo la probabilità di comportamenti distruttivi.', 15, 'physical', ARRAY['Inizia con 5 minuti di gioco fisico attivo (tira e molla, palla)', 'Introduci puzzle feeder con cibo/premi per stimolazione mentale', 'Alterna tra attività fisica e mentale ogni 3-4 minuti', 'Termina quando l''animale mostra segni di stanchezza positiva', 'Lascia disponibile un giocattolo masticabile per il post-gioco', 'Osserva se dopo questa sessione diminuiscono comportamenti distruttivi'], ARRAY['Giocattolo tira e molla', 'Palla', 'Puzzle feeder', 'Premi/cibo', 'Acqua fresca'], false FROM protocol_data p

UNION ALL SELECT p.id, 2, 'Routine Pre-Uscita Preventiva', 'Stabilire una routine specifica prima di lasciare casa per prevenire ansia da separazione e comportamenti distruttivi.', 8, 'behavioral', ARRAY['30 minuti prima di uscire: gioco fisico intenso per stancare', '15 minuti prima: presenta Kong super-appetitoso (con cibo speciale)', '10 minuti prima: ignora l''animale per ridurre ansia da separazione', 'All''uscita: nessun saluto drammatico, esci normalmente', 'Lascia radio/TV accesa a volume basso per compagnia', 'Testa questa routine anche quando non devi uscire davvero'], ARRAY['Kong speciale', 'Cibo ad alto valore', 'Radio/TV', 'Timer'], false FROM protocol_data p;