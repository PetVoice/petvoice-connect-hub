-- Crea il protocollo "Superare Fobie e Paure Specifiche" (10 giorni, 30 esercizi) - VALORI CORRETTI
WITH new_protocol AS (
  INSERT INTO ai_training_protocols (
    title, description, category, difficulty, duration_days, 
    target_behavior, triggers, required_materials, 
    current_day, progress_percentage, status, success_rate, 
    ai_generated, is_public, veterinary_approved, 
    community_rating, community_usage, mentor_recommended, 
    notifications_enabled, last_activity_at, user_id
  ) VALUES (
    'Superare Fobie e Paure Specifiche',
    'Programma avanzato di desensibilizzazione sistematica per superare fobie intense di rumori, oggetti e situazioni specifiche attraverso tecniche scientifiche graduali',
    'comportamento',
    'difficile',
    10,
    'Desensibilizzazione a fobie specifiche',
    ARRAY['aspirapolvere', 'temporali', 'rumori forti', 'oggetti specifici', 'situazioni scatenanti'],
    ARRAY['registrazioni audio', 'oggetti trigger', 'snack alto valore', 'safe space', 'clicker'],
    1,
    0,
    'available',
    0,
    true,
    true,
    false,
    0,
    0,
    false,
    true,
    now(),
    NULL
  ) RETURNING id
)
-- Inserisce tutti i 30 esercizi (10 giorni x 3 esercizi) con effectiveness_score corretto 1-10
INSERT INTO ai_training_exercises (
  protocol_id, title, description, exercise_type, day_number, 
  duration_minutes, instructions, materials, effectiveness_score
)
SELECT 
  new_protocol.id,
  exercises.title,
  exercises.description,
  exercises.exercise_type,
  exercises.day_number,
  exercises.duration_minutes,
  exercises.instructions,
  exercises.materials,
  exercises.effectiveness_score
