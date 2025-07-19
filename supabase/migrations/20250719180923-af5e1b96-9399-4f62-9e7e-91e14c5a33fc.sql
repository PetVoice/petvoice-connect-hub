-- Creo esercizi per i nuovi protocolli

-- PROTOCOLLO 1: Gestione Iperattività e Deficit Attenzione (10 giorni)
INSERT INTO ai_training_exercises (protocol_id, day_number, title, description, exercise_type, duration_minutes, instructions, materials)
SELECT p.id, day_num, title, description, 'behavioral', duration, instructions::text[], materials::text[]
FROM ai_training_protocols p,
(VALUES
  (1, 'Focus e Attenzione Base', 'Esercizi di base per migliorare concentrazione e controllo degli impulsi', 20, 
   ARRAY['Chiedi al cane di sedersi', 'Mantieni il contatto visivo per 3 secondi', 'Premia immediatamente', 'Ripeti 10 volte'], 
   ARRAY['Premi di alto valore', 'Guinzaglio corto']),
  (2, 'Canalizzazione Energia Positiva', 'Attività strutturate per sfogare energia in modo costruttivo', 25,
   ARRAY['Percorso ad ostacoli semplice', 'Alternare salti e sosta', 'Premiare la calma tra esercizi', 'Sessioni da 5 minuti x 3'],
   ARRAY['Ostacoli bassi', 'Coni', 'Premi']),
  (3, 'Controllo Impulsi - Cibo', 'Esercizi di autocontrollo usando il cibo come motivatore', 15,
   ARRAY['Mostra il premio senza darlo', 'Aspetta che il cane si calmi', 'Premia solo quando è rilassato', 'Aumenta gradualmente il tempo'],
   ARRAY['Premi appetitosi', 'Ciotola']),
  (4, 'Rilassamento Guidato', 'Tecniche per insegnare il comando "relax" e favorire la calma', 30,
   ARRAY['Posizione down sul tappetino', 'Comando "relax" con voce calma', 'Massaggio leggero', 'Musica rilassante di sottofondo'],
   ARRAY['Tappetino comfort', 'Musica rilassante']),
  (5, 'Focus Avanzato con Distrazioni', 'Mantenere attenzione nonostante stimoli esterni', 20,
   ARRAY['Esercizi di base con rumori leggeri', 'Incrementare gradualmente le distrazioni', 'Premiare solo successi completi', 'Max 3 tentativi per sessione'],
   ARRAY['Fonte di rumore controllata', 'Premi speciali']),
  (6, 'Giochi di Problem Solving', 'Stimolazione mentale per incanalare energia mentale', 25,
   ARRAY['Nascondere premi nel tappetino sniffing', 'Tempo limite 10 minuti', 'Supervisionare e guidare se necessario', 'Celebrare ogni successo'],
   ARRAY['Tappetino sniffing', 'Premi piccoli']),
  (7, 'Controllo Movimento', 'Esercizi per gestire movimenti impulsivi', 15,
   ARRAY['Seduto-in piedi lentamente', 'Stop su comando durante cammino', 'Premiare movimenti controllati', '5 ripetizioni per comando'],
   ARRAY['Guinzaglio', 'Premi']),
  (8, 'Calma in Situazioni Eccitanti', 'Mantenere controllo in momenti di alta stimolazione', 20,
   ARRAY['Simulare situazioni eccitanti (campanello, ospiti)', 'Richiedere calma prima di procedere', 'Ignorare comportamenti iperattivi', 'Premiare solo stati calmi'],
   ARRAY['Campanello', 'Premi di alto valore']),
  (9, 'Sequenze di Comandi', 'Eseguire serie di comandi per migliorare concentrazione', 25,
   ARRAY['Seduto-terra-resta-vieni', 'Eseguire senza interruzioni', 'Tempo di pausa tra comandi', 'Premiare sequenza completa'],
   ARRAY['Premi', 'Spazio aperto']),
  (10, 'Autocontrollo Avanzato', 'Test finale di controllo comportamentale', 30,
   ARRAY['Combinare tutti gli esercizi precedenti', 'Aumentare durata e difficoltà', 'Valutare progressi', 'Sessione di consolidamento'],
   ARRAY['Tutti i materiali precedenti'])
) AS exercises(day_num, title, description, duration, instructions, materials)
WHERE p.title = 'Gestione Iperattività e Deficit Attenzione';

