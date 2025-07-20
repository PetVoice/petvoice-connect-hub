-- Creo il protocollo "Stop Comportamenti Distruttivi"
INSERT INTO public.ai_training_protocols (
  title,
  description,
  category,
  difficulty,
  duration_days,
  target_behavior,
  triggers,
  required_materials,
  status,
  success_rate,
  ai_generated,
  is_public,
  veterinary_approved,
  community_rating,
  community_usage,
  mentor_recommended,
  notifications_enabled,
  estimated_cost
) VALUES (
  'Stop Comportamenti Distruttivi',
  'Protocollo intensivo per eliminare comportamenti distruttivi come masticazione inappropriata, scavo e distruzione di oggetti. Focus su redirezione positiva e autocontrollo.',
  'comportamento',
  'medio',
  8,
  'Eliminare masticazione distruttiva, scavo, distruzione oggetti domestici',
  ARRAY['noia', 'ansia da separazione', 'eccesso energia', 'dentizione', 'stress'],
  ARRAY['Kong riempibile', 'Puzzle feeder', 'Giocattoli masticabili', 'Spray deterrente naturale', 'Tappetino snuffle', 'Corda resistente', 'Osso di pelle'],
  'available',
  85,
  true,
  true,
  false,
  4.3,
  127,
  true,
  true,
  25.50
);

-- Recupero l'ID del protocollo appena creato
-- Userò una query per ottenere l'ultimo protocollo inserito con quel titolo
WITH protocol_id AS (
  SELECT id FROM ai_training_protocols 
  WHERE title = 'Stop Comportamenti Distruttivi' 
  ORDER BY created_at DESC 
  LIMIT 1
)

-- GIORNO 1: Identificazione Trigger e Prevenzione Base
INSERT INTO public.ai_training_exercises (
  protocol_id,
  day_number,
  title,
  description,
  duration_minutes,
  exercise_type,
  instructions,
  materials,
  completed,
  effectiveness_score
) 
SELECT 
  p.id,
  1,
  'Audit Casa e Identificazione Zone Rischio',
  'Mappatura completa degli oggetti a rischio e identificazione dei trigger ambientali che scatenano comportamenti distruttivi.',
  12,
  'behavioral',
  ARRAY[
    'Cammina per casa identificando tutti gli oggetti morsi/danneggiati',
    'Fotografa le zone più colpite per documentare il pattern',
    'Annota orari e situazioni quando avvengono i danni',
    'Rimuovi temporaneamente oggetti di valore dalle zone accessibili',
    'Identifica 3 fattori scatenanti principali (noia, ansia, energia)',
    'Crea una mappa visiva delle "zone proibite" vs "zone permesse"'
  ],
  ARRAY['Quaderno/app per annotazioni', 'Fotocamera smartphone', 'Nastro segna-pavimento'],
  false,
  0
FROM protocol_id p

UNION ALL

SELECT 
  p.id,
  1,
  'Setup Ambiente Anti-Distruttivo',
  'Preparazione strategica dell ambiente per ridurre opportunità di comportamenti inappropriati e creare alternative positive.',
  15,
  'behavioral',
  ARRAY[
    'Applica spray deterrente naturale su mobili e oggetti a rischio',
    'Posiziona giocattoli masticabili appropriati in ogni stanza',
    'Crea una "stazione masticazione" con 3-4 opzioni diverse',
    'Installa barriere fisiche dove necessario (baby gates)',
    'Prepara Kong riempiti con cibo e congelali per utilizzo futuro',
    'Verifica che non ci siano oggetti piccoli pericolosi a portata'
  ],
  ARRAY['Spray deterrente', '4-5 giocattoli masticabili diversi', 'Kong', 'Cibo umido/pasta', 'Baby gates se necessario'],
  false,
  0
FROM protocol_id p

UNION ALL

SELECT 
  p.id,
  1,
  'Primo Training "NO" e Redirezione',
  'Introduzione del comando "NO" seguito da immediata redirezione su oggetto appropriato per stabilire associazioni positive.',
  10,
  'behavioral',
  ARRAY[
    'Quando vedi il tuo animale avvicinarsi a oggetto proibito, di "NO" fermo',
    'Immediatamente offri un giocattolo masticabile appropriato',
    'Loda entusiasticamente quando accetta l alternativa ("Bravo! Questo sì!")',
    'Ripeti 5-8 volte durante la sessione con oggetti diversi',
    'Non urlare o punire fisicamente - solo redirezione positiva',
    'Termina sempre con successo: gioco con oggetto appropriato'
  ],
  ARRAY['Giocattoli masticabili', 'Premi piccoli', 'Pazienza e consistenza'],
  false,
  0
