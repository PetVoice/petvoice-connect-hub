-- Completa aggiornamento esercizi "Gestione dell'Ansia" - parte finale

-- Costruzione Resilienza
UPDATE public.ai_training_exercises 
SET instructions = ARRAY[
  '1. PIANIFICAZIONE ESPOSIZIONE GRADUALE: Crea un piano strutturato di esposizione graduale ai trigger ansiosi, iniziando con intensità minima e aumentando molto lentamente',
  '2. COSTRUZIONE FIDUCIA SISTEMATICA: Lavora quotidianamente su piccoli successi facilmente raggiungibili per costruire fiducia nelle capacità del pet di gestire lo stress',
  '3. CELEBRAZIONE ATTIVA SUCCESSI: Riconosci e celebra ogni piccolo progresso con entusiasmo autentico, creando associazioni positive con il superamento delle sfide',
  '4. RINFORZO COMPETENZE ESISTENTI: Identifica e rinforza le strategie di coping che il pet già utilizza naturalmente, potenziandole e rendendole più efficaci',
  '5. INTRODUZIONE SFIDE GRADUATE: Presenta sfide progressivamente più impegnative solo quando il pet dimostra completa padronanza del livello precedente',
  '6. SVILUPPO AUTONOMIA: Gradualmente riduci il tuo supporto diretto, permettendo al pet di sviluppare indipendenza nella gestione dell''ansia',
  '7. GENERALIZZAZIONE COMPETENZE: Applica le competenze apprese in contesti sempre più vari per assicurare che la resilienza sia trasferibile a nuove situazioni'
],
tips = ARRAY[
  'Non avere mai fretta - la resilienza si costruisce nel tempo attraverso esperienze positive ripetute',
  'Mantieni un registro dettagliato dei progressi per motivare te e il pet',
  'Usa rinforzi significativi per il pet, non necessariamente cibo - può essere gioco, attenzione, libertà',
  'Se c''è una ricaduta, torna al livello precedente senza giudizio e ricostruisci gradualmente'
],
success_criteria = ARRAY[
  'Il pet affronta situazioni precedentemente ansiogene con maggiore calma',
  'Recupero più rapido da situazioni stressanti inaspettate',
  'Dimostrazione di strategie di coping spontanee in nuove situazioni',
  'Aumento generale della fiducia in se stesso e dell''ottimismo comportamentale'
],
objectives = ARRAY[
  'Sviluppare capacità adattive durature che vadano oltre il protocollo specifico',
  'Aumentare la soglia di tolleranza allo stress attraverso esposizioni positive',
  'Creare un senso di auto-efficacia e fiducia nelle proprie capacità',
  'Prevenire lo sviluppo di nuove ansie attraverso resilienza generalizzata'
]
WHERE title = 'Costruzione Resilienza' AND protocol_id IN (
  SELECT id FROM public.ai_training_protocols 
  WHERE title ILIKE '%gestione%ansia%'
);

-- Piano Prevenzione Ricadute
UPDATE public.ai_training_exercises 
SET instructions = ARRAY[
  '1. IDENTIFICAZIONE TRIGGER RESIDUI: Mappa accuratamente tutti i trigger che ancora causano ansia al pet, anche se in forma ridotta, per monitorarli attentamente',
  '2. SVILUPPO PIANO INTERVENTO PRECOCE: Crea un protocollo dettagliato di intervento ai primi segni di ricaduta, includendo azioni specifiche e tempistiche precise',
  '3. STABILIMENTO ROUTINE MANTENIMENTO: Integra permanentemente nella routine quotidiana le tecniche più efficaci per mantenere bassi i livelli di ansia di base',
  '4. COSTRUZIONE NETWORK SUPPORTO: Identifica persone di fiducia (familiari, veterinario, dog-sitter) che possano riconoscere i segni di ansia e applicare le strategie apprese',
  '5. CREAZIONE SISTEMA MONITORAGGIO: Stabilisci indicatori oggettivi per valutare il benessere del pet e programma check-up regolari del suo stato emotivo',
  '6. PIANIFICAZIONE AGGIORNAMENTI: Prevedi revisioni periodiche del piano per adattarlo ai cambiamenti di vita, età, ambiente e nuove sfide che potrebbero emergere',
  '7. PREPARAZIONE CONTINGENZE: Anticipa situazioni di stress prevedibili (traslochi, viaggi, visite veterinarie) e prepara strategie specifiche per ciascuna'
],
tips = ARRAY[
  'Il mantenimento richiede meno intensità ma più costanza rispetto alla fase di trattamento iniziale',
  'Coinvolgi tutta la famiglia nel piano di prevenzione per garantire coerenza',
  'Mantieni aggiornato il diario del pet per identificare tempestivamente cambiamenti',
  'Non abbassare mai completamente la guardia - la prevenzione è sempre più facile della cura'
],
success_criteria = ARRAY[
  'Assenza di ricadute significative per periodi prolungati (3-6 mesi)',
  'Riconoscimento precoce e gestione efficace di eventuali episodi minori',
  'Mantenimento delle competenze acquisite nel tempo senza deterioramento',
  'Adattamento efficace a nuove situazioni stressanti utilizzando le strategie apprese'
],
objectives = ARRAY[
  'Consolidare permanentemente i miglioramenti ottenuti durante il protocollo',
  'Prevenire ricadute attraverso monitoraggio proattivo e intervento precoce',
  'Creare un sistema di supporto duraturo per il benessere emotivo del pet',
  'Garantire che il pet mantenga la qualità di vita raggiunta'
]
WHERE title = 'Piano Prevenzione Ricadute' AND protocol_id IN (
  SELECT id FROM public.ai_training_protocols 
  WHERE title ILIKE '%gestione%ansia%'
);