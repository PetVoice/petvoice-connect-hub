-- Completa l'aggiornamento di TUTTI gli altri esercizi del protocollo "Chiarezza Mentale"

-- Sequenze Logiche Semplici
UPDATE ai_training_exercises 
SET 
  objectives = ARRAY[
    'Sviluppare pensiero sequenziale',
    'Migliorare capacità di pianificazione',
    'Aumentare comprensione causa-effetto',
    'Rafforzare logica comportamentale'
  ],
  success_criteria = ARRAY[
    'Completa sequenze di 2-3 passi senza aiuto',
    'Mostra comprensione della logica sequenziale',
    'Anticipa il passo successivo della sequenza',
    'Mantiene concentrazione per tutta la sequenza'
  ],
  tips = ARRAY[
    'Mantieni le sequenze molto semplici all inizio',
    'Usa sempre gli stessi oggetti per ogni passo',
    'Aiuta fisicamente solo se assolutamente necessario',
    'Ripeti la stessa sequenza molte volte prima di cambiarla'
  ],
  level = 'avanzato',
  description = 'Insegna al pet a seguire sequenze logiche semplici per migliorare le capacità cognitive e di ragionamento. Questo è cruciale per ridurre confusione mentale.'
WHERE title = 'Sequenze Logiche Semplici' 
  AND protocol_id IN (
    SELECT id FROM ai_training_protocols WHERE title = 'Chiarezza Mentale'
  );

-- Comunicazione Semplificata
UPDATE ai_training_exercises 
SET 
  objectives = ARRAY[
    'Migliorare comprensione comunicativa',
    'Ridurre malintesi',
    'Stabilire comunicazione chiara',
    'Aumentare fiducia nelle interazioni'
  ],
  success_criteria = ARRAY[
    'Risponde correttamente a comandi singoli',
    'Mostra comprensione attraverso linguaggio del corpo',
    'Reagisce prontamente ai segnali',
    'Mantiene attenzione durante la comunicazione'
  ],
  tips = ARRAY[
    'Usa sempre la stessa parola per lo stesso comando',
    'Accompagna ogni comando con lo stesso gesto',
    'Mantieni tono di voce costante e calmo',
    'Aspetta sempre che completi prima di dare il prossimo comando'
  ],
  level = 'facile',
  description = 'Stabilisce una comunicazione chiara e diretta per ridurre confusione e migliorare la relazione pet-proprietario attraverso segnali semplici e costanti.'
WHERE title = 'Comunicazione Semplificata' 
  AND protocol_id IN (
    SELECT id FROM ai_training_protocols WHERE title = 'Chiarezza Mentale'
  );

-- Navigazione Assistita
UPDATE ai_training_exercises 
SET 
  objectives = ARRAY[
    'Migliorare orientamento spaziale',
    'Aumentare sicurezza nei movimenti',
    'Ridurre disorientamento',
    'Sviluppare mappe mentali'
  ],
  success_criteria = ARRAY[
    'Si muove con più sicurezza negli spazi familiari',
    'Accetta la guida senza resistenza',
    'Mostra miglioramento nell orientamento',
    'Riduce comportamenti di esitazione'
  ],
  tips = ARRAY[
    'Inizia sempre dalla stessa stanza familiare',
    'Muoviti lentamente e con movimenti prevedibili',
    'Offri supporto fisico gentile quando necessario',
    'Celebra ogni movimento corretto verso la destinazione'
  ],
  level = 'facile',
  description = 'Aiuta il pet a navigare negli spazi con supporto e guida per sviluppare sicurezza e orientamento spaziale, riducendo confusione e ansia.'
WHERE title = 'Navigazione Assistita' 
  AND protocol_id IN (
    SELECT id FROM ai_training_protocols WHERE title = 'Chiarezza Mentale'
  );

-- Rafforzamento Identità
UPDATE ai_training_exercises 
SET 
  objectives = ARRAY[
    'Rafforzare senso di identità',
    'Migliorare autoriconoscimento',
    'Aumentare fiducia in sé stesso',
    'Stabilire legame con il proprietario'
  ],
  success_criteria = ARRAY[
    'Risponde prontamente al proprio nome',
    'Mostra riconoscimento di sé nel contesto',
    'Reagisce positivamente alle interazioni personali',
    'Dimostra maggiore sicurezza nelle relazioni'
  ],
  tips = ARRAY[
    'Ripeti il nome frequentemente durante le attività positive',
    'Associa sempre il nome a esperienze piacevoli',
    'Usa il nome prima di ogni comando o interazione',
    'Crea routine specifiche che rinforzano il legame'
  ],
  level = 'intermedio',
  description = 'Rafforza il senso di identità e appartenenza del pet attraverso l uso costante del nome e associazioni positive per ridurre confusione identitaria.'
WHERE title = 'Rafforzamento Identità' 
  AND protocol_id IN (
    SELECT id FROM ai_training_protocols WHERE title = 'Chiarezza Mentale'
  );

-- Problem Solving Guidato
UPDATE ai_training_exercises 
SET 
  objectives = ARRAY[
    'Sviluppare capacità di risoluzione problemi',
    'Migliorare pensiero critico',
    'Aumentare perseveranza',
    'Rafforzare fiducia nelle proprie capacità'
  ],
  success_criteria = ARRAY[
    'Affronta problemi semplici senza agitarsi',
    'Persevera nella ricerca di soluzioni',
    'Accetta la guida quando necessaria',
    'Mostra soddisfazione nel risolvere problemi'
  ],
  tips = ARRAY[
    'Presenta un solo problema molto semplice per volta',
    'Resta sempre vicino per offrire supporto',
    'Suddividi problemi complessi in passi molto piccoli',
    'Celebra ogni piccolo progresso verso la soluzione'
  ],
  level = 'avanzato',
  description = 'Introduce gradualmente situazioni problematiche semplici con supporto costante per sviluppare capacità cognitive e ridurre frustrazione da confusione.'
WHERE title = 'Problem Solving Guidato' 
  AND protocol_id IN (
    SELECT id FROM ai_training_protocols WHERE title = 'Chiarezza Mentale'
  );

-- Pianificazione Mantenimento  
UPDATE ai_training_exercises 
SET 
  objectives = ARRAY[
    'Consolidare progressi ottenuti',
    'Prevenire regressioni',
    'Stabilire routine di mantenimento',
    'Monitorare benessere a lungo termine'
  ],
  success_criteria = ARRAY[
    'Mantiene la chiarezza mentale acquisita',
    'Mostra stabilità comportamentale',
    'Reagisce bene alla routine di mantenimento',
    'Non presenta segni di regressione'
  ],
  tips = ARRAY[
    'Continua gli esercizi base quotidianamente',
    'Monitora attentamente eventuali cambiamenti',
    'Mantieni le routine stabilite durante il protocollo',
    'Intervieni rapidamente se noti confusione'
  ],
  level = 'intermedio',
  description = 'Stabilisce un piano di mantenimento a lungo termine per preservare la chiarezza mentale raggiunta e prevenire ricadute nella confusione.'
WHERE title = 'Pianificazione Mantenimento' 
  AND protocol_id IN (
    SELECT id FROM ai_training_protocols WHERE title = 'Chiarezza Mentale'
  );