FROM protocol_id p;

-- GIORNO 1 CONTINUA - Altri esercizi del primo giorno
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
  completed,
  effectiveness_score
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
    'Documenta orari e trigger che hanno preceduto l\'intervento',
    'Ripeti per almeno 6 episodi durante la giornata'
  ],
  ARRAY['Kong preparati', 'Timer', 'Quaderno osservazioni', 'Premi vocali entusiasti'],
  false,
  0
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
    'Termina quando l\'animale mostra segni di stanchezza positiva',
    'Lascia disponibile un giocattolo masticabile per il post-gioco',
    'Osserva se dopo questa sessione diminuiscono comportamenti distruttivi'
  ],
  ARRAY['Giocattolo tira e molla', 'Palla', 'Puzzle feeder', 'Premi/cibo', 'Acqua fresca'],
  false,
  0
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
    '10 minuti prima: ignora l\'animale per ridurre ansia da separazione',
    'All\'uscita: nessun saluto drammatico, esci normalmente',
    'Lascia radio/TV accesa a volume basso per compagnia',
    'Testa questa routine anche quando non devi uscire davvero'
  ],
  ARRAY['Kong speciale', 'Cibo ad alto valore', 'Radio/TV', 'Timer'],
  false,
  0
FROM protocol_id p;

-- GIORNO 3: Redirezione su Oggetti Appropriati
WITH protocol_id AS (
  SELECT id FROM ai_training_protocols 
  WHERE title = 'Stop Comportamenti Distruttivi' 
  ORDER BY created_at DESC 
  LIMIT 1
)

INSERT INTO public.ai_training_exercises (
  protocol_id,
  day_number,
  title,
  description,
  duration_minutes,
  exercise_type,
  instructions,
  materials,
  completed,
  effectiveness_score
) 
SELECT 
  p.id,
  3,
  'Training Comando "PRENDI QUESTO"',
  'Insegnare comando specifico per dirigere l\'attenzione verso oggetti appropriati, creando associazione positiva con la redirezione.',
  14,
  'behavioral',
  ARRAY[
    'Tieni in mano giocattolo masticabile e di "Prendi questo!" con tono allegro',
    'Quando l\'animale si avvicina o tocca il giocattolo, premia immediatamente',
    'Ripeti 10 volte alternando giocattoli diversi',
    'Pratica in stanze diverse per generalizzare il comando',
    'Aumenta gradualmente la distanza tra te e l\'oggetto',
    'Termina sempre con 2-3 minuti di gioco libero con l\'oggetto scelto'
  ],
  ARRAY['3-4 giocattoli masticabili diversi', 'Premi piccoli e appetitosi', 'Entusiasmo e pazienza'],
  false,
  0
FROM protocol_id p

UNION ALL

SELECT 
  p.id,
  3,
  'Sfida Scelta Multipla',
  'Presentare più opzioni appropriate simultaneamente per rinforzare la capacità di scegliere correttamente e ignorare oggetti inappropriati.',
  12,
  'mental',
  ARRAY[
    'Disponi 3 oggetti: 2 appropriati (giocattoli) e 1 inappropriato (scarpa)',
    'Posizionati vicino agli oggetti appropriati',
    'Invita l\'animale: "Scegli quello giusto!"',
    'Se sceglie correttamente: premio e lode immediate',
    'Se sceglie inappropriato: "No" calmo + redirezione senza punizione',
    'Ripeti variando posizioni oggetti, 8-10 tentativi per sessione'
  ],
  ARRAY['2 giocattoli appetibili', '1 oggetto "proibito" sacrificabile', 'Premi di alto valore'],
  false,
  0
FROM protocol_id p

UNION ALL

