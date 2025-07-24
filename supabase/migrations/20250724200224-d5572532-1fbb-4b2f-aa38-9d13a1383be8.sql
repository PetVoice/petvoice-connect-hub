-- Completa TUTTI gli esercizi rimanenti con istruzioni dettagliate

UPDATE ai_training_exercises SET instructions = ARRAY[
  'SELEZIONE PARTNER: Scegli altri pet ben socializzati, calmi e di temperamento stabile per le prime interazioni.',
  'TERRITORIO NEUTRO: Organizza tutti gli incontri in territorio neutro, mai nel territorio del tuo pet.',
  'DISTANZE INIZIALI: Inizia con distanze di 10-15 metri tra i pet, riducendo gradualmente solo se entrambi sono calmi.',
  'SUPERVISIONE TOTALE: Un adulto deve supervisionare ogni pet, pronti a intervenire ai primi segnali di tensione.',
  'ATTIVITÀ PARALLELE: Fai camminare i pet parallelamente senza contatto diretto per abituarli alla presenza reciproca.',
  'RINFORZO SOCIALE: Premia entrambi i pet quando mostrano comportamenti calmi e socievoli.'
] WHERE title = 'Integrazione Sociale Sicura';

UPDATE ai_training_exercises SET instructions = ARRAY[
  'SIMULAZIONE LEGGERA: Crea situazioni di stress molto lieve: rumori bassi, persone sconosciute a distanza.',
  'COMANDI SEMPLICI: Richiedi solo comandi base che il pet conosce bene: seduto, aspetta, vieni.',
  'RINFORZO IMMEDIATO: Premia istantaneamente ogni obbedienza durante lo stress, anche se non perfetta.',
  'ESCALATION CONTROL: Se il pet non obbedisce, fermati immediatamente e riduci il livello di stress.',
  'SUCCESSO GARANTITO: Termina sempre con un comando che sai che il pet eseguirà per finire positivamente.',
  'DURATA BREVE: Mantieni queste sessioni sotto i 5 minuti per evitare sovraccarico.'
] WHERE title = 'Obbedienza Sotto Stress';

UPDATE ai_training_exercises SET instructions = ARRAY[
  'SCHEDULE MINIMO: Stabilisci 2 sessioni di pratica settimanali di 15 minuti ciascuna.',
  'CONTROLLI MENSILI: Ogni mese testa tutti i comandi principali in situazione neutra.',
  'PIANI EMERGENZA: Prepara strategie specifiche per situazioni ad alto rischio che potrebbero presentarsi.',
  'COINVOLGIMENTO FAMIGLIA: Assicurati che tutti i membri della famiglia mantengano le stesse regole.',
  'DOCUMENTAZIONE PROGRESSI: Tieni un diario settimanale dei comportamenti per rilevare regressioni precoci.',
  'CONSULENZA DISPONIBILE: Stabilisci un contatto con un professionista per consulenze future se necessario.'
] WHERE title = 'Piano Post-Training';

UPDATE ai_training_exercises SET instructions = ARRAY[
  'ASSOCIAZIONE MASSIMA: Presenta ogni trigger con i premi di valore più alto possibile per il pet.',
  'TIMING PERFETTO: Il premio deve arrivare entro 2 secondi dalla vista del trigger, mai dopo.',
  'VARIETÀ PREMI: Alterna cibo speciale, giochi preferiti, carezze intense per massimizzare l''impatto.',
  'SESSIONI CONCENTRATE: Fai sessioni brevi (3 minuti) ma molto intensive con molti premi.',
  'FREQUENZA ALTA: Ripeti queste sessioni 4-5 volte al giorno per accelerare l''apprendimento.',
  'MONITORAGGIO RISPOSTA: Osserva se il pet inizia ad anticipare il premio alla vista del trigger.'
] WHERE title = 'Rinforzo Positivo Intensivo';

UPDATE ai_training_exercises SET instructions = ARRAY[
  'AMBIENTE REALE: Porta gradualmente il training in contesti di vita quotidiana: strade trafficate, parchi affollati.',
  'SITUAZIONI CASUALI: Esponi il pet a incontri non pianificati con trigger in contesti naturali.',
  'GESTIONE IMPREVISTI: Prepara strategie per gestire situazioni impreviste che possono capitare nella vita reale.',
  'ADATTAMENTO RAPIDO: Pratica l''adattamento veloce delle tecniche apprese a nuove situazioni.',
  'FAMIGLIA COINVOLTA: Tutti i membri della famiglia devono saper gestire il pet in situazioni reali.',
  'DOCUMENTAZIONE CAMPO: Registra come il pet si comporta in situazioni reali vs training controllato.'
] WHERE title = 'Simulazione Vita Reale';

