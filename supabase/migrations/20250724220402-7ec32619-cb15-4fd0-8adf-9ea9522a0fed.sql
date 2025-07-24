-- Completa gli ultimi esercizi rimanenti per "Gestire l'Irritabilità"

-- Costruzione Fiducia
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. EVIDENZIA MIGLIORAMENTI: MOSTRA concretamente al pet tutti i progressi che ha fatto',
  '2. CELEBRA AUTOCONTROLLO: FESTEGGIA specificamente ogni momento di autogestione emotiva',
  '3. COSTRUISCI SU SUCCESSI: USA ogni piccolo successo come base per sfide leggermente maggiori',
  '4. AUMENTA SFIDE: GRADUALMENTE proponi situazioni più difficili ma sempre gestibili',
  '5. FIDUCIA RECIPROCA: DIMOSTRA che hai fiducia nelle capacità del pet di autocontrollarsi',
  '6. RICONOSCIMENTO PUBBLICO: CONDIVIDI successi del pet con famiglia per rinforzo sociale',
  '7. MEMORIA POSITIVA: RICORDA al pet i suoi successi passati quando affronta nuove sfide',
  '8. AUTOREALIZZAZIONE: AIUTA pet a riconoscere la propria crescita e capacità sviluppate'
],
updated_at = NOW()
WHERE title = 'Costruzione Fiducia' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Gestire l''Irritabilità'
);

-- Test di Resistenza
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. SITUAZIONI PROVOCATORIE: CREA scenari controllati che testano autocontrollo del pet',
  '2. MISURA DURATA: CRONOMETRA quanto tempo pet mantiene calma in situazioni difficili',
  '3. STRATEGIE SPONTANEE: OSSERVA quali tecniche pet usa naturalmente per autoregolarsi',
  '4. CELEBRA PROGRESSI: FESTEGGIA ogni miglioramento nella resistenza a provocazioni',
  '5. VARIAZIONE STIMOLI: TESTA resistenza con diversi tipi di trigger e intensità',
  '6. DOCUMENTAZIONE ACCURATA: REGISTRA dettagliatamente prestazioni per tracciare progresso',
  '7. SUPPORTO DISCRETO: FORNISCI incoraggiamento senza interferire con autogestione',
  '8. RICONOSCIMENTO CRESCITA: CONFRONTA prestazioni attuali con quelle iniziali del percorso'
],
updated_at = NOW()
WHERE title = 'Test di Resistenza' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Gestire l''Irritabilità'
);

-- Preparazione Sfide Future
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. IDENTIFICAZIONE TRIGGER: ANTICIPA potenziali situazioni irritanti che pet potrebbe incontrare',
  '2. PIANI CONTINGENZA: SVILUPPA strategie specifiche per diverse tipologie di sfide',
  '3. KIT SUPPORTO: PREPARA strumenti e risorse che pet può usare in momenti difficili',
  '4. RETE AIUTO: COSTRUISCI sistema di supporto di persone che capiscono bisogni del pet',
  '5. SIMULAZIONI PREVENTIVE: PRATICA gestione di situazioni difficili prima che accadano realmente',
  '6. SEGNALI ALLARME: STABILISCI indicatori precoci per riconoscere quando pet ha bisogno aiuto',
  '7. RISORSE IMMEDIATE: CREA accesso rapido a strategie calmanti in caso emergenza',
  '8. RESILIENZA PROATTIVA: SVILUPPA capacità di fronteggiare sfide impreviste con fiducia'
],
updated_at = NOW()
WHERE title = 'Preparazione Sfide Future' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Gestire l''Irritabilità'
);