SELECT 
  p.id,
  3,
  'Introduzione Tappetino Snuffle',
  'Presentare attività di ricerca cibo per stimolazione mentale e redirezione naturale dell\'istinto esplorativo.',
  10,
  'mental',
  ARRAY[
    'Nascondi piccoli premi nel tappetino snuffle',
    'Presenta il tappetino dicendo "Cerca!" con entusiasmo',
    'Lascia che l\'animale esplori e trovi i premi autonomamente',
    'Non aiutare - l\'obiettivo è sviluppare concentrazione',
    'Quando termina, togli il tappetino per mantenerlo speciale',
    'Osserva se dopo questa attività è più calmo e meno interessato a distruggere'
  ],
  ARRAY['Tappetino snuffle', 'Premi piccoli e profumati', 'Pazienza per lasciarlo lavorare'],
  false,
  0
FROM protocol_id p;

-- GIORNO 4: Consolidamento Redirezione
WITH protocol_id AS (
  SELECT id FROM ai_training_protocols 
  WHERE title = 'Stop Comportamenti Distruttivi' 
  ORDER BY created_at DESC 
  LIMIT 1
)

INSERT INTO public.ai_training_exercises (
  protocol_id,
  day_number,
  title,
  description,
  duration_minutes,
  exercise_type,
  instructions,
  materials,
  completed,
  effectiveness_score
) 
SELECT 
  p.id,
  4,
  'Test Resistenza alla Tentazione',
  'Valutare i progressi mettendo l\'animale di fronte a tentazioni controllate per misurare l\'efficacia della redirezione.',
  15,
  'behavioral',
  ARRAY[
    'Posiziona oggetto molto appetibile ma inappropriato (scarpa usata)',
    'Metti giocattolo appropriato a distanza simile',
    'Libera l\'animale e osserva la prima scelta senza intervenire',
    'Se va verso oggetto sbagliato: "No" + redirezione immediata',
    'Se sceglie correttamente: festa enorme e premio speciale',
    'Ripeti test 5 volte aumentando difficoltà (oggetti più appetibili)'
  ],
  ARRAY['Oggetti "proibiti" sacrificabili', 'Giocattoli irresistibili', 'Premi di altissimo valore', 'Cronometro'],
  false,
  0
FROM protocol_id p

UNION ALL

SELECT 
  p.id,
  4,
  'Gioco Interattivo Prolungato',
  'Sessione estesa di gioco con giocattoli appropriati per rinforzare l\'associazione positiva e soddisfare bisogni di masticazione.',
  12,
  'physical',
  ARRAY[
    'Scegli il giocattolo che ha mostrato preferire nei giorni precedenti',
    'Inizia giocando insieme per 5 minuti (tira e molla, lancia e riporta)',
    'Gradualmente riduci la tua partecipazione, lasciandolo giocare solo',
    'Rimani presente ma non interattivo per altri 7 minuti',
    'Premia verbalmente quando si concentra bene sul giocattolo',
    'Nota durata attenzione e preferenze per personalizzare futuro training'
  ],
  ARRAY['Giocattolo preferito', 'Cronometro', 'Premi verbali entusiasti'],
  false,
  0
FROM protocol_id p

UNION ALL

SELECT 
  p.id,
  4,
  'Creazione Angolo Masticazione Personale',
  'Stabilire una zona specifica dedicata alla masticazione dove l\'animale può liberamente scegliere tra opzioni appropriate.',
  8,
  'behavioral',
  ARRAY[
    'Scegli angolo tranquillo della casa come "zona masticazione"',
    'Disponi 4-5 giocattoli masticabili diversi (texture, durezza, sapori)',
    'Aggiungi tappetino comodo e ciotola acqua',
    'Porta l\'animale alla zona e presenta: "Questo è il tuo angolo speciale"',
    'Resta vicino 5 minuti rinforzando qualsiasi interesse per la zona',
    'Durante il giorno, reindirizza sempre verso questo angolo quando cerca cosa masticare'
  ],
  ARRAY['Tappetino confortevole', '4-5 giocattoli masticabili vari', 'Ciotola acqua piccola'],
  false,
  0
FROM protocol_id p;

-- GIORNO 5: Training Autocontrollo e "Leave It"
WITH protocol_id AS (
  SELECT id FROM ai_training_protocols 
  WHERE title = 'Stop Comportamenti Distruttivi' 
  ORDER BY created_at DESC 
  LIMIT 1
)

