-- Continua aggiornamento esercizi "Gestione dell'Ansia" - parte 3

-- Gioco Interattivo Calmante
UPDATE public.ai_training_exercises 
SET instructions = ARRAY[
  '1. SELEZIONE GIOCHI: Scegli esclusivamente giochi a bassa intensità come puzzle semplici, giochi di ricerca olfattiva o attività di problem-solving tranquille',
  '2. IMPOSTAZIONE RITMO: Inizia tutte le attività con movimenti lenti e completamente prevedibili, evitando qualsiasi elemento di sorpresa o competitività',
  '3. RINFORZO PARTECIPAZIONE: Premia immediatamente ogni forma di partecipazione tranquilla e controllata, ignorando comportamenti troppo eccitati',
  '4. CONTROLLO ENERGIA: Mantieni costantemente il controllo del livello di energia, interrompendo l''attività se noti segni di sovraeccitazione',
  '5. GESTIONE RITMO: Tu detti sempre il ritmo del gioco - il pet deve adattarsi alla tua calma, non viceversa',
  '6. CONCLUSIONE ANTICIPATA: Termina l''attività mentre il pet è ancora interessato ma calmo, prima che diventi troppo stimolante o stancante',
  '7. TRANSIZIONE RILASSAMENTO: Concludi con alcuni minuti di attività ancora più tranquilla per consolidare lo stato di calma raggiunto'
],
tips = ARRAY[
  'Evita giochi che coinvolgono competizione, velocità o alta eccitazione',
  'Mantieni sempre il controllo dell''intensità - meglio sotto-stimolare che sovra-stimolare',
  'Usa la tua voce calma e movimenti lenti come guida costante',
  'Fermati immediatamente se il pet diventa troppo eccitato'
],
success_criteria = ARRAY[
  'Il pet partecipa al gioco mantenendo uno stato emotivo calmo e controllato',
  'Capacità di seguire il ritmo tranquillo imposto senza diventare frenetico',
  'Il pet cerca attivamente questi tipi di giochi calmi quando è ansioso',
  'Miglioramento generale della capacità di autoregolazione durante il gioco'
],
objectives = ARRAY[
  'Insegnare che il gioco può essere un''attività rilassante e non eccitante',
  'Sviluppare autocontrollo attraverso attività ludiche strutturate',
  'Fornire stimolazione mentale positiva che riduce l''ansia',
  'Creare associazioni positive tra interazione e calma'
]
WHERE title = 'Gioco Interattivo Calmante' AND protocol_id IN (
  SELECT id FROM public.ai_training_protocols 
  WHERE title ILIKE '%gestione%ansia%'
);

-- Valutazione e Pianificazione Futura
UPDATE public.ai_training_exercises 
SET instructions = ARRAY[
  '1. REVISIONE SISTEMATICA: Esamina metodicamente tutti gli esercizi della settimana consultando il diario, identificando pattern e tendenze nei risultati',
  '2. IDENTIFICAZIONE EFFICACIA: Analizza quali tecniche hanno prodotto i migliori risultati per il tuo pet specifico, considerando rapidità e durata degli effetti',
  '3. MAPPING CRITICITÀ: Nota accuratamente le situazioni, momenti o trigger che necessitano ancora lavoro o che hanno mostrato resistenza al miglioramento',
  '4. SVILUPPO PIANO MANTENIMENTO: Crea un programma strutturato di mantenimento che integri le tecniche più efficaci nella routine quotidiana',
  '5. SCHEDULING CONTROLLI: Stabilisci un calendario di controlli periodici (settimanali, mensili) per monitorare i progressi e adattare l''approccio',
  '6. CELEBRAZIONE SUCCESSI: Dedica tempo specifico a riconoscere e celebrare i successi ottenuti, per rinforzare il progresso fatto',
  '7. PIANIFICAZIONE EVOLUZIONE: Anticipa come il piano dovrà evolversi nel tempo e identifica quando potrebbe essere necessario supporto professionale aggiuntivo'
],
tips = ARRAY[
  'Sii onesto e obiettivo nella valutazione - sia sui successi che sulle aree che necessitano lavoro',
  'Documenta tutto per avere riferimenti concreti per il futuro',
  'Non aspettarti perfezione - l''ansia è un processo che richiede gestione continua',
  'Celebra anche i piccoli progressi - sono fondamentali per la motivazione'
],
success_criteria = ARRAY[
  'Identificazione chiara delle strategie più efficaci per il pet specifico',
  'Piano di mantenimento realistico e sostenibile nel tempo',
  'Sistema di monitoraggio che permette di individuare tempestivamente le ricadute',
  'Maggiore fiducia nella gestione dell''ansia del pet'
],
objectives = ARRAY[
  'Consolidare gli apprendimenti e renderli parte della routine quotidiana',
  'Creare un sistema di monitoraggio continuo del benessere del pet',
  'Sviluppare autonomia nella gestione dell''ansia del pet',
  'Prevenire ricadute attraverso pianificazione proattiva'
]
WHERE title = 'Valutazione e Pianificazione Futura' AND protocol_id IN (
  SELECT id FROM public.ai_training_protocols 
  WHERE title ILIKE '%gestione%ansia%'
);