-- Integrazione Sociale
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. DIVERSI TIPI INDIVIDUI: PRATICA interazioni con persone/animali di personalità diverse',
  '2. SITUAZIONI GRADUALI: INIZIA con contesti sociali semplici, aumenta complessità gradualmente',
  '3. SUPPORTO NAVIGAZIONE: AIUTA pet a comprendere dinamiche sociali complesse',
  '4. COMPORTAMENTI APPROPRIATI: RINFORZA specificamente azioni sociali positive e rispettose',
  '5. GESTIONE CONFLITTI: INSEGNA come gestire disaccordi senza escalation aggressiva',
  '6. COMUNICAZIONE SOCIALE: PRATICA segnali di pace e cooperazione in gruppo',
  '7. INCLUSIONE POSITIVA: FACILITA partecipazione attiva pet in attività di gruppo',
  '8. LEADERSHIP CALMA: SVILUPPA capacità di guida attraverso esempio pacifico non dominanza'
],
updated_at = NOW()
WHERE title = 'Integrazione Sociale' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Gestire l''Irritabilità'
);

-- Mantenimento Progressi
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. ROUTINE CONTROLLO: STABILISCI check quotidiani dello stato emotivo del pet',
  '2. CHECK-IN REGOLARI: MONITORA settimanalmente livelli di stress e autocontrollo',
  '3. PRATICA COSTANTE: MANTIENI esercizi di autoregolazione anche dopo miglioramento evidente',
  '4. ADATTAMENTO STRATEGIE: MODIFICA tecniche in base a cambiamenti ed evoluzione pet',
  '5. PREVENZIONE RICADUTE: RICONOSCI immediatamente segnali di possibile regressione',
  '6. RINFORZO PERIODICO: RICOMPENSA sporadicamente autocontrollo per mantenerlo stabile',
  '7. AGGIORNAMENTO SFIDE: INTRODUCE nuove situazioni per continuare crescita emotiva',
  '8. CELEBRAZIONE CONTINUA: RICONOSCI regolarmente i progressi mantenuti nel tempo'
],
updated_at = NOW()
WHERE title = 'Mantenimento Progressi' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Gestire l''Irritabilità'
);

-- Pianificazione Mantenimento (esercizio già aggiornato correttamente)
-- Non serve aggiornare, ha già istruzioni dettagliate

-- Valutazione Complessiva
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. CONFRONTO INIZIALE: DOCUMENTA differenze EVIDENTI tra comportamento del giorno 1 vs oggi',
  '2. TEST SITUAZIONI: VERIFICA gestione in situazioni che precedentemente causavano problemi',
  '3. STRATEGIE EFFICACI: IDENTIFICA e documenta tecniche di autocontrollo più funzionali',
  '4. CELEBRAZIONE TRASFORMAZIONE: RICONOSCI e festeggia completamente la metamorfosi avvenuta',
  '5. CRESCITA AUTONOMIA: MISURA capacità di autoregolazione senza supporto esterno',
  '6. IMPATTO RELAZIONALE: VALUTA miglioramenti nelle relazioni con famiglia e altri pet',
  '7. RESILIENZA SVILUPPATA: TESTA capacità di recupero rapido da situazioni stressanti',
  '8. FUTURO OTTIMISTA: PIANIFICA mantenimento progressi e ulteriore crescita emotiva'
],
updated_at = NOW()
WHERE title = 'Valutazione Complessiva' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Gestire l''Irritabilità'
);

-- Proiezione Crescita Futura
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. OBIETTIVI CRESCITA: DEFINISCI mete specifiche per ulteriore sviluppo emotivo del pet',
  '2. NUOVE SFIDE: PIANIFICA situazioni progressivamente più complesse per crescita continua',
  '3. COMPETENZE AVANZATE: SVILUPPA abilità di autoregolazione più sofisticate e raffinate',
  '4. MOMENTUM POSITIVO: MANTIENI direzione di crescita per evitare stagnazione',
  '5. LEADERSHIP EMOTIVA: SVILUPPA capacità pet di aiutare altri animali in difficoltà',
  '6. ADATTABILITÀ: COSTRUISCI flessibilità per gestire situazioni impreviste future',
  '7. AUTOREALIZZAZIONE: FACILITA riconoscimento del pet delle proprie capacità uniche',
  '8. IMPATTO POSITIVO: CANALIZZA crescita emotiva verso contributo positivo in famiglia/comunità'
],
updated_at = NOW()
WHERE title = 'Proiezione Crescita Futura' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Gestire l''Irritabilità'
);