-- Esercizi per protocolli rimanenti

-- PROTOCOLLO 4: Riattivazione Energia e Motivazione (8 giorni)
INSERT INTO ai_training_exercises (protocol_id, day_number, title, description, exercise_type, duration_minutes, instructions, materials)
SELECT p.id, exercises.day_num, exercises.title, exercises.description, 'physical', exercises.duration, exercises.instructions::text[], exercises.materials::text[]
FROM ai_training_protocols p,
(VALUES
  (1, 'Valutazione Stato Iniziale', 'Stabilire baseline di energia e interesse', 20,
   ARRAY['Testare reazioni a stimoli normalmente interessanti', 'Misurare durata attenzione', 'Annotare livelli di energia', 'Non forzare partecipazione'],
   ARRAY['Giochi preferiti', 'Premi vari', 'Cronometro']),
  (2, 'Stimolazione Olfattiva', 'Riattivare interesse attraverso profumi stimolanti', 15,
   ARRAY['Introdurre odori appetitosi (cibo, giochi)', 'Nascondere premi profumati', 'Permettere esplorazione libera', 'Celebrare ogni interesse mostrato'],
   ARRAY['Premi odorosi', 'Tappetino sniffing']),
  (3, 'Giochi a Bassa Energia', 'Attività coinvolgenti ma non faticose', 25,
   ARRAY['Giochi statici (puzzle, masticazione)', 'Evitare richieste di movimento eccessivo', 'Premi frequenti per partecipazione', 'Sessioni brevi e piacevoli'],
   ARRAY['Puzzle semplici', 'Giochi da masticare morbidi']),
  (4, 'Socializzazione Positiva', 'Riattivare interesse sociale', 30,
   ARRAY['Interazioni familiari leggere', 'Evitare sovrastimolazione', 'Rispettare segnali di disagio', 'Associare presenza umana a cose positive'],
   ARRAY['Premi sociali', 'Carezze gentili']),
  (5, 'Incremento Attività Graduale', 'Aumentare lentamente richieste di movimento', 20,
   ARRAY['Passeggiate brevissime (5-10 min)', 'Fermarsi appena mostra stanchezza', 'Molti premi durante movimento', 'Fare spesso pause'],
   ARRAY['Guinzaglio morbido', 'Premi portatili', 'Acqua']),
  (6, 'Stimolazione Mentale Progressiva', 'Aumentare sfide cognitive gradualmente', 25,
   ARRAY['Puzzle leggermente più complessi', 'Giochi che richiedono problem-solving', 'Aiutare se necessario', 'Celebrare ogni successo'],
   ARRAY['Puzzle di livello intermedio', 'Giochi interattivi']),
  (7, 'Costruzione Routine Positiva', 'Stabilire pattern di attività piacevoli', 35,
   ARRAY['Creare sequenza prevedibile di attività', 'Alternare riposo e stimolazione', 'Includere momenti di celebrazione', 'Mantenere aspettative realistiche'],
   ARRAY['Programma giornaliero', 'Varietà di attività']),
  (8, 'Consolidamento e Futuro', 'Valutazione progressi e piano continuativo', 30,
   ARRAY['Confrontare con valutazione iniziale', 'Identificare attività più efficaci', 'Creare piano mantenimento personalizzato', 'Celebrare miglioramenti ottenuti'],
   ARRAY['Documentazione progressi', 'Piano personalizzato'])
) AS exercises(day_num, title, description, duration, instructions, materials)
WHERE p.title = 'Riattivazione Energia e Motivazione';

