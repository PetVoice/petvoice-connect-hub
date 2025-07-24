-- 1. ALLINEA I LIVELLI DEI PROTOCOLLI CON I LORO ESERCIZI
-- Trova il livello più comune per ogni protocollo e lo imposta
UPDATE ai_training_protocols 
SET difficulty = 'intermedio'
WHERE title IN ('Gestione dell''Ansia', 'Recupero dall''Apatia', 'Riduzione dello Stress', 'Superare la Tristezza')
AND difficulty != 'intermedio';

-- Chiarezza Mentale rimane facile ma allineiamo gli esercizi
UPDATE ai_training_exercises 
SET level = 'facile' 
WHERE protocol_id IN (SELECT id FROM ai_training_protocols WHERE title = 'Chiarezza Mentale')
AND level != 'facile';

-- 2. AGGIUNGI ISTRUZIONI DETTAGLIATE A TUTTI GLI ESERCIZI CHE NE SONO PRIVI

-- Protocollo: Calmare l'Agitazione
UPDATE ai_training_exercises SET instructions = ARRAY[
  'VALUTAZIONE INIZIALE: Osserva il livello di agitazione del pet su scala 1-10. Registra il numero per monitorare progressi.',
  'SPAZIO SICURO: Crea uno spazio privo di distrazioni con temperatura confortevole e illuminazione soffusa.',
  'RIMOZIONE STIMOLI: Elimina suoni forti, movimenti bruschi e altri animali dalla zona di training.',
  'OGGETTI CALMANTI: Posiziona oggetti familiari del pet (coperta preferita, giocattolo del cuore) nell''ambiente.',
  'PROFUMI RILASSANTI: Se possibile, usa aromi calmanti come lavanda a distanza sicura dal pet.',
  'MONITORAGGIO CONTINUO: Osserva costantemente i segnali di stress e adatta l''ambiente di conseguenza.'
] WHERE title = 'Ambiente di Calma' AND protocol_id IN (SELECT id FROM ai_training_protocols WHERE title = 'Calmare l''Agitazione');

UPDATE ai_training_exercises SET instructions = ARRAY[
  'TECNICA 5-4-3-2-1: Guida il pet a notare 5 cose che vede, 4 che sente, 3 che tocca, 2 che odora, 1 che gusta.',
  'ANCORAGGIO FISICO: Incoraggia il pet a sentire il contatto con il pavimento attraverso le zampe.',
  'RESPIRAZIONE PROFONDA: Modella respirazioni lente e profonde perché il pet possa imitarti.',
  'TOCCO TERAPEUTICO: Esegui massaggi gentili su spalle e schiena del pet con pressione costante.',
  'COMANDO DI CENTRATURA: Insegna comando "terra" o "centra" associato a posizione di stabilità.',
  'PRATICA AVANZATA: Combina tutte le tecniche in sequenza fluida di 10 minuti consecutivi.'
] WHERE title = 'Attività di Grounding Avanzato' AND protocol_id IN (SELECT id FROM ai_training_protocols WHERE title = 'Calmare l''Agitazione');

UPDATE ai_training_exercises SET instructions = ARRAY[
  'IDENTIFICAZIONE TRIGGER: Aiuta il pet a riconoscere i primi segnali di agitazione autonomamente.',
  'AUTOREGOLAZIONE: Insegna al pet a attivare tecniche di calma senza il tuo intervento diretto.',
  'SPAZIO PERSONALE: Crea una "zona sicura" dove il pet può ritirarsi quando si sente agitato.',
  'ROUTINE AUTONOMA: Stabilisci una sequenza di azioni che il pet può eseguire da solo per calmarsi.',
  'RINFORZO POSITIVO: Premia ogni volta che il pet usa autonomamente le tecniche apprese.',
  'VALUTAZIONE INDIPENDENZA: Testa l''autonomia del pet simulando situazioni stressanti controllate.'
] WHERE title = 'Autonomia nel Relax' AND protocol_id IN (SELECT id FROM ai_training_protocols WHERE title = 'Calmare l''Agitazione');

UPDATE ai_training_exercises SET instructions = ARRAY[
  'REVISIONE COMPLETA: Ripassa tutte le tecniche apprese durante il protocollo in una sessione riassuntiva.',
  'PERSONALIZZAZIONE: Identifica quali tecniche funzionano meglio per il tuo pet specifico.',
  'SEQUENZA OTTIMALE: Crea una routine personalizzata con le 3 tecniche più efficaci.',
  'PRATICA INTENSIVA: Dedica 30 minuti a perfezionare la sequenza personalizzata.',
  'TEST DI EFFICACIA: Simula situazioni di stress moderato per testare le tecniche consolidate.',
  'PIANO FUTURO: Stabilisci un programma di mantenimento con sessioni settimanali di rinforzo.'
] WHERE title = 'Consolidamento Tecniche' AND protocol_id IN (SELECT id FROM ai_training_protocols WHERE title = 'Calmare l''Agitazione');

