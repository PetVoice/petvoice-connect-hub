-- Aggiorna tutti gli esercizi del protocollo "Superare la Tristezza" con istruzioni dettagliate

-- Attivazione Fisica Dolce
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. PASSEGGIATA TERAPEUTICA: INIZIA con camminate brevi ma regolari per riattivare circolazione e interesse',
  '2. RITMO PERSONALE: RISPETTA velocità naturale del pet senza forzare accelerazioni premature',
  '3. MOTIVAZIONE GRADUALE: USA snack o giocattolo per incoraggiare movimento senza stress',
  '4. AMBIENTE POSITIVO: SCEGLI percorsi familiari e sicuri che non causano ansia aggiuntiva',
  '5. CELEBRAZIONE MOVIMENTO: PREMIA ogni passo, ogni movimento spontaneo con entusiasmo genuino',
  '6. DURATA FLESSIBILE: ADATTA lunghezza attività in base a energia mostrata dal pet',
  '7. CONSISTENCY DOLCE: MANTIENI routine quotidiana leggera senza diventare rigidi o stressanti',
  '8. OSSERVAZIONE PROGRESSO: NOTA piccoli miglioramenti nella voglia di muoversi e partecipare'
],
updated_at = NOW()
WHERE title = 'Attivazione Fisica Dolce' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Superare la Tristezza'
);

-- Gioco Motivazionale Leggero
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. RISVEGLIO INTERESSE: USA giocattoli che hanno dato gioia in passato per riaccendere curiosità',
  '2. APPROCCIO GENTILE: PRESENTA gioco con movimenti lenti e non invasivi per non sopraffare',
  '3. PARTECIPAZIONE LIBERA: LASCIA che pet scelga se e come partecipare senza forzature',
  '4. SUCCESSO GARANTITO: CREA situazioni dove pet può vincere facilmente per costruire fiducia',
  '5. VARIAZIONE STIMOLI: ALTERNA diversi tipi di gioco per trovare cosa riaccende interesse',
  '6. TEMPO PAZIENTE: CONCEDI tutto il tempo necessario per elaborare ed entrare nel gioco',
  '7. RINFORZO POSITIVO: CELEBRA ogni piccolo segno di interesse o partecipazione attiva',
  '8. ENERGIA CONTAGIOSA: DIMOSTRA entusiasmo autentico che può essere contagioso per il pet'
],
updated_at = NOW()
WHERE title = 'Gioco Motivazionale Leggero' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Superare la Tristezza'
);

-- Stimolazione Sensoriale Positiva
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. ODORI INTRIGANTI: OFFRI profumi naturali piacevoli che stimolano curiosità e interesse',
  '2. TEXTURE PIACEVOLI: FORNISCI superfici diverse da toccare che danno sensazioni positive',
  '3. SUONI RILASSANTI: INTRODUCE musica o suoni naturali che hanno effetto calmante ma energizzante',
  '4. SAPORI SPECIALI: USA snack particolarmente appetitosi per risvegliare interesse per il cibo',
  '5. STIMOLAZIONE VISIVA: MOSTRA oggetti colorati o movimenti dolci che catturano attenzione',
  '6. INTEGRAZIONE SENSORIALE: COMBINA più sensi contemporaneamente per esperienza ricca',
  '7. RISPETTO SENSIBILITÀ: ADATTA intensità stimoli alla tolleranza attuale del pet',
  '8. ASSOCIAZIONE GIOIA: ABBINA stimoli sensoriali a esperienze positive e piacevoli'
],
updated_at = NOW()
WHERE title = 'Stimolazione Sensoriale Positiva' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Superare la Tristezza'
);

-- Routine di Comfort
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. CONTATTO FISICO DOLCE: OFFRI coccole e carezze se pet le gradisce e cerca',
  '2. SPAZZOLAMENTO RILASSANTE: USA spazzola morbida per creare momento di relax e cura',
  '3. MASSAGGIO TERAPEUTICO: APPLICA tocco gentile su zone che pet trova rilassanti',
  '4. SICUREZZA EMOTIVA: CREA atmosfera di protezione dove pet si sente completamente al sicuro',
  '5. TEMPO QUALITÀ: DEDICA momenti esclusivi di attenzione solo al pet senza distrazioni',
  '6. VOCE CALMANTE: USA tono dolce e rassicurante per comunicare amore e supporto',
  '7. PRESENZA COSTANTE: RIMANI fisicamente vicino quando pet mostra bisogno di vicinanza',
  '8. PREVEDIBILITÀ RASSICURANTE: STABILISCI routine comfort che pet può anticipare e desiderare'
],
updated_at = NOW()
WHERE title = 'Routine di Comfort' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Superare la Tristezza'
);