INSERT INTO public.ai_training_exercises (
  protocol_id,
  day_number,
  title,
  description,
  duration_minutes,
  exercise_type,
  instructions,
  materials,
  completed,
  effectiveness_score
) 
SELECT 
  p.id,
  5,
  'Comando "LASCIA" Base',
  'Insegnare il comando fondamentale "Lascia" per sviluppare autocontrollo e capacità di resistere alle tentazioni inappropriate.',
  15,
  'behavioral',
  ARRAY[
    'Tieni premio chiuso nel pugno, avvicinalo al muso dell\'animale',
    'Quando annusa/lecca il pugno, di "Lascia" con voce calma e ferma',
    'Aspetta che si allontani anche solo di un centimetro dal pugno',
    'Nel momento che si allontana: "Bravo!" e premio dall\'altra mano',
    'Ripeti 10-15 volte per sessione, aumentando tempo di attesa',
    'Non aprire mai il pugno durante l\'esercizio - solo premio dalla mano libera'
  ],
  ARRAY['Premi piccoli appetitosi', 'Pazienza e consistenza', 'Voce calma'],
  false,
  0
FROM protocol_id p

UNION ALL

SELECT 
  p.id,
  5,
  'Impulse Control con Cibo',
  'Esercizio avanzato di controllo impulsi usando il cibo per rafforzare la capacità di aspettare e obbedire ai comandi.',
  12,
  'behavioral',
  ARRAY[
    'Prepara ciotola con cibo appetitoso, tienila in alto',
    'Avvicinala lentamente verso il pavimento dicendo "Aspetta"',
    'Se l\'animale si muove verso la ciotola, risollevala immediatamente',
    'Solo quando rimane fermo, posa la ciotola e di "Okay, mangia!"',
    'Inizia con 2-3 secondi di attesa, aumenta gradualmente',
    'Ripeti 5-6 volte per sessione, celebrando ogni successo'
  ],
  ARRAY['Ciotola', 'Cibo o premi appetitosi', 'Timer', 'Autocontrollo personale'],
  false,
  0
FROM protocol_id p

UNION ALL

SELECT 
  p.id,
  5,
  'Test "Lascia" con Oggetti Casa',
  'Applicazione pratica del comando "Lascia" con oggetti reali della casa per generalizzare l\'apprendimento.',
  10,
  'behavioral',
  ARRAY[
    'Posiziona oggetto domestico attraente (calzino, telecomando) sul pavimento',
    'Cammina con l\'animale al guinzaglio verso l\'oggetto',
    'A 1 metro di distanza di "Lascia" prima che mostri interesse',
    'Se obbedisce: premio immediato e allontanamento dall\'oggetto',
    'Se non obbedisce: tira delicatamente il guinzaglio e ripeti "Lascia"',
    'Testa con 3-4 oggetti diversi, aumentando il livello di tentazione'
  ],
  ARRAY['Guinzaglio', 'Oggetti domestici vari', 'Premi di alto valore', 'Pazienza'],
  false,
  0
FROM protocol_id p;

-- GIORNO 6: Consolidamento Autocontrollo
WITH protocol_id AS (
  SELECT id FROM ai_training_protocols 
  WHERE title = 'Stop Comportamenti Distruttivi' 
  ORDER BY created_at DESC 
  LIMIT 1
)

INSERT INTO public.ai_training_exercises (
  protocol_id,
  day_number,
  title,
  description,
  duration_minutes,
  exercise_type,
  instructions,
  materials,
  completed,
  effectiveness_score
) 
SELECT 
  p.id,
  6,
  'Sfida Autocontrollo Multipla',
  'Test complesso con multiple tentazioni per valutare il livello di autocontrollo raggiunto e identificare aree da rinforzare.',
  14,
  'behavioral',
  ARRAY[
    'Disponi in fila 5 oggetti: 3 inappropriati (scarpe, cuscino, libro) e 2 appropriati (giocattoli)',
    'Cammina con l\'animale lungo la fila, fermandoti davanti a ogni oggetto',
    'Per oggetti inappropriati: comando "Lascia" preventivo',
    'Per oggetti appropriati: "Prendi questo!" incoraggiante',
    'Premia ogni risposta corretta con entusiasmo crescente',
    'Ripeti percorso 3 volte cambiando ordine degli oggetti'
  ],
  ARRAY['3 oggetti "proibiti"', '2 giocattoli appetibili', 'Guinzaglio', 'Premi vari', 'Spazio per disporre oggetti'],
  false,
  0
