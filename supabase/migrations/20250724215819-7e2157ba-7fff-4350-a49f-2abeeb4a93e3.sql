-- Aggiorna tutti gli esercizi del protocollo "Gestire l'Irritabilità" con istruzioni dettagliate

-- Riconoscimento Trigger
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. OSSERVAZIONE ATTENTA: MONITORA comportamenti e situazioni che precedono episodi irritabilità',
  '2. DIARIO TRIGGER: ANNOTA orari, luoghi e circostanze specifiche degli episodi di tensione',
  '3. SEGNALI PRECOCI: IDENTIFICA i primi segni fisici di agitazione (respirazione, postura, sguardo)',
  '4. PATTERN RICORRENTI: RICONOSCI situazioni che sistematicamente causano reazioni negative',
  '5. SOGLIA TOLLERANZA: DETERMINA livello di stimoli oltre cui il pet diventa irritabile',
  '6. FATTORI ESTERNI: ELENCA elementi ambientali che influenzano umore (rumore, folla, caldo)',
  '7. TIMING CRITICO: MAPRA momenti della giornata quando irritabilità è più probabile',
  '8. COLLEGAMENTO EMOTIVO: COMPRENDI link tra stato emotivo del pet e reazioni aggressive'
],
updated_at = NOW()
WHERE title = 'Riconoscimento Trigger' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Gestire l''Irritabilità'
);

-- Tecniche di Calma
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. RESPIRAZIONE GUIDATA: INSEGNA tecniche di respirazione profonda attraverso esempio calmo',
  '2. COMANDO STOP: STABILISCI segnale chiaro per fermare comportamento irritabile immediatamente',
  '3. DISTRAZIONE POSITIVA: REDIRECT attenzione verso attività piacevoli quando tensione sale',
  '4. ZONA SICURA: CREA spazio tranquillo dove pet può ritirarsi quando si sente sopraffatto',
  '5. MASSAGGIO RILASSANTE: APPLICA tocco gentile su zone che favoriscono rilassamento muscolare',
  '6. MUSICA CALMANTE: UTILIZZA suoni specifici che hanno effetto sedativo sul sistema nervoso',
  '7. AROMATERAPIA NATURALE: INTRODUCE profumi rilassanti che riducono stress e agitazione',
  '8. VISUALIZZAZIONE POSITIVA: GUIDA pet verso immagini mentali piacevoli e rassicuranti'
],
updated_at = NOW()
WHERE title = 'Tecniche di Calma' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Gestire l''Irritabilità'
);

-- Gestione dell'Ambiente
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. RIDUZIONE STIMOLI: MINIMIZZA rumori, luci eccessive e movimenti che causano agitazione',
  '2. SPAZI ORGANIZZATI: MANTIENI ambiente ordinato e prevedibile per ridurre confusione',
  '3. ROUTINE STABILE: STABILISCI orari fissi per pasti, passeggiate e attività quotidiane',
  '4. CONTROLLO TEMPERATURA: ASSICURA comfort termico ottimale per evitare stress fisico',
  '5. ILLUMINAZIONE ADEGUATA: REGOLA luce naturale e artificiale per creare atmosfera serena',
  '6. MATERIALI CONFORTEVOLI: FORNISCI superfici morbide e familiari dove pet si sente sicuro',
  '7. SEPARAZIONE CONFLITTI: RIMUOVI o gestisci presenza di altri pet/persone che creano tensione',
  '8. ACCESSIBILITÀ RISORSE: GARANTISCI facile accesso a cibo, acqua e aree di riposo'
],
updated_at = NOW()
WHERE title = 'Gestione dell\'Ambiente' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Gestire l''Irritabilità'
);

-- Rinforzo Positivo
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. TIMING PERFETTO: PREMIA immediatamente comportamenti calmi e autocontrollo dimostrato',
  '2. RICOMPENSE GRADUATE: USA rinforzi di valore crescente per comportamenti sempre più difficili',
  '3. VARIAZIONE PREMI: ALTERNA cibo, gioco, coccole per mantenere alta motivazione',
  '4. RICONOSCIMENTO VERBALE: CELEBRA con entusiasmo ogni piccolo progresso verso calma',
  '5. IGNORARE NEGATIVITÀ: NON dare attenzione a comportamenti irritabili per estinguerli',
  '6. COERENZA FAMILIARE: ASSICURA che tutti in casa applichino stesso sistema di rinforzi',
  '7. PROGRESSIONE GRADUALE: AUMENTA difficoltà situazioni dove pet deve mantenere calma',
  '8. REGISTRO SUCCESSI: DOCUMENTA miglioramenti per motivare e tracciare progresso'
],
updated_at = NOW()
WHERE title = 'Rinforzo Positivo' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Gestire l''Irritabilità'
);