-- Attività Creative e Mentali  
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. PUZZLE ALIMENTARI: CREA sfide mentali semplici usando cibo per stimolare problema solving',
  '2. GIOCHI NASCONDINO: NASCONDI snack in luoghi facili da trovare per incoraggiare ricerca attiva',
  '3. PROBLEM SOLVING DOLCE: PRESENTA enigmi molto semplici che pet può risolvere con successo',
  '4. CREATIVITÀ PREMIATA: CELEBRA ogni tentativo creativo anche se non perfettamente riuscito',
  '5. VARIETÀ MENTALE: CAMBIA tipo di sfida per mantenere interesse e stimolare diverse capacità',
  '6. SUCCESSO COSTRUTTIVO: MANTIENI livello difficoltà che garantisce successi frequenti',
  '7. TEMPO ELABORAZIONE: CONCEDI tempo per pensare senza pressioni di velocità',
  '8. RINFORZO INTELLIGENZA: RICONOSCI e premia manifestazioni di intelligenza e creatività'
],
updated_at = NOW()
WHERE title = 'Attività Creative e Mentali' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Superare la Tristezza'
);

-- Socializzazione Gentile
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. COMPAGNIA AMATA: INVITA persone o animali che pet ha sempre amato e apprezzato',
  '2. AMBIENTE FAMILIARE: ORGANIZZA incontri in spazi dove pet si sente completamente a suo agio',
  '3. INTERAZIONI BREVI: MANTIENI visite corte per evitare sovraccarico emotivo o stanchezza',
  '4. RISPETTO TEMPI: LASCIA pet decidere quando e come interagire senza forzare contatto',
  '5. ENERGIA POSITIVA: ASSICURA che visitatori portino energia calma e comprensiva',
  '6. CONTROLLO SOCIALE: MONITORA reazioni pet per intervenire se diventa troppo intenso',
  '7. RINFORZO APERTURA: PREMIA ogni piccolo segno di interesse sociale o comunicazione',
  '8. GRADUALITÀ ESPANSIVA: AUMENTA lentamente cerchia sociale solo dopo successi consolidati'
],
updated_at = NOW()
WHERE title = 'Socializzazione Gentile' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Superare la Tristezza'
);

-- Training Positivo Motivante
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. TRICK SEMPLICISSIMI: INSEGNA comandi molto basilari che pet può imparare facilmente',
  '2. SOLO RINFORZO POSITIVO: USA esclusivamente premi e incoraggiamenti, mai correzioni',
  '3. SESSIONI MICRO: MANTIENI allenamenti brevissimi per evitare affaticamento mentale',
  '4. SUCCESSO IMMEDIATO: STRUTTURA esercizi dove pet ha successo nel 90% dei tentativi',
  '5. CELEBRAZIONE ESAGERATA: FESTEGGIA ogni piccolo progresso con entusiasmo genuino',
  '6. RITMO PERSONALIZZATO: ADATTA velocità apprendimento alle capacità attuali del pet',
  '7. FIDUCIA COSTRUTTIVA: USA training per rebuilddare autostima e senso di competenza',
  '8. DIVERTIMENTO PRIORITARIO: MANTIENI atmosfera giocosa dove apprendimento è gioia pura'
],
updated_at = NOW()
WHERE title = 'Training Positivo Motivante' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Superare la Tristezza'
);

-- Esplorazione Guidata
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. LUOGHI NUOVI DOLCI: PORTA pet in posti interessanti ma non sovreccitanti o stressanti',
  '2. RITMO ESPLORATIVO: LASCIA pet esplorare alla sua velocità senza fretta o pressioni',
  '3. CURIOSITÀ NATURALE: INCORAGGIA interesse spontaneo verso elementi nuovi dell ambiente',
  '4. SICUREZZA COSTANTE: MANTIENI pet sempre al sicuro durante esplorazioni guidate',
  '5. DOCUMENTAZIONE GIOIA: NOTA e registra momenti dove pet mostra vera curiosità',
  '6. VARIETÀ GRADUALE: INTRODUCE lentamente ambienti sempre più stimolanti e interessanti',
  '7. SUPPORTO DISCRETO: RIMANI vicino per supporto senza interferire con esplorazione autonoma',
  '8. ASSOCIAZIONE POSITIVA: ABBINA nuove scoperte a esperienze piacevoli e ricompense'
],
updated_at = NOW()
WHERE title = 'Esplorazione Guidata' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Superare la Tristezza'
);

-- Attività di Gruppo Familiare
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. INCLUSIONE TOTALE: COINVOLGI pet in attività dove tutti partecipano insieme',
  '2. GIOCHI COOPERATIVI: ORGANIZZA attività dove successo dipende da collaborazione di gruppo',
  '3. MOMENTI CONDIVISI: CREA occasioni speciali dove pet è parte centrale della famiglia',
  '4. CONNESSIONE EMOTIVA: FOCUS su rafforzare legami e senso di appartenenza',
  '5. RUOLO IMPORTANTE: ASSEGNA al pet ruolo significativo nelle attività familiari',
  '6. CELEBRAZIONE COLLETTIVA: FESTEGGIA insieme successi e momenti positivi del pet',
  '7. TRADIZIONI NUOVE: STABILISCI rituali familiari che includono sempre il pet',
  '8. AMORE CONDIVISO: DIMOSTRA quanto pet è amato e apprezzato da tutta la famiglia'
],
updated_at = NOW()
WHERE title = 'Attività di Gruppo Familiare' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Superare la Tristezza'
);

-- Continua con gli altri esercizi...