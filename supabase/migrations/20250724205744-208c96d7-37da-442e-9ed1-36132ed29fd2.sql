-- Aggiorna esercizi "Gestione dell'Ansia" con istruzioni dettagliate

-- Assessment Livelli Ansia
UPDATE public.ai_training_exercises 
SET instructions = ARRAY[
  '1. PREPARAZIONE OSSERVAZIONE: Prepara un ambiente neutro per l''osservazione e raccogli tutti i materiali necessari (scala ansia, checklist sintomi, diario)',
  '2. IDENTIFICAZIONE TRIGGER: Esponi gradualmente il pet a diversi stimoli potenzialmente scatenanti (rumori, oggetti, situazioni) e documenta le sue reazioni',
  '3. MISURAZIONE INTENSITÀ: Utilizza una scala da 1-10 per valutare l''intensità delle reazioni ansiose, considerando sintomi comportamentali e fisici',
  '4. DOCUMENTAZIONE SINTOMI FISICI: Registra tutti i segni fisici di ansia (tremori, ansimare, dilatazione pupille, rigidità muscolare, perdita controllo)',
  '5. REGISTRAZIONE COMPORTAMENTALE: Annota comportamenti specifici come nascondersi, aggressività, vocalizzazioni eccessive, comportamenti compulsivi',
  '6. STABILIMENTO BASELINE: Crea un profilo completo dello stato ansioso attuale del pet includendo frequenza, durata e intensità degli episodi',
  '7. PIANIFICAZIONE INTERVENTO: Analizza i dati raccolti per identificare priorità di intervento e creare un piano terapeutico personalizzato'
],
tips = ARRAY[
  'Mantieni un atteggiamento calmo e neutro durante l''assessment per non influenzare le reazioni',
  'Documenta tutto immediatamente per non perdere dettagli importanti',
  'Non forzare l''esposizione ai trigger se il pet mostra stress eccessivo',
  'Considera fattori ambientali che potrebbero influenzare i risultati'
],
success_criteria = ARRAY[
  'Identificazione accurata di almeno 3-5 trigger specifici dell''ansia',
  'Documentazione completa dei pattern comportamentali ansiosi',
  'Creazione di una baseline affidabile per misurare i progressi futuri',
  'Piano di intervento personalizzato basato sui dati raccolti'
],
objectives = ARRAY[
  'Creare una mappa completa dei trigger e delle reazioni ansiose',
  'Stabilire parametri oggettivi per monitorare i progressi',
  'Identificare le aree prioritarie per l''intervento terapeutico',
  'Fornire una base scientifica per la pianificazione del trattamento'
]
WHERE title = 'Assessment Livelli Ansia' AND protocol_id IN (
  SELECT id FROM public.ai_training_protocols 
  WHERE title ILIKE '%gestione%ansia%'
);

-- Zona Sicura Personalizzata
UPDATE public.ai_training_exercises 
SET instructions = ARRAY[
  '1. SELEZIONE UBICAZIONE: Scegli un angolo tranquillo della casa, lontano da traffico e rumori, preferibilmente con buona visuale ma possibilità di ritiro',
  '2. PREPARAZIONE BASE COMFORT: Posiziona la cuccia o coperta preferita del pet, assicurandoti che sia in ottime condizioni e profumi di casa',
  '3. AGGIUNTA ELEMENTO FAMILIARE: Includi un capo di abbigliamento che profuma intensamente di te per creare associazione di sicurezza e presenza',
  '4. ALLESTIMENTO RISORSE: Metti a disposizione acqua fresca sempre disponibile e eventualmente il giocattolo più caro al pet',
  '5. INTRODUZIONE GUIDATA: Accompagna il pet nella zona, resta con lui alcuni minuti dimostrando che è un luogo positivo e sicuro',
  '6. RINFORZO POSITIVO ATTIVO: Ogni volta che il pet utilizza spontaneamente la zona, fornisci rinforzi positivi (carezze, parole dolci, piccoli premi)',
  '7. MANTENIMENTO E RISPETTO: Stabilisci che quella zona è sacra - nessuno deve disturbare il pet quando si trova lì, è il suo rifugio assoluto'
],
tips = ARRAY[
  'Non forzare mai l''utilizzo della zona - deve essere una scelta volontaria del pet',
  'Mantieni la zona sempre pulita e accogliente',
  'Evita di usare quella zona per attività che il pet potrebbe percepire come negative',
  'Rispetta sempre quando il pet si rifugia lì - è il suo momento di autoregolazione'
],
success_criteria = ARRAY[
  'Il pet utilizza spontaneamente la zona sicura quando si sente stressato',
  'Riduzione visibile dei livelli di ansia quando si trova nella zona',
  'Il pet rimane rilassato nella zona per periodi progressivamente più lunghi',
  'Generalizzazione del senso di sicurezza anche in altre aree della casa'
],
objectives = ARRAY[
  'Creare un rifugio sicuro sempre disponibile per l''autoregolazione',
  'Insegnare al pet che ha controllo sul proprio ambiente',
  'Fornire uno strumento di coping per momenti di stress acuto',
  'Rafforzare il senso di sicurezza e appartenenza in casa'
]
WHERE title = 'Zona Sicura Personalizzata' AND protocol_id IN (
  SELECT id FROM public.ai_training_protocols 
  WHERE title ILIKE '%gestione%ansia%'
);