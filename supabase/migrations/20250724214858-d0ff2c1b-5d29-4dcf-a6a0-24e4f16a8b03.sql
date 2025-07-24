-- Completa aggiornamento esercizi "Riduzione dello Stress" - PARTE FINALE

-- Mindfulness Applicata
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. ATTENZIONE PRESENTE: CONCENTRATI completamente sul momento attuale senza distrazioni',
  '2. SENSAZIONI POSITIVE: FOCALIZZA l''attenzione del pet su stimoli piacevoli (profumi, texture)',
  '3. INTERRUZIONE PATTERN: Quando noti pensieri stressanti, REINDIRIZZA subito l''attenzione',
  '4. RESPIRAZIONE CONSAPEVOLE: MANTIENI il focus sul ritmo respiratorio condiviso',
  '5. OSSERVAZIONE NON-GIUDICANTE: ACCETTA le reazioni del pet senza forzare cambiamenti',
  '6. ANCORAGGIO SENSORIALE: USA oggetti specifici come punto di focus (palla, copertina)',
  '7. PRATICA QUOTIDIANA: DEDICA 15 minuti alla stessa ora ogni giorno',
  '8. ESTENSIONE GRADUALE: APPLICA mindfulness anche durante attività quotidiane'
],
updated_at = NOW()
WHERE title = 'Mindfulness Applicata' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Riduzione dello Stress'
);

-- Desensibilizzazione Trigger (esercizi con questo nome)
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. IDENTIFICAZIONE TRIGGER: LISTA tutti gli stimoli che causano stress al pet',
  '2. GERARCHIA INTENSITÀ: CLASSIFICA trigger da 1 (minimo) a 10 (massimo stress)',
  '3. ESPOSIZIONE GRADUALE: INIZIA dal trigger livello 1 a distanza sicura di 5 metri',
  '4. ASSOCIAZIONE POSITIVA: PRESENTA trigger insieme a qualcosa di MOLTO piacevole',
  '5. TEMPO CONTROLLATO: ESPOSIZIONE iniziale di soli 30 secondi, aumenta gradualmente',
  '6. DISTANZA VARIABILE: RIDUCI distanza dal trigger solo quando pet è completamente calmo',
  '7. SESSIONI BREVI: MAX 10 minuti per sessione per evitare sovraccarico',
  '8. RINFORZO IMMEDIATO: PREMIA comportamenti calmi entro 2 secondi dalla manifestazione'
],
updated_at = NOW()
WHERE title = 'Desensibilizzazione Trigger' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Riduzione dello Stress'
);

-- Tecniche Respirazione Avanzate
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. PATTERN 4-7-8: INSPIRA per 4 secondi, TRATTIENI per 7, ESPIRA per 8 secondi',
  '2. POSIZIONAMENTO STRATEGICO: SIEDITI accanto al pet con mano sul torace',
  '3. VISUALIZZAZIONE GUIDATA: IMMAGINA aria che entra come luce dorata calmante',
  '4. CONTROLLO DIAFRAMMATICO: RESPIRA con il diaframma, non solo con il torace',
  '5. SINCRONIZZAZIONE PERFETTA: ADATTA il tuo ritmo a quello naturale del pet',
  '6. AMBIENTE OTTIMALE: ARIA pulita, temperatura 21°C, umidità 50-60%',
  '7. DURATA PROGRESSIVA: INIZIA con 5 minuti, aumenta 30 secondi ogni sessione',
  '8. INTEGRAZIONE QUOTIDIANA: USA queste tecniche durante momenti di stress naturali'
],
updated_at = NOW()
WHERE title = 'Tecniche Respirazione Avanzate' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Riduzione dello Stress'
);

