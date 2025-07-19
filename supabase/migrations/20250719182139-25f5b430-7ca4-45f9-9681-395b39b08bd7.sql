-- Ricreo gli esercizi specifici per "Gestione Ansia da Separazione" (3 giorni)
WITH protocol_id AS (
  SELECT id FROM ai_training_protocols WHERE title = 'Gestione Ansia da Separazione'
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
  (1, 'Valutazione Comportamentale Iniziale', 'Osserva e documenta i segnali di ansia da separazione attuali del tuo pet', ARRAY['Siediti in un posto dove puoi osservare il tuo pet senza essere notato', 'Fai finta di prepararti per uscire: prendi le chiavi, indossa la giacca, prendi la borsa', 'Annota ogni comportamento ansioso: piangere, abbaiare, camminare nervosamente, distruggere oggetti', 'NON uscire ancora, solo osserva le reazioni ai preparativi', 'Ripeti l''osservazione 3 volte durante il giorno'], 20, ARRAY['Taccuino per appunti', 'Telefono per registrare video (opzionale)']),
  
  (1, 'Micro-Separazioni Iniziali', 'Prime brevissime separazioni per iniziare il condizionamento positivo', ARRAY['Preparati per uscire normalmente', 'Esci dalla porta per SOLO 10 secondi', 'Rientra senza fare drammi, ignorando comportamenti eccitati', 'Se il pet è rimasto calmo, dai un piccolo premio', 'Ripeti 5 volte con pause di 15 minuti tra una e l''altra', 'Se il pet si agita, riduci a 5 secondi'], 45, ARRAY['Cronometro', 'Piccoli snack premio', 'Chiavi di casa']),
  
  (2, 'Desensibilizzazione ai Segnali di Partenza', 'Rendere neutri gli oggetti e azioni che predicono la tua uscita', ARRAY['Prendi le chiavi e cammina per casa senza uscire (5 volte)', 'Indossa giacca/cappotto e toglilo subito (5 volte)', 'Avvicinati alla porta, toccala maniglia, allontanati (5 volte)', 'Prendi borsa/zaino e posalo subito (5 volte)', 'Combina 2-3 azioni insieme senza uscire (3 volte)', 'Premia la calma, ignora l''ansia'], 30, ARRAY['Chiavi', 'Giacca/cappotto', 'Borsa o zaino', 'Piccoli premi']),
  
  (2, 'Separazioni da 30 secondi', 'Aumentare gradualmente la durata delle separazioni', ARRAY['Completa la routine di preparazione normale', 'Esci per esattamente 30 secondi', 'Rientra in silenzio, senza salutare eccessivamente', 'Ignora comportamenti di eccitazione eccessiva', 'Se tutto ok, ripeti dopo 20 minuti', 'Fai 4 sessioni totali oggi'], 60, ARRAY['Cronometro', 'Chiavi', 'Calma e pazienza']),
  
  (3, 'Gioco Anti-Ansia', 'Creare associazioni positive con la tua uscita attraverso giochi mentali', ARRAY['Prepara un Kong ripieno di cibo appetitoso o un puzzle toy', 'Dai il gioco SOLO quando stai per uscire', 'Esci per 1-2 minuti mentre il pet è concentrato sul gioco', 'Quando rientri, ritira il gioco', 'Il gioco deve essere speciale, usato SOLO per questo esercizio', 'Ripeti 3 volte oggi con pause lunghe'], 40, ARRAY['Kong toy o puzzle feeder', 'Cibo molto appetitoso (paté, formaggio, etc.)', 'Cronometro']),
  
  (3, 'Test di Progresso Finale', 'Verifica dei miglioramenti ottenuti e preparazione per continuare il training', ARRAY['Osserva il comportamento durante i preparativi (dovrebbe essere migliorato)', 'Esci per 5 minuti completi', 'Rientra normalmente, annota la reazione del pet', 'Se tutto è andato bene, il pet è pronto per separazioni più lunghe', 'Se ci sono ancora problemi, ripeti il protocollo dall''inizio', 'Pianifica una progressione graduale verso 10-15 minuti'], 35, ARRAY['Taccuino per valutazione finale', 'Cronometro', 'Gioco anti-ansia'])
) AS exercises(day_number, title, description, instructions, duration_minutes, materials);