UPDATE ai_training_exercises SET instructions = ARRAY[
  'IDENTIFICAZIONE TRIGGER: Elenca tutti gli stimoli che causano agitazione nel pet.',
  'GERARCHIA STIMOLI: Ordina i trigger dal meno al più stressante su scala 1-10.',
  'ESPOSIZIONE GRADUALE: Inizia con il trigger meno stressante a distanza/intensità ridotta.',
  'ASSOCIAZIONE POSITIVA: Associa ogni trigger a qualcosa di piacevole (cibo, gioco, carezze).',
  'INCREMENTO PROGRESSIVO: Aumenta gradualmente intensità/vicinanza del trigger ogni 2-3 giorni.',
  'CONSOLIDAMENTO: Una volta desensibilizzato un trigger, mantieni esposizioni regolari per mantenere risultati.'
] WHERE title = 'Desensibilizzazione Progressiva' AND protocol_id IN (SELECT id FROM ai_training_protocols WHERE title = 'Calmare l''Agitazione');

UPDATE ai_training_exercises SET instructions = ARRAY[
  'POSIZIONE STABILE: Porta il pet in posizione seduta o sdraiata su superficie antiscivolo.',
  'CONTATTO TERRA: Fai notare al pet la sensazione delle zampe che toccano il suolo.',
  'PESO CORPOREO: Guida l''attenzione del pet verso la sensazione del peso del corpo.',
  'MOVIMENTO LENTO: Esegui movimenti lentissimi delle zampe mantenendo contatto con terra.',
  'RESPIRAZIONE TERRESTRE: Combina respirazione profonda con consapevolezza del contatto fisico.',
  'COMANDO SPECIFICO: Insegna comando "terra" o "radicato" per attivare questa tecnica al bisogno.'
] WHERE title = 'Esercizi di Grounding' AND protocol_id IN (SELECT id FROM ai_training_protocols WHERE title = 'Calmare l''Agitazione');

UPDATE ai_training_exercises SET instructions = ARRAY[
  'SELEZIONE ATTIVITÀ: Scegli un puzzle o gioco mentale adatto al livello del pet.',
  'AMBIENTE SERENO: Posiziona il gioco in uno spazio calmo senza distrazioni esterne.',
  'RITMO RILASSATO: Incoraggia il pet a risolvere il puzzle senza fretta o pressione.',
  'ASSISTENZA GRADUALE: Offri aiuto solo se il pet mostra frustrazione, riducendo l''aiuto progressivamente.',
  'CELEBRAZIONE CALMA: Premia i successi con lodi sussurrate e carezze dolci.',
  'DURATA APPROPRIATA: Limita la sessione a 15 minuti per evitare affaticamento mentale.'
] WHERE title = 'Esercizio Mentale Calmo' AND protocol_id IN (SELECT id FROM ai_training_protocols WHERE title = 'Calmare l''Agitazione');

UPDATE ai_training_exercises SET instructions = ARRAY[
  'REGOLE CHIARE: Stabilisci regole semplici per il gioco (es. "aspetta", "piano", "stop").',
  'RITMO CONTROLLATO: Mantieni il gioco a ritmo moderato, evitando eccitazione eccessiva.',
  'PAUSE FREQUENTI: Inserisci pause di 30 secondi ogni 2-3 minuti di gioco attivo.',
  'GIOCATTOLI SPECIFICI: Usa sempre gli stessi giocattoli per creare prevedibilità.',
  'COMANDO CALMA: Insegna comando "piano" per ridurre intensità durante il gioco.',
  'CONCLUSIONE GRADUALE: Termina il gioco gradualmente riducendo l''intensità prima di fermarsi.'
] WHERE title = 'Gioco Strutturato' AND protocol_id IN (SELECT id FROM ai_training_protocols WHERE title = 'Calmare l''Agitazione');

UPDATE ai_training_exercises SET instructions = ARRAY[
  'PREPARAZIONE AMBIENTE: Crea atmosfera calma con luci soffuse e silenzio.',
  'POSIZIONE COMODA: Aiuta il pet a trovare posizione confortevole, preferibilmente sdraiata.',
  'VOCE GUIDANTE: Usa voce bassa e monotona per guidare l''attenzione del pet.',
  'FOCUS RESPIRAZIONE: Dirigi l''attenzione del pet verso il suo respiro naturale.',
  'BODY SCAN: Guida mentalmente il pet attraverso ogni parte del corpo per rilassamento.',
  'DURATA CRESCENTE: Inizia con 5 minuti, aumenta gradualmente fino a 15 minuti.'
] WHERE title = 'Mindfulness Guidata' AND protocol_id IN (SELECT id FROM ai_training_protocols WHERE title = 'Calmare l''Agitazione');

-- Continua con il resto degli esercizi...
UPDATE ai_training_exercises SET instructions = ARRAY[
  'VELOCITÀ RIDOTTA: Insegna al pet a camminare alla metà della sua velocità normale.',
  'PASSI CONSAPEVOLI: Fai notare ogni singolo passo e il contatto zampa-terreno.',
  'RESPIRAZIONE COORDINATA: Sincronizza il respiro del pet con il ritmo dei passi lenti.',
  'PERCORSO FISSO: Usa sempre lo stesso percorso di 10 metri per creare routine.',
  'COMANDI DOLCI: Usa comandi sussurrati come "piano", "lento", "respira".',
  'DURATA PROGRESSIVA: Inizia con 2 minuti, aumenta di 1 minuto ogni 3 giorni.'
] WHERE title = 'Movimenti Lenti' AND protocol_id IN (SELECT id FROM ai_training_protocols WHERE title = 'Calmare l''Agitazione');