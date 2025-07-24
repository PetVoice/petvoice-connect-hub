-- Continua aggiornamento esercizi "Gestione dell'Ansia" - parte 4

-- Tecniche Grounding Avanzate
UPDATE public.ai_training_exercises 
SET instructions = ARRAY[
  '1. PREPARAZIONE ESERCIZIO 5-4-3-2-1: Siedi con il pet e inizia l''esercizio nominando 5 cose che puoi vedere, 4 che puoi toccare, 3 che puoi sentire, 2 che puoi odorare, 1 che puoi gustare',
  '2. COINVOLGIMENTO SENSORIALE PET: Guida dolcemente il pet a esplorare gli stessi stimoli sensoriali che stai usando, permettendogli di annusare, toccare e osservare insieme a te',
  '3. FOCUS SENSAZIONI POSITIVE: Concentrati insieme al pet su sensazioni fisiche piacevoli come il calore del sole, la morbidezza di una coperta, o il contatto delle tue mani',
  '4. RESPIRAZIONE CON CONTA: Pratica respirazione controllata contando ad alta voce (4 inspirazioni, 4 espirazioni) permettendo al pet di sincronizzarsi con il ritmo',
  '5. IMPLEMENTAZIONE MANTRA: Ripeti mantra calmanti personalizzati come "siamo al sicuro", "questo momento passerà", "siamo insieme" con voce rassicurante',
  '6. ANCORAGGIO FISICO: Utilizza oggetti tattili specifici (pietra liscia, tessuto morbido) che diventino ancore fisiche per richiamare lo stato di calma',
  '7. INTEGRAZIONE QUOTIDIANA: Pratica queste tecniche anche quando il pet non è ansioso, per creare associazioni positive e memoria muscolare'
],
tips = ARRAY[
  'Mantieni la voce calma e costante durante tutto l''esercizio',
  'Adatta l''intensità delle tecniche al livello di ansia del pet in quel momento',
  'Usa gli stessi oggetti tattili per creare coerenza e riconoscimento',
  'Pratica regolarmente le tecniche per aumentarne l''efficacia in situazioni di stress'
],
success_criteria = ARRAY[
  'Il pet si orienta verso gli stimoli sensoriali proposti',
  'Riduzione visibile dell''agitazione durante l''esercizio di grounding',
  'Il pet cerca spontaneamente gli oggetti di ancoraggio quando ansioso',
  'Miglioramento della capacità di rimanere presente nel momento attuale'
],
objectives = ARRAY[
  'Insegnare al pet a rimanere ancorato al momento presente',
  'Interrompere i cicli di pensiero ansioso attraverso focus sensoriale',
  'Creare strumenti concreti e immediati per gestire l''ansia acuta',
  'Sviluppare una cassetta degli attrezzi di tecniche di autoregolazione'
]
WHERE title = 'Tecniche Grounding Avanzate' AND protocol_id IN (
  SELECT id FROM public.ai_training_protocols 
  WHERE title ILIKE '%gestione%ansia%'
);

-- Gestione Attacchi Ansia
UPDATE public.ai_training_exercises 
SET instructions = ARRAY[
  '1. RICONOSCIMENTO PRECOCE: Impara a identificare i segnali precoci di escalation (respirazione accelerata, irrequietezza, vocalizzazioni) e intervieni immediatamente',
  '2. PROTOCOLLO INTERVENTO IMMEDIATO: Attiva subito il protocollo di emergenza: voce calma, ambiente sicuro, eliminazione stimoli stressanti, presenza rassicurante',
  '3. TECNICHE DE-ESCALATION ATTIVE: Utilizza respirazione profonda condivisa, contatto fisico dolce (se tollerato), vocalizzazioni rassicuranti, movimenti lenti e prevedibili',
  '4. MANTENIMENTO PRESENZA CALMA: Rimani fisicamente e emotivamente presente senza ansia o panico, il pet percepisce il tuo stato emotivo e si regolerà di conseguenza',
  '5. APPLICAZIONE STRATEGIE SPECIFICHE: Usa le tecniche che hai scoperto essere più efficaci per il tuo pet (massaggio, zona sicura, respirazione, grounding)',
  '6. MONITORAGGIO PROGRESSIVO: Osserva attentamente i segnali di miglioramento e adatta l''intensità dell''intervento man mano che l''attacco diminuisce',
  '7. RECOVERY GUIDATO: Accompagna il pet nella fase di recupero con attività molto tranquille, offerta di acqua, conferme positive, evitando sovrastimolazione'
],
tips = ARRAY[
  'Non andare mai in panico tu stesso - la tua calma è fondamentale per la risoluzione',
  'Tieni sempre a portata di mano il kit di intervento rapido preparato in precedenza',
  'Documenta ogni episodio per identificare pattern e migliorare le strategie',
  'Se gli attacchi sono frequenti o gravi, consulta un veterinario comportamentalista'
],
success_criteria = ARRAY[
  'Riduzione del tempo necessario per calmare il pet durante un attacco',
  'Diminuzione dell''intensità e frequenza degli episodi di ansia acuta',
  'Il pet recupera più rapidamente dopo un episodio ansioso',
  'Maggiore fiducia nella gestione efficace delle situazioni di crisi'
],
objectives = ARRAY[
  'Fornire un protocollo strutturato per gestire episodi acuti di ansia',
  'Ridurre la durata e l''intensità degli attacchi attraverso intervento rapido',
  'Aumentare la resilienza del pet attraverso supporto efficace',
  'Creare sicurezza e fiducia nella gestione delle emergenze emotive'
]
WHERE title = 'Gestione Attacchi Ansia' AND protocol_id IN (
  SELECT id FROM public.ai_training_protocols 
  WHERE title ILIKE '%gestione%ansia%'
);