-- Desensibilizzazione
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. ESPOSIZIONE GRADUALE: INTRODUCE trigger di irritabilità a intensità molto bassa inizialmente',
  '2. CONTROLLO DISTANZA: MANTIENI pet sufficientemente lontano da stimoli per evitare reazione',
  '3. ASSOCIAZIONE POSITIVA: ABBINA presenza di trigger a esperienze piacevoli e ricompense',
  '4. INCREMENTO LENTO: AUMENTA intensità o durata esposizione solo dopo successo completo',
  '5. SOGLIA COMFORT: RISPETTA sempre livello di tolleranza attuale senza forzare progresso',
  '6. SESSIONI BREVI: LIMITA allenamento a periodi corti per evitare sovraccarico emotivo',
  '7. PAUSA RECUPERO: CONCEDI tempo tra sessioni per consolidare apprendimento positivo',
  '8. MONITORAGGIO STRESS: INTERROMPI immediatamente se noti segni di stress eccessivo'
],
updated_at = NOW()
WHERE title = 'Desensibilizzazione' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Gestire l''Irritabilità'
);

-- Controllo Impulsi
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. COMANDO ASPETTA: INSEGNA a FERMARSI prima di reagire a stimoli scatenanti',
  '2. AUTOCONTROLLO PREMIATO: RICOMPENSA ogni momento di pausa e riflessione dimostrato',
  '3. DISTRAZIONE IMMEDIATA: REDIRECT energia negativa verso attività fisiche appropriate',
  '4. CONTA FINO A 10: CREA pausa temporale tra trigger e possibile reazione aggressiva',
  '5. SEGNALE STOP: STABILISCI gesto o parola che interrompe escalation di irritabilità',
  '6. ALTERNATIVE POSITIVE: OFFRI comportamenti sostitutivi per esprimere frustrazione in modo sano',
  '7. ESERCIZI STRUTTURATI: PRATICA autocontrollo attraverso giochi che richiedono pazienza',
  '8. MODELING CALMO: DIMOSTRA tu stesso controllo emotivo come esempio da imitare'
],
updated_at = NOW()
WHERE title = 'Controllo Impulsi' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Gestire l''Irritabilità'
);

-- Socializzazione Positiva
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. INCONTRI CONTROLLATI: ORGANIZZA interazioni sociali in ambiente sicuro e prevedibile',
  '2. PARTNER COMPATIBILI: SCEGLI altri pet/persone con personalità calme e pazienti',
  '3. SUPERVISIONE ATTENTA: MONITORA constantemente linguaggio corporeo durante interazioni',
  '4. INTERVENTO PREVENTIVO: INTERROMPI situazioni prima che escalation diventi problematica',
  '5. RICOMPENSE SOCIALI: PREMIA comportamenti amichevoli e cooperativi con altri',
  '6. SPAZI CONDIVISI: GRADUALMENTE introduce condivisione di risorse senza competizione',
  '7. GIOCO STRUTTURATO: FACILITA attività di gruppo che promuovono collaborazione positiva',
  '8. COMUNICAZIONE CHIARA: INSEGNA segnali calmi per comunicare disagio senza aggressività'
],
updated_at = NOW()
WHERE title = 'Socializzazione Positiva' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Gestire l''Irritabilità'
);

-- Monitoraggio Progressi
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. SCALA IRRITABILITÀ: VALUTA quotidianamente livello di irritabilità da 1 a 10',
  '2. FREQUENZA EPISODI: CONTA numero di episodi di irritabilità per settimana',
  '3. DURATA CONTROLLO: MISURA quanto tempo pet mantiene calma in situazioni difficili',
  '4. TRIGGER SUPERATI: ELENCA situazioni che prima causavano problemi ma ora gestisce bene',
  '5. STRATEGIE EFFICACI: IDENTIFICA tecniche di calma che funzionano meglio per il tuo pet',
  '6. MIGLIORAMENTI RELAZIONALI: DOCUMENTA progresso nelle interazioni con famiglia e altri pet',
  '7. AUTOCONTROLLO SPONTANEO: REGISTRA momenti dove pet si calma autonomamente senza aiuto',
  '8. BENESSERE GENERALE: VALUTA impatto della gestione irritabilità su qualità vita complessiva'
],
updated_at = NOW()
WHERE title = 'Monitoraggio Progressi' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Gestire l''Irritabilità'
);

-- Manutenzione Risultati
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. PRATICA COSTANTE: CONTINUA esercizi di autocontrollo anche dopo miglioramento evidente',
  '2. PREVENZIONE RICADUTE: MANTIENI strategie di gestione ambiente per evitare regressioni',
  '3. RINFORZI PERIODICI: RICOMPENSA sporadicamente comportamenti calmi per mantenerli stabili',
  '4. AGGIORNAMENTO STRATEGIE: ADATTA tecniche di calma all\'evoluzione e crescita del pet',
  '5. VIGILANZA CONTINUA: MONITORA periodicamente per cogliere primi segnali di ritorno irritabilità',
  '6. SUPPORTO SOCIALE: MANTIENI rete di persone/pet che favoriscono comportamenti equilibrati',
  '7. CONSOLIDAMENTO ABITUDINI: INTEGRA tecniche di gestione nella routine quotidiana normale',
  '8. CELEBRAZIONE SUCCESSI: RICONOSCI regolarmente quanto strada ha fatto il pet nel controllo emotivo'
],
updated_at = NOW()
WHERE title = 'Manutenzione Risultati' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Gestire l''Irritabilità'
);