-- PROTOCOLLO 2: Stop Comportamenti Distruttivi (12 giorni)
INSERT INTO ai_training_exercises (protocol_id, day_number, title, description, exercise_type, duration_minutes, instructions, materials)
SELECT p.id, day_num, title, description, 'behavioral', duration, instructions::text[], materials::text[]
FROM ai_training_protocols p,
(VALUES
  (1, 'Identificazione Trigger', 'Mappare situazioni che scatenano comportamenti distruttivi', 30,
   ARRAY['Osservare senza intervenire', 'Annotare orari e situazioni', 'Identificare pattern', 'Non punire, solo osservare'],
   ARRAY['Quaderno osservazioni']),
  (2, 'Reindirizzamento Masticazione', 'Fornire alternative appropriate per masticare', 20,
   ARRAY['Sostituire oggetto proibito con gioco da masticare', 'Lodare quando usa oggetto corretto', 'Ignorare masticazione inappropriata', 'Rotazione giochi ogni 3 giorni'],
   ARRAY['Giochi da masticare', 'Spray amaro']),
  (3, 'Controllo Accesso Ambientale', 'Gestire ambiente per prevenire distruzione', 15,
   ARRAY['Rimuovere tentazioni alla portata', 'Creare zone sicure', 'Supervisionare sempre inizialmente', 'Aumentare gradualmente libertà'],
   ARRAY['Barriere fisiche', 'Box/recinto']),
  (4, 'Stimolazione Mentale Intensiva', 'Stancare mentalmente per ridurre energia distruttiva', 25,
   ARRAY['Puzzle feeder per tutti i pasti', 'Nascondere cibo in casa', 'Giochi rotanti ogni ora', 'Sessioni brevi ma frequenti'],
   ARRAY['Puzzle feeder', 'Giochi interattivi']),
  (5, 'Comando "Lascia"', 'Insegnare a mollare oggetti su richiesta', 20,
   ARRAY['Offrire scambio vantaggioso', 'Mai togliere con forza', 'Comando "lascia" + premio', 'Praticare con oggetti non importanti'],
   ARRAY['Oggetti vari', 'Premi di alto valore']),
  (6, 'Gestione Energia Fisica', 'Scaricare energia attraverso attività appropriate', 30,
   ARRAY['Esercizio fisico intenso mattina', 'Giochi di riporto', 'Camminate lunghe', 'Stanchezza fisica prima di lasciarlo solo'],
   ARRAY['Palla', 'Guinzaglio lungo']),
  (7, 'Tecniche Anti-Scavo', 'Prevenire e reindirizzare comportamenti di scavo', 25,
   ARRAY['Creare zona scavo autorizzata', 'Nascondere tesori nella zona permessa', 'Bloccare accesso ad aree proibite', 'Premiare scavo corretto'],
   ARRAY['Sabbia/terra', 'Premi nascosti', 'Reti protettive']),
  (8, 'Controllo Separazione', 'Gestire comportamenti distruttivi quando resta solo', 20,
   ARRAY['Uscite brevissime iniziali (5 min)', 'Aumentare gradualmente durata', 'Lasciare giochi speciali', 'Rientrare solo se calmo'],
   ARRAY['Giochi Kong', 'Camera sorveglianza']),
  (9, 'Rinforzo Comportamenti Positivi', 'Aumentare frequenza di comportamenti desiderati', 15,
   ARRAY['Premiare immediatamente comportamenti calmi', 'Ignorare comportamenti distruttivi', 'Attenzione solo per azioni positive', 'Consistenza familiare'],
   ARRAY['Premi vari', 'Clicker']),
  (10, 'Gestione Stress Ambientale', 'Ridurre fattori di stress che causano distruzione', 25,
   ARRAY['Routine giornaliera fissa', 'Spazi comfort sempre accessibili', 'Minimizzare cambiamenti', 'Diffusore feromoni'],
   ARRAY['Diffusore feromoni', 'Coperte comfort']),
  (11, 'Test Resistenza', 'Verificare controllo in situazioni provocatorie', 30,
   ARRAY['Lasciare oggetti tentanti sotto controllo', 'Simulare assenze brevi', 'Aumentare difficoltà gradualmente', 'Intervenire solo se necessario'],
   ARRAY['Oggetti test', 'Telecamera']),
  (12, 'Consolidamento e Mantenimento', 'Stabilizzare i progressi ottenuti', 20,
   ARRAY['Review completa di tutti i trigger', 'Test situazioni reali', 'Piano mantenimento lungo termine', 'Celebrare successi'],
   ARRAY['Tutti i materiali precedenti'])
) AS exercises(day_num, title, description, duration, instructions, materials)
WHERE p.title = 'Stop Comportamenti Distruttivi';