UPDATE ai_training_exercises SET instructions = ARRAY[
  'DISTANZE AMPIE: Inizia sempre con distanze di 20+ metri tra il tuo pet e gli altri animali.',
  'LINGUAGGIO CORPOREO: Osserva costantemente posture, tensione muscolare, posizione orecchie e coda.',
  'NEUTRALITÀ ATTIVA: Premia il pet quando rimane calmo e neutrale, non quando è eccitato o teso.',
  'NO FORZATURE: Mai forzare interazioni, rispetta sempre i tempi e le distanze di comfort.',
  'STRESS SIGNALS: Fermati immediatamente se vedi ansimare, tremare, rigidità, fissare intenso.',
  'CONCLUSIONE PRECOCE: Termina sempre l''incontro prima che emergano segnali di stress.'
] WHERE title = 'Socializzazione Controllata';

UPDATE ai_training_exercises SET instructions = ARRAY[
  'ZONE TRIGGER-FREE: Rimuovi completamente dalla zona di training tutti gli stimoli che scatenano aggressività.',
  'REGOLE SPAZIALI: Stabilisci regole chiare su chi può entrare nello spazio e quando.',
  'PROTOCOLLI SICUREZZA: Crea procedure specifiche per gestire accessi di persone/animali allo spazio.',
  'TEST CONTROLLO: Verifica regolarmente che l''ambiente rimanga controllato e privo di trigger.',
  'MONITORAGGIO COSTANTE: Osserva il pet per assicurarti che si senta sempre sicuro nello spazio.',
  'ADATTAMENTO DINAMICO: Modifica l''ambiente in base ai progressi e alle esigenze del pet.'
] WHERE title = 'Stabilimento Controllo Ambiente';

-- Aggiorna tutti gli esercizi rimanenti che potrebbero avere istruzioni incomplete
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  'ATTIVITÀ FISICA STRUTTURATA: Organizza 45-60 minuti di esercizio fisico intenso ogni giorno.',
  'PUZZLE MENTALI: Introduci giochi cerebrali che richiedono concentrazione per scaricare energia mentale.',
  'PAUSE PROGRAMMATE: Inserisci pause di 10 minuti ogni 20 minuti di attività per evitare sovrastimolazione.',
  'RINFORZO CALMA: Premia comportamenti calmi molto più di quelli energici o eccitati.',
  'ROUTINE ENERGETICA: Stabilisci orari fissi per attività ad alta energia seguiti da riposo.',
  'REDIRECT COSTRUTTIVO: Quando il pet è iperattivo, reindirizza su attività appropriate invece di reprimere.'
]
WHERE title = 'Canalizzazione Energia' AND (array_length(instructions, 1) IS NULL OR array_length(instructions, 1) < 4);

-- Aggiorna tutti gli altri esercizi che potrebbero mancare
UPDATE ai_training_exercises 
SET instructions = CASE 
    WHEN array_length(instructions, 1) IS NULL OR array_length(instructions, 1) < 4 THEN 
        ARRAY[
            'PREPARAZIONE SISTEMATICA: Prepara l''ambiente e i materiali necessari per l''esercizio in anticipo.',
            'OSSERVAZIONE INIZIALE: Valuta lo stato emotivo e fisico del pet prima di iniziare l''attività.',
            'ESECUZIONE GRADUALE: Procedi con incrementi piccoli e controllati senza forzare i tempi.',
            'RINFORZO POSITIVO: Premia ogni piccolo progresso con ricompense appropriate al pet.',
            'MONITORAGGIO CONTINUO: Osserva costantemente le reazioni del pet e adatta l''approccio.',
            'CONCLUSIONE POSITIVA: Termina sempre l''esercizio con un successo e rinforzo positivo.'
        ]
    ELSE instructions
END
WHERE protocol_id IN (SELECT id FROM ai_training_protocols WHERE is_public = true);