FROM new_protocol,
(VALUES
  -- GIORNO 1: Assessment Trigger e Prima Esposizione
  ('Identificazione Trigger Primario', 'Valutazione dettagliata delle reazioni specifiche dell''animale ai trigger identificati, creando un profilo comportamentale di base per personalizzare il percorso', 'behavioral', 1, 8, 
   ARRAY['Osserva l''animale in stato neutrale per 2 minuti', 'Presenta il trigger a distanza massima (minimo 5 metri)', 'Registra intensità reazione su scala 1-10', 'Identifica segnali precursori (postura, respirazione)', 'Determina soglia di comfort - distanza minima senza reazione', 'Documenta durata del recovery post-esposizione'],
   ARRAY['trigger specifico', 'metro', 'cronometro', 'scheda valutazione'], 8),
   
  ('Creazione Safe Space Personalizzato', 'Allestimento di uno spazio sicuro dove l''animale può ritirarsi e rilassarsi, fondamentale per il successo della desensibilizzazione', 'behavioral', 1, 10,
   ARRAY['Identifica zona preferita dell''animale per rilassamento', 'Posiziona cuccia/coperta confortevole', 'Aggiungi oggetti calmanti (giochi preferiti, feromoni)', 'Testa efficacia: animale deve rilassarsi entro 3 minuti', 'Elimina fonti di stress dalla zona', 'Rinforza positivamente l''uso dello spazio'],
   ARRAY['cuccia comoda', 'coperte', 'giochi calmanti', 'feromoni', 'snack'], 9),
   
  ('Baseline Comportamentale', 'Registrazione dettagliata dei comportamenti normali per identificare cambiamenti durante il protocollo di desensibilizzazione', 'behavioral', 1, 12,
   ARRAY['Filma 10 minuti di comportamento normale', 'Registra frequenza respiratoria a riposo', 'Nota posture corporee tipiche', 'Documenta interazioni sociali standard', 'Registra appetito e interesse per snack', 'Crea mappa comportamentale pre-trattamento'],
   ARRAY['videocamera', 'cronometro', 'scheda comportamenti', 'snack test'], 8),

  -- GIORNO 2: Micro-Esposizioni Controllate
  ('Micro-Esposizione Audio', 'Introduzione graduale al suono trigger a volume minimo per iniziare la desensibilizzazione senza causare stress eccessivo', 'behavioral', 2, 5,
   ARRAY['Riproduci audio trigger a volume 5% per 3 secondi', 'Osserva reazione: se neutra, premiare immediatamente', 'Se mostra stress, interrompi e riduci volume', 'Pausa di 2 minuti tra esposizioni', 'Massimo 5 esposizioni per sessione', 'Termina sempre con esperienza positiva'],
   ARRAY['registrazione audio', 'altoparlante', 'snack alto valore', 'cronometro'], 7),
   
  ('Desensibilizzazione Visiva Distanza', 'Esposizione visiva al trigger mantenendo distanza sicura per ridurre l''associazione negativa', 'behavioral', 2, 8,
   ARRAY['Mostra trigger a 8-10 metri di distanza', 'Mantieni esposizione per 5 secondi se l''animale rimane calmo', 'Usa snack per creare associazione positiva', 'Se mostra stress, aumenta distanza', 'Ripeti 4-6 volte con pause di rinforzo', 'Monitora linguaggio corporeo costantemente'],
   ARRAY['trigger fisico', 'snack premium', 'metro', 'guinzaglio lungo'], 8),
   
  ('Tecniche Rilassamento Base', 'Insegnamento di tecniche di autoregolazione che l''animale potrà usare durante le esposizioni future', 'behavioral', 2, 10,
   ARRAY['Insegna comando "relax" con posizione sdraiata', 'Pratica respirazione profonda con massaggi', 'Rinforza stati calmi con premi speciali', 'Alterna 2 minuti attività con 3 minuti relax', 'Associa comando vocale a stato di calma', 'Testa efficacia del comando in situazioni neutre'],
   ARRAY['snack speciali', 'tappetino', 'timer', 'ambiente tranquillo'], 8),

  -- GIORNO 3: Consolidamento Assessment
  ('Valutazione Progressi Iniziali', 'Misurazione dei miglioramenti ottenuti nei primi giorni per aggiustare il protocollo alle esigenze specifiche', 'behavioral', 3, 8,
   ARRAY['Ripeti test baseline con stessi parametri', 'Confronta reazioni attuali con giorno 1', 'Documenta miglioramenti anche minimi', 'Identifica aree che necessitano maggior lavoro', 'Aggiusta intensità per prossima fase', 'Celebra ogni progresso con rinforzi speciali'],
   ARRAY['schede confronto', 'cronometro', 'snack celebrazione', 'videocamera'], 8),
   
  ('Rinforzo Associazioni Positive', 'Consolidamento delle prime associazioni positive create per rafforzare la base per la desensibilizzazione avanzata', 'behavioral', 3, 10,
   ARRAY['Presenta trigger + snack simultaneamente a distanza sicura', 'Aumenta valore del rinforzo (cibo speciale, gioco)', 'Varia il timing: trigger→premio, premio→trigger', 'Osserva cambiamenti nell''atteggiamento verso trigger', 'Documenta primi segni di curiosità vs paura', 'Termina quando l''animale cerca attivamente il trigger'],
   ARRAY['trigger', 'snack ultra-premium', 'giochi favoriti', 'cronometro'], 9),
   
  ('Test Generalizzazione Iniziale', 'Verifica se i miglioramenti si estendono a contesti leggermente diversi dallo spazio di training', 'behavioral', 3, 12,
   ARRAY['Cambia location mantenendo setup simile', 'Presenta trigger con stesse modalità ma ambiente diverso', 'Osserva se competenze apprese si trasferiscono', 'Rinforza comportamenti calmi nel nuovo ambiente', 'Documenta differenze di reazione per ambiente', 'Identifica elementi ambientali che facilitano/ostacolano'],
   ARRAY['trigger', 'snack', 'secondo ambiente', 'scheda osservazioni'], 7),

  -- GIORNO 4: Desensibilizzazione Sistematica - Fase Iniziale
  ('Scala Intensità Graduale Audio', 'Aumento sistematico del volume audio seguendo la risposta dell''animale per progredire senza regressioni', 'behavioral', 4, 8,
   ARRAY['Inizia da volume 8% se giorno precedente ok al 5%', 'Aumenta 2-3% solo se animale rimane calmo', 'Se mostra stress, riduci al livello precedente', 'Mantieni esposizioni brevi (3-5 secondi)', 'Premia immediatamente ogni successo', 'Documenta volume massimo raggiunto'],
   ARRAY['audio registrato', 'sistema audio con controllo volume', 'snack', 'scheda progressi'], 8),
   
  ('Riduzione Distanza Controllata', 'Diminuzione graduale della distanza dal trigger visivo mantenendo il comfort dell''animale', 'behavioral', 4, 10,
   ARRAY['Riduci distanza di 1 metro se animale calmo a distanza precedente', 'Mantieni trigger visibile per 10 secondi', 'Osserva segnali di stress: ansito, rigidità, sguardo fisso', 'Se stress, torna a distanza precedente', 'Combina vista trigger con snack speciali', 'Target: raggiungere 6-7 metri mantenendo calma'],
   ARRAY['trigger fisico', 'metro', 'snack alto valore', 'guinzaglio'], 8),
   
  ('Counter-Conditioning Livello 1', 'Creazione di associazioni positive dirette tra presenza del trigger e esperienze piacevoli', 'behavioral', 4, 12,
   ARRAY['Trigger appare → snack immediato (entro 1 secondo)', 'Ripeti 8-10 volte per sessione', 'Varia tipo di rinforzo: cibo, gioco, coccole', 'Osserva cambio nell''atteggiamento: anticipa il premio?', 'Se animale cerca trigger, rinforza massivamente', 'Interrompi se mostra saturazione o stress'],
   ARRAY['trigger', 'varietà snack premium', 'giochi', 'cronometro'], 9),

  -- GIORNO 5: Desensibilizzazione Sistematica - Sviluppo
  ('Combinazione Audio-Visiva Graduata', 'Integrazione di stimoli audio e visivi per una desensibilizzazione più completa e realistica', 'behavioral', 5, 10,
   ARRAY['Combina vista trigger (6m) + audio basso volume', 'Presenta simultaneamente per 5-8 secondi', 'Monitora reazione a stimoli multipli', 'Se tollerato, aumenta uno stimolo per volta', 'Mantieni l''altro costante durante cambiamenti', 'Documenta quale stimolo causa più stress'],
   ARRAY['trigger fisico', 'audio', 'altoparlante', 'snack', 'metro'], 8),
   
  ('Durata Esposizione Progressiva', 'Aumento graduale del tempo di esposizione per costruire tolleranza sostenuta', 'behavioral', 5, 8,
   ARRAY['Estendi esposizione da 5 a 8 secondi se animale calmo', 'Aumenta solo 2-3 secondi per volta', 'Rinforza durante l''esposizione, non solo alla fine', 'Se mostra stress, riduci durata immediata', 'Target: mantenere calma per 15 secondi continui', 'Termina sempre prima che l''animale si stanchi'],
   ARRAY['trigger', 'cronometro', 'snack continui', 'timer'], 8),
   
  ('Autocontrollo Durante Esposizione', 'Sviluppo di competenze di autoregolazione che l''animale può usare autonomamente', 'behavioral', 5, 12,
   ARRAY['Presenta trigger e aspetta che animale usi tecniche rilassamento', 'Non intervenire immediatamente se mostra lieve stress', 'Rinforza massivamente autocontrollo spontaneo', 'Usa comando "relax" solo se necessario', 'Osserva strategie che l''animale sviluppa autonomamente', 'Documenta tempi di recovery autogestiti'],
   ARRAY['trigger', 'ambiente controllato', 'snack speciali', 'cronometro'], 9),

  -- GIORNO 6: Desensibilizzazione Sistematica - Consolidamento
  ('Variazioni Trigger Realistiche', 'Esposizione a varianti del trigger per prevenire specificità eccessiva della desensibilizzazione', 'behavioral', 6, 10,
   ARRAY['Usa versioni diverse del trigger: volume, tono, durata', 'Per aspirapolvere: modelli diversi, rumori vari', 'Per temporali: intensità diverse, con/senza vento', 'Mantieni parametri di base ma varia dettagli', 'Osserva se reazioni cambiano con varianti', 'Rinforza generalizzazione delle competenze'],
   ARRAY['trigger multipli', 'registrazioni varie', 'snack', 'scheda varianti'], 8),
   
  ('Test Stress Moderato Controllato', 'Valutazione della resilienza sviluppata attraverso esposizione leggermente più intensa ma sicura', 'behavioral', 6, 8,
   ARRAY['Aumenta intensità trigger del 20% rispetto a livello comfort', 'Mantieni per 5 secondi max', 'Osserva strategie di coping dell''animale', 'Interrompi se stress eccessivo (ansito, tremori)', 'Rinforza qualsiasi tentativo di autocontrollo', 'Riduci sempre a livello comfort prima di terminare'],
   ARRAY['trigger', 'cronometro', 'snack recovery', 'ambiente sicuro'], 7),
   
  ('Rinforzo Intermittente Strategico', 'Transizione a rinforzo variabile per mantenere comportamenti senza dipendenza costante da premi', 'behavioral', 6, 12,
   ARRAY['Rinforza 7 su 10 esposizioni invece che tutte', 'Varia quale esposizione non viene rinforzata', 'Osserva se comportamento rimane stabile', 'Aumenta qualità premio quando lo dai', 'Mantieni rinforzo sociale (lodi) sempre', 'Target: animale mantiene calma anche senza premio immediato'],
   ARRAY['trigger', 'snack vari', 'cronometro', 'schema rinforzi'], 9),

  -- GIORNO 7: Counter-Conditioning Avanzato
  ('Associazioni Positive Complesse', 'Creazione di associazioni elaborate che vanno oltre il semplice cibo per includere attività piacevoli', 'behavioral', 7, 10,
   ARRAY['Trigger → attività preferita (gioco, coccole, esplorazione)', 'Varia attività per massimizzare associazioni positive', 'Permetti all''animale di scegliere il tipo di rinforzo', 'Osserva quale associazione è più potente', 'Combina trigger con routine positive esistenti', 'Documenta cambiamenti nell''atteggiamento generale'],
   ARRAY['trigger', 'giochi vari', 'spazi esplorazione', 'snack opzionali'], 9),
   
  ('Anticipazione Positiva', 'Sviluppo di eccitazione positiva alla presentazione del trigger invece di paura', 'behavioral', 7, 8,
   ARRAY['Mostra preparativi per trigger before presenting it', 'Osserva se animale mostra anticipo positivo', 'Rinforza massivamente segnali di eccitazione vs paura', 'Permetti all''animale di avvicinarsi autonomamente', 'Se si avvicina, jackpot di rinforzi', 'Documenta transizione da evitamento a ricerca'],
   ARRAY['trigger', 'setup visibile', 'snack jackpot', 'spazio libero'], 9),
   
  ('Choice-Based Exposure', 'Dare controllo all''animale sull''esposizione per aumentare senso di sicurezza e competenza', 'behavioral', 7, 12,
   ARRAY['Posiziona trigger accessibile ma non imposto', 'Permetti all''animale di decidere se/quando avvicinarsi', 'Rinforza qualsiasi movimento volontario verso trigger', 'Non forzare interazione, rispetta i tempi', 'Celebra ogni scelta coraggiosa', 'Osserva aumento di confidence e iniziativa'],
   ARRAY['trigger accessibile', 'ambiente libero', 'snack graduati', 'pazienza'], 9),

  -- GIORNO 8: Counter-Conditioning Consolidamento
  ('Rituali Positivi Pre-Trigger', 'Creazione di routine piacevoli che precedono l''esposizione per condizionare uno stato emotivo positivo', 'behavioral', 8, 10,
   ARRAY['Stabilisci sequenza: gioco preferito → trigger → super premio', 'Ripeti sequenza identica per creare prevedibilità', 'Osserva se animale anticipa positivamente trigger nella sequenza', 'Varia solo il premio finale mantenendo sequenza', 'Se animale cerca di saltare al trigger, jackpot!', 'Documenta riduzione latenza tra steps'],
   ARRAY['gioco preferito', 'trigger', 'super premi', 'cronometro'], 9),
   
  ('Trigger Come Predittore di Positività', 'Consolidamento del trigger come segnale che qualcosa di bello sta per accadere', 'behavioral', 8, 8,
   ARRAY['Trigger diventa "cue" per migliori esperienze della giornata', 'Timing: trigger → pausa 2 sec → evento fantastico', 'Varia eventi: pasto preferito, gioco, libertà, social', 'Osserva se animale cerca trigger per ottenere esperienze', 'Rinforza curiosità e investigazione del trigger', 'Target: trigger = segnale di cose belle in arrivo'],
   ARRAY['trigger', 'esperienze speciali varie', 'cronometro', 'ambienti vari'], 9),
   
  ('Consolidamento Emotivo', 'Stabilizzazione del nuovo stato emotivo positivo associato al trigger precedentemente temuto', 'behavioral', 8, 12,
   ARRAY['Test lunga esposizione: trigger presente 30+ secondi', 'Osserva: rimane calmo? Mostra segni positivi?', 'Permetti esplorazione libera del trigger se interessato', 'Documenta linguaggio corporeo: rilassato vs teso', 'Rinforza stati emotivi positivi vs neutrali', 'Celebra transizione completa da paura a curiosità/gioia'],
   ARRAY['trigger', 'ambiente rilassato', 'cronometro lungo', 'snack celebrazione'], 10),

  -- GIORNO 9: Confidence Building
  ('Sfide Graduate Autogestite', 'Presentazione di difficoltà progressive che l''animale può superare autonomamente per costruire fiducia', 'behavioral', 9, 10,
   ARRAY['Presenta trigger con leggere variazioni (più vicino, più forte)', 'Permetti all''animale di gestire la sfida autonomamente', 'Rinforza problem-solving e resilienza', 'Offri support solo se richiesto da animale', 'Celebra superamento di ogni micro-sfida', 'Documenta strategie che animale sviluppa'],
   ARRAY['trigger variabile', 'ambiente sicuro', 'rinforzi graduati', 'supporto discreto'], 8),
   
  ('Mastery Demonstration', 'Opportunità per l''animale di dimostrare completa padronanza del trigger precedentemente temuto', 'behavioral', 9, 8,
   ARRAY['Setup "show off": trigger presente, animale libero di interagire', 'Non dirigere comportamento, osserva scelte autonome', 'Rinforza confidence, curiosità, esplorazione volontaria', 'Se ignora trigger positivamente, è successo!', 'Se interagisce positivamente, jackpot massimo', 'Documenta livello di mastery raggiunto'],
   ARRAY['trigger', 'ambiente aperto', 'jackpot premi', 'videocamera per documentare'], 10),
   
  ('Leadership e Iniziativa', 'Incoraggiamento dell''animale a prendere iniziativa positiva in situazioni con trigger', 'behavioral', 9, 12,
   ARRAY['Inverti ruoli: segui dove animale guida vicino a trigger', 'Rinforza quando animale mostra leadership confident', 'Permetti decisioni su tempo, distanza, interazione', 'Celebra ogni iniziativa positiva verso ex-paura', 'Osserva se animale "insegna" ad altri la non-paura', 'Documenta trasformazione da follower ansioso a leader confident'],
   ARRAY['trigger', 'spazio libero', 'rinforzi leadership', 'altri animali opzionali'], 9),

  -- GIORNO 10: Generalizzazione e Mantenimento
  ('Test Ambienti Multipli', 'Verifica che le competenze acquisite funzionano in diversi contesti e situazioni', 'behavioral', 10, 10,
   ARRAY['Testa trigger in 3-4 ambienti diversi (casa, giardino, strada)', 'Varia condizioni: giorno/sera, solo/con altri, silenzio/rumore', 'Osserva se competenze si trasferiscono automaticamente', 'Rinforza adattamento a nuovi contesti', 'Documenta ambienti dove serve supporto extra', 'Target: competenza stabile in tutti contesti'],
   ARRAY['trigger portatile', 'accesso ambienti vari', 'snack da viaggio', 'scheda ambienti'], 8),
   
  ('Maintenance Protocol Setup', 'Creazione di un programma di mantenimento per prevenire regressioni future', 'behavioral', 10, 8,
   ARRAY['Stabilisci frequenza esposizioni mantenimento (2-3 volte/settimana)', 'Crea checklist comportamenti da monitorare', 'Identifica early warning signs di possibile regressione', 'Pianifica booster sessions se necessario', 'Documenta trigger level ottimale per maintenance', 'Crea piano emergenza per situazioni intense'],
   ARRAY['planning materials', 'schede monitoraggio', 'calendario', 'protocollo scritto'], 8),
   
  ('Celebrazione e Graduation', 'Riconoscimento formale del percorso completato e dei traguardi raggiunti dall''animale', 'behavioral', 10, 12,
   ARRAY['Organizza "graduation ceremony" con trigger presente in modo neutrale/positivo', 'Invita familiari/amici a vedere i progressi', 'Celebra con attività/cibi/esperienze super-speciali', 'Documenta before/after per memoria futura', 'Rinforza orgoglio e sense of accomplishment', 'Setup monitoraggio long-term per mantenere successi'],
   ARRAY['trigger', 'celebrazione speciale', 'documentazione', 'testimoni supportivi'], 10)
) AS exercises(title, description, exercise_type, day_number, duration_minutes, instructions, materials, effectiveness_score);