-- Costruzione Tolleranza Stress
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. MICRO-STRESS CONTROLLATI: INTRODUCI stress minimi come suono di campanello a volume basso',
  '2. TECNICHE COPING IMMEDIATE: INSEGNA al pet segnali specifici per richiedere aiuto',
  '3. RAFFORZAMENTO RESILIENZA: AUMENTA gradualmente intensità stress del 5% ogni successo',
  '4. RECOVERY RAPIDO: APPLICA tecniche di rilassamento immediatamente dopo ogni sfida',
  '5. MONITORAGGIO COSTANTE: OSSERVA battito cardiaco, respiro, postura durante stress',
  '6. BREAK FORZATI: STOP immediato se stress supera livello 6 su scala 1-10',
  '7. RINFORZO POST-STRESS: PREMIA abbondantemente ogni gestione positiva dello stress',
  '8. GENERALIZZAZIONE: APPLICA tecniche apprese a nuovi contesti gradualmente'
],
updated_at = NOW()
WHERE title = 'Costruzione Tolleranza Stress' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Riduzione dello Stress'
);

-- Rilassamento Profondo Guidato
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. PREPARAZIONE TOTALE: ELIMINA ogni distrazione, telefono spento, ambiente silenzioso',
  '2. MUSICA SPECIFICA: USA frequenze 528Hz o musica binaurale per rilassamento profondo',
  '3. GUIDA VOCALE: PARLA con voce monotona e rilassante, volume appena udibile',
  '4. PROGRESSIONE SISTEMATICA: RILASSA ogni parte del corpo in sequenza specifica',
  '5. SUGGESTIONI POSITIVE: RIPETI affermazioni calmanti "sei al sicuro, sei amato"',
  '6. DURATA ESTESA: MANTIENI lo stato per 45 minuti completi',
  '7. TRANSIZIONE LENTA: RITORNO graduale alla normalità in 10 minuti',
  '8. CONSOLIDAMENTO: RIPETI keywords calmanti durante il giorno per trigger memory'
],
updated_at = NOW()
WHERE title = 'Rilassamento Profondo Guidato' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Riduzione dello Stress'
);

-- Gestione Ansia Anticipatoria
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. RICONOSCIMENTO SEGNALI: IDENTIFICA primi segni di ansia anticipatoria (respiro, postura)',
  '2. INTERVENTO PRECOCE: APPLICA tecniche calmanti PRIMA che ansia diventi intensa',
  '3. DISTRAZIONE ATTIVA: REINDIRIZZA attenzione su attività piacevoli e coinvolgenti',
  '4. RISTRUTTURAZIONE COGNITIVA: CAMBIA associazioni negative con esperienze positive',
  '5. PREPARAZIONE SCENARI: SIMULA situazioni future in ambiente controllato e sicuro',
  '6. RINFORZO CALMA: PREMIA stati di calma durante preparazione eventi futuri',
  '7. ROUTINE PRE-EVENTO: STABILISCI rituali fissi prima di situazioni potenzialmente stressanti',
  '8. MONITORAGGIO CONTINUO: REGISTRA triggers e sviluppa strategie specifiche per ognuno'
],
updated_at = NOW()
WHERE title = 'Gestione Ansia Anticipatoria' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Riduzione dello Stress'
);

-- Test Resilienza Stress
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. TEST STANDARDIZZATI: USA scale validate per misurare livelli di stress baseline',
  '2. MISURAZIONE FISIOLOGICA: MONITORA frequenza cardiaca, respirazione, temperatura',
  '3. CHALLENGE GRADUALI: PRESENTA stress crescenti e misura capacità di recovery',
  '4. TRACKING CONTINUO: DOCUMENTA ogni risposta e tempo di ritorno alla normalità',
  '5. CONFRONTO DATI: COMPARA risultati con baseline iniziale per validare progressi',
  '6. SOGLIE SICUREZZA: STABILISCI limiti massimi di stress tollerabile per il pet',
  '7. VALIDAZIONE ESTERNA: COINVOLGI veterinario comportamentalista per validazione',
  '8. PIANO ADATTAMENTO: MODIFICA protocollo basandoti sui risultati dei test'
],
updated_at = NOW()
WHERE title = 'Test Resilienza Stress' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Riduzione dello Stress'
);