-- PROTOCOLLO 5: Gestione Gelosia e Possessività (11 giorni)
INSERT INTO ai_training_exercises (protocol_id, day_number, title, description, exercise_type, duration_minutes, instructions, materials)
SELECT p.id, exercises.day_num, exercises.title, exercises.description, 'behavioral', exercises.duration, exercises.instructions::text[], exercises.materials::text[]
FROM ai_training_protocols p,
(VALUES
  (1, 'Identificazione Trigger Gelosia', 'Mappare situazioni che scatenano possessività', 30,
   ARRAY['Osservare reazioni a condivisione risorse', 'Testare reazioni a attenzioni verso altri', 'Annotare intensità delle reazioni', 'Identificare oggetti/situazioni problematiche'],
   ARRAY['Vari oggetti test', 'Quaderno osservazioni']),
  (2, 'Comando "Aspetta"', 'Insegnare autocontrollo di base', 20,
   ARRAY['Praticare "aspetta" prima dei pasti', 'Estendere gradualmente durata attesa', 'Premiare pazienza', 'Non cedere a insistenza'],
   ARRAY['Ciotola cibo', 'Premi per pazienza']),
  (3, 'Condivisione Controllata', 'Esercizi guidati di condivisione risorse', 25,
   ARRAY['Dividere premi con supervisione', 'Alternare attenzioni tra soggetti', 'Premiare comportamenti calmi', 'Intervenire preventivamente su tensioni'],
   ARRAY['Premi multipli', 'Altri animali/persone']),
  (4, 'Desensibilizzazione alla Perdita', 'Abituare a lasciare oggetti temporaneamente', 15,
   ARRAY['Prendere oggetto brevemente e restituire', 'Accompagnare con premi', 'Aumentare gradualmente durata', 'Mai portare via definitivamente durante esercizio'],
   ARRAY['Oggetti vari', 'Premi di scambio']),
  (5, 'Rinforzo Comportamenti Condivisivi', 'Premiare atti spontanei di condivisione', 20,
   ARRAY['Osservare e premiare condivisione naturale', 'Creare opportunità di condivisione facile', 'Celebrare comportamenti generosi', 'Ignorare possessività lieve'],
   ARRAY['Premi speciali', 'Opportunità condivisione']),
  (6, 'Gestione Spazio Personale', 'Insegnare rispetto per zone altrui', 30,
   ARRAY['Creare zone separate per ciascuno', 'Rispettare quando è nella sua zona', 'Insegnare a non invadere zone altrui', 'Premiare rispetto reciproco'],
   ARRAY['Separatori spazio', 'Zone definite']),
  (7, 'Controllo Impulsi Avanzato', 'Resistere a impulsi possessivi in situazioni complesse', 25,
   ARRAY['Presentare situazioni provocatorie controllate', 'Richiedere calma prima di procedere', 'Interrompere catene comportamentali problematiche', 'Reindirizzare energia positivamente'],
   ARRAY['Scenari controllati', 'Premi di alto valore']),
  (8, 'Socializzazione Multi-soggetto', 'Gestire gelosia in gruppo', 35,
   ARRAY['Interazioni con più animali/persone', 'Rotazione attenzioni equa', 'Prevenire coalizioni', 'Mantenere armonia generale'],
   ARRAY['Gruppo controllato', 'Gestione multipla']),
  (9, 'Comando "Lascia il Posto"', 'Cedere spazio/oggetti su richiesta', 20,
   ARRAY['Insegnare a spostarsi quando richiesto', 'Compensare con alternative attraenti', 'Non usare forza fisica', 'Premiare compliance volontaria'],
   ARRAY['Alternative attraenti', 'Spazi multipli']),
  (10, 'Test Situazioni Reali', 'Applicare apprendimenti in contesti naturali', 30,
   ARRAY['Situazioni domestiche normali', 'Visite di ospiti', 'Pasti familiari', 'Gestire senza controllo eccessivo'],
   ARRAY['Situazioni reali', 'Supporto discreto']),
  (11, 'Mantenimento Equilibrio', 'Strategie per equilibrio a lungo termine', 25,
   ARRAY['Creare routine che prevengono gelosia', 'Mantenere equità nelle attenzioni', 'Protocollo di intervento per ricadute', 'Celebrare armonia raggiunta'],
   ARRAY['Routine strutturata', 'Piano mantenimento'])
) AS exercises(day_num, title, description, duration, instructions, materials)
WHERE p.title = 'Gestione Gelosia e Possessività';