FROM protocol_id p

UNION ALL

SELECT 
  p.id,
  6,
  'Mental Stimulation Intensiva',
  'Sessione prolungata di stimolazione mentale per soddisfare bisogni cognitivi e ridurre noia che porta a distruzione.',
  15,
  'mental',
  ARRAY[
    'Combina 3 attività mentali: puzzle feeder + tappetino snuffle + Kong riempito',
    'Presenta le attività in sequenza, 5 minuti ciascuna',
    'Non aiutare - lascia che risolva problemi autonomamente',
    'Osserva quali attività preferisce e quanto si concentra',
    'Premia verbalmente quando mostra persistenza e concentrazione',
    'Termina lasciando disponibile l\'attività che ha gradito di più'
  ],
  ARRAY['Puzzle feeder', 'Tappetino snuffle', 'Kong riempito', 'Timer', 'Premi per riempimenti'],
  false,
  0
FROM protocol_id p

UNION ALL

SELECT 
  p.id,
  6,
  'Simulazione Assenza Proprietario',
  'Test realistico del comportamento durante assenza simulata per valutare efficacia delle strategie anti-distruttive.',
  12,
  'behavioral',
  ARRAY[
    'Prepara ambiente come per uscita reale: Kong riempito, giocattoli disponibili',
    'Esci dalla stanza per 2 minuti, poi torna senza fare drammi',
    'Osserva segni di ansia o tentativi distruttivi',
    'Se tutto va bene, aumenta a 5 minuti, poi 10 minuti',
    'Documenta comportamenti osservati e oggetti scelti',
    'Premia calma e scelte appropriate al tuo rientro'
  ],
  ARRAY['Kong preparato', 'Giocattoli vari', 'Timer', 'Telecamera o ascolto attento', 'Quaderno osservazioni'],
  false,
  0
FROM protocol_id p;

-- GIORNO 7: Consolidamento e Prevenzione Ricadute
WITH protocol_id AS (
  SELECT id FROM ai_training_protocols 
  WHERE title = 'Stop Comportamenti Distruttivi' 
  ORDER BY created_at DESC 
  LIMIT 1
)

INSERT INTO public.ai_training_exercises (
  protocol_id,
  day_number,
  title,
  description,
  duration_minutes,
  exercise_type,
  instructions,
  materials,
  completed,
  effectiveness_score
) 
SELECT 
  p.id,
  7,
  'Routine Giornaliera Anti-Distruttiva',
  'Stabilire routine quotidiana strutturata che incorpora tutte le strategie apprese per prevenire ricadute comportamentali.',
  15,
  'behavioral',
  ARRAY[
    'Mattino: 10 minuti gioco fisico + comando "Prendi questo" con Kong',
    'Pomeriggio: 15 minuti mental stimulation (puzzle feeder o snuffle)',
    'Sera: 5 minuti training "Lascia" + sessione angolo masticazione',
    'Prima uscite: routine pre-partenza con Kong speciale',
    'Documenta orari e risposte per creare programma personalizzato',
    'Identifica 3 momenti chiave dove implementare redirezione preventiva'
  ],
  ARRAY['Kong vari', 'Puzzle feeder', 'Tappetino snuffle', 'Timer', 'Quaderno routine'],
  false,
  0
FROM protocol_id p

UNION ALL

SELECT 
  p.id,
  7,
  'Test Stress Controllato',
  'Simulare situazioni stressanti che tipicamente scatenano comportamenti distruttivi per testare resilienza e strategie di coping.',
  12,
  'behavioral',
  ARRAY[
    'Simula situazioni trigger identificate nel Giorno 1 (rumori, preparativi uscita)',
    'Offri immediatamente alternative appropriate quando noti primi segni stress',
    'Usa comandi "Lascia" e "Prendi questo" preventivamente',
    'Mantieni calma e coerenza nella tua risposta',
    'Documenta quali situazioni causano ancora difficoltà',
    'Premia ogni momento di autocontrollo durante stress'
  ],
  ARRAY['Oggetti per simulare trigger', 'Giocattoli di emergenza', 'Premi di alto valore', 'Calma personale'],
  false,
  0
FROM protocol_id p

UNION ALL

SELECT 
  p.id,
  7,
  'Valutazione Progressi Settimanali',
  'Assessment completo dei miglioramenti ottenuti e identificazione di aree che necessitano rinforzo continuo.',
  10,
  'behavioral',
  ARRAY[
    'Revisiona foto del Giorno 1 e confronta con situazione attuale',
    'Testa tutti i comandi appresi: "Lascia", "Prendi questo", "Aspetta"',
    'Valuta autonomia nella scelta di oggetti appropriati (scala 1-10)',
    'Identifica 2-3 aree dove servono ancora miglioramenti',
    'Celebra progressi ottenuti con sessione di gioco extra',
    'Pianifica strategie di mantenimento per prossima settimana'
  ],
  ARRAY['Foto/note Giorno 1', 'Tutti i materiali usati', 'Scala valutazione', 'Premi celebrativi'],
  false,
  0
FROM protocol_id p;

-- GIORNO 8: Prevenzione Ricadute e Piano Futuro
WITH protocol_id AS (
  SELECT id FROM ai_training_protocols 
  WHERE title = 'Stop Comportamenti Distruttivi' 
  ORDER BY created_at DESC 
  LIMIT 1
)

INSERT INTO public.ai_training_exercises (
  protocol_id,
  day_number,
  title,
  description,
  duration_minutes,
  exercise_type,
  instructions,
  materials,
  completed,
  effectiveness_score
) 
SELECT 
  p.id,
  8,
  'Piano Mantenimento Personalizzato',
  'Creare strategia di mantenimento a lungo termine basata sui progressi individuali e le preferenze specifiche osservate.',
  12,
  'behavioral',
  ARRAY[
    'Identifica i 3 interventi più efficaci per il tuo animale',
    'Stabilisci frequenza minima per mantenere risultati (es. Kong giornaliero)',
    'Crea calendario settimanale con attività anti-distruttive distribuite',
    'Prepara "kit emergenza" con oggetti preferiti per momenti difficili',
    'Scrivi promemoria comportamenti da rinforzare quotidianamente',
    'Pianifica controlli mensili per monitorare mantenimento progressi'
  ],
  ARRAY['Quaderno/app pianificazione', 'Calendario', 'Kit oggetti preferiti', 'Promemoria'],
  false,
  0
FROM protocol_id p

UNION ALL

SELECT 
  p.id,
  8,
  'Test Finale Autonomia',
  'Valutazione conclusiva dell\'autonomia dell\'animale nelle scelte appropriate senza supporto umano diretto.',
  15,
  'behavioral',
  ARRAY[
    'Prepara ambiente con mix oggetti appropriati e inappropriati',
    'Osserva comportamento per 10 minuti senza interventi',
    'Documenta: tempo per scegliere, tipo oggetti scelti, persistenza',
    'Solo se necessario, usa comandi appresi per correggere',
    'Valuta miglioramento rispetto al Giorno 1 (scala 1-100)',
    'Termina con celebrazione dei progressi ottenuti'
  ],
  ARRAY['Mix oggetti vari', 'Timer', 'Quaderno valutazione', 'Telecamera se disponibile', 'Premi celebrativi'],
  false,
  0
FROM protocol_id p

UNION ALL

SELECT 
  p.id,
  8,
  'Sessione Rinforzo Positivo Finale',
  'Conclusione celebrativa che rinforza tutti i comportamenti positivi appresi e stabilisce associazioni positive durature.',
  10,
  'social',
  ARRAY[
    'Dedica tempo qualità esclusivo giocando con tutti i giocattoli appropriati',
    'Pratica tutti i comandi appresi in atmosfera rilassata e divertente',
    'Premia generosamente ogni risposta corretta, anche imperfetta',
    'Scatta foto/video per documentare i progressi',
    'Termina con attività che l\'animale preferisce di più',
    'Pianifica "laurea" simbolica con premio speciale o gita'
  ],
  ARRAY['Tutti i giocattoli usati', 'Premi speciali', 'Fotocamera', 'Atmosfera festiva', 'Premio graduazione'],
  false,
  0
FROM protocol_id p;