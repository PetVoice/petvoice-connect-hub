-- Aggiorna TUTTI gli esercizi del protocollo "Chiarezza Mentale" indipendentemente dall'ID del protocollo

-- Orientamento Spaziale
UPDATE ai_training_exercises 
SET 
  objectives = ARRAY[
    'Creare associazione positiva con lo spazio',
    'Stabilire punti di riferimento chiari',
    'Ridurre confusione spaziale',
    'Aumentare fiducia nel movimento'
  ],
  success_criteria = ARRAY[
    'Si orienta spontaneamente usando i percorsi',
    'Riconosce e utilizza i segnali visivi',
    'Mostra sicurezza nel movimento',
    'Riduce comportamenti di esitazione'
  ],
  tips = ARRAY[
    'Inizia sempre dallo stesso punto di partenza per creare familiarità',
    'Usa nastri colorati o coni per marcare chiaramente i percorsi',
    'Premia ogni movimento corretto lungo il percorso, non solo alla fine',
    'Se mostra confusione, torna al punto di partenza e ricomincia lentamente'
  ],
  level = 'facile',
  description = 'Aiuta il pet a sviluppare sicurezza spaziale attraverso percorsi marcati e segnali visivi chiari. Questo esercizio stabilisce punti di riferimento fissi che riducono la confusione e aumentano la fiducia nei movimenti.'
WHERE title = 'Orientamento Spaziale' 
  AND protocol_id IN (
    SELECT id FROM ai_training_protocols WHERE title = 'Chiarezza Mentale'
  );

-- Routine Semplificata
UPDATE ai_training_exercises 
SET 
  objectives = ARRAY[
    'Stabilire prevedibilità quotidiana',
    'Ridurre ansia da incertezza',
    'Creare sicurezza attraverso ripetizione',
    'Migliorare benessere generale'
  ],
  success_criteria = ARRAY[
    'Anticipa correttamente le attività della routine',
    'Mostra rilassamento durante le sequenze familiari',
    'Reagisce positivamente agli orari stabiliti',
    'Diminuisce comportamenti ansiosi'
  ],
  tips = ARRAY[
    'Usa sempre lo stesso ordine: cibo, passeggiata, gioco, riposo',
    'Mantieni gli stessi orari anche nei weekend per consolidare la abitudine',
    'Se devi cambiare qualcosa, fallo gradualmente in 3-4 giorni',
    'Osserva i segnali di anticipazione: sono indicatori di successo'
  ],
  level = 'facile',
  description = 'Crea una struttura quotidiana prevedibile che fornisce sicurezza emotiva. La routine costante riduce la ansia da incertezza e aiuta il pet a sentirsi al sicuro nel proprio ambiente.'
WHERE title = 'Routine Semplificata' 
  AND protocol_id IN (
    SELECT id FROM ai_training_protocols WHERE title = 'Chiarezza Mentale'
  );

-- Rinforzo Positivo Immediato
UPDATE ai_training_exercises 
SET 
  objectives = ARRAY[
    'Stabilire connessioni comportamento-conseguenza',
    'Aumentare motivazione alla apprendimento',
    'Rafforzare comportamenti desiderati',
    'Migliorare comunicazione pet-proprietario'
  ],
  success_criteria = ARRAY[
    'Risponde immediatamente al rinforzo',
    'Ripete spontaneamente comportamenti premiati',
    'Mostra attenzione e concentrazione crescenti',
    'Stabilisce connessioni rapide azione-premio'
  ],
  tips = ARRAY[
    'Il timing è tutto: premia entro 3 secondi dal comportamento corretto',
    'Usa premi di alto valore che il pet trova irresistibili',
    'Varia il tipo di rinforzo: cibo, carezze, gioco, ma mantieni alta qualità',
    'Se sbagli il timing, non premiare - aspetta la prossima opportunità'
  ],
  level = 'intermedio',
  description = 'Insegna al pet connessioni chiare tra azioni e conseguenze positive. Il timing preciso del rinforzo è cruciale per sviluppare comprensione rapida e motivazione duratura.'
WHERE title = 'Rinforzo Positivo Immediato' 
  AND protocol_id IN (
    SELECT id FROM ai_training_protocols WHERE title = 'Chiarezza Mentale'
  );

-- Esercizi di Concentrazione
UPDATE ai_training_exercises 
SET 
  objectives = ARRAY[
    'Sviluppare capacità di attenzione sostenuta',
    'Migliorare focus su compiti specifici',
    'Ridurre distraibilità',
    'Aumentare durata delle attività'
  ],
  success_criteria = ARRAY[
    'Mantiene attenzione per la durata della esercizio',
    'Ignora distrazioni durante la attività',
    'Completa compiti semplici senza interruzioni',
    'Mostra interesse crescente per le attività'
  ],
  tips = ARRAY[
    'Inizia con sessioni di 2-3 minuti e aumenta gradualmente',
    'Elimina completamente rumori, odori e stimoli visivi distraenti',
    'Se perde concentrazione, richiama dolcemente e riprendi',
    'Finisci sempre con successo, anche se devi semplificare il compito'
  ],
  level = 'intermedio',
  description = 'Sviluppa la capacità di concentrazione attraverso esercizi progressivi in ambiente controllato. La attenzione sostenuta è fondamentale per la apprendimento e riduce la confusione mentale.'
WHERE title = 'Esercizi di Concentrazione' 
  AND protocol_id IN (
    SELECT id FROM ai_training_protocols WHERE title = 'Chiarezza Mentale'
  );

-- Training di Riconoscimento
UPDATE ai_training_exercises 
SET 
  objectives = ARRAY[
    'Rafforzare memoria e riconoscimento',
    'Migliorare capacità cognitive',
    'Aumentare sicurezza nel riconoscere il familiare',
    'Ridurre confusione da oggetti o persone'
  ],
  success_criteria = ARRAY[
    'Riconosce oggetti familiari immediatamente',
    'Reagisce positivamente a nomi e comandi noti',
    'Mostra preferenza per oggetti conosciuti',
    'Riduce tempo di esitazione nel riconoscimento'
  ],
  tips = ARRAY[
    'Usa sempre gli stessi oggetti ogni giorno per creare familiarità profonda',
    'Associa ogni oggetto con una parola specifica ripetuta chiaramente',
    'Premia non solo il riconoscimento corretto, ma anche i tentativi',
    'Se non riconosce, avvicina la oggetto e aiutalo con suggerimenti gestuali'
  ],
  level = 'facile',
  description = 'Rafforza le capacità di riconoscimento e memoria attraverso associazioni ripetute. Questo esercizio riduce la confusione cognitiva e aumenta la fiducia nel mondo familiare.'
WHERE title = 'Training di Riconoscimento' 
  AND protocol_id IN (
    SELECT id FROM ai_training_protocols WHERE title = 'Chiarezza Mentale'
  );

-- Stabilizzazione Emotiva
UPDATE ai_training_exercises 
SET 
  objectives = ARRAY[
    'Creare stato emotivo stabile',
    'Ridurre reazioni emotive eccessive',
    'Aumentare tranquillità generale',
    'Migliorare gestione stress'
  ],
  success_criteria = ARRAY[
    'Mantiene calma anche in situazioni nuove',
    'Reagisce con meno intensità agli stimoli',
    'Mostra postura rilassata più frequentemente',
    'Recupera velocemente da episodi di stress'
  ],
  tips = ARRAY[
    'Mantieni sempre un tono di voce calmo e rassicurante',
    'Evita movimenti bruschi che potrebbero aumentare agitazione',
    'Crea un ambiente il più prevedibile possibile',
    'Premia immediatamente ogni segno di calma e rilassamento'
  ],
  level = 'facile',
  description = 'Aiuta il pet a raggiungere e mantenere uno stato emotivo equilibrato attraverso tecniche di calma e rilassamento. Questo è fondamentale per ridurre confusione e ansia.'
WHERE title = 'Stabilizzazione Emotiva' 
  AND protocol_id IN (
    SELECT id FROM ai_training_protocols WHERE title = 'Chiarezza Mentale'
  );

-- Memoria a Breve Termine
UPDATE ai_training_exercises 
SET 
  objectives = ARRAY[
    'Potenziare memoria immediata',
    'Migliorare ritenzione informazioni',
    'Aumentare capacità di concentrazione',
    'Rafforzare connessioni neurali'
  ],
  success_criteria = ARRAY[
    'Ricorda dove è nascosto oggetto per tempi crescenti',
    'Mostra interesse attivo nella ricerca',
    'Completa il compito senza distrazioni eccessive',
    'Migliora progressivamente i tempi di ritenzione'
  ],
  tips = ARRAY[
    'Inizia con tempi di attesa molto brevi (5-10 secondi)',
    'Usa oggetti di grande interesse per il pet',
    'Aumenta il tempo gradualmente solo se ha successo',
    'Celebra ogni successo per mantenere alta la motivazione'
  ],
  level = 'intermedio',
  description = 'Esercizi specifici per rafforzare la memoria a breve termine attraverso giochi di ricerca e ritenzione. Fondamentale per migliorare le capacità cognitive generali.'
WHERE title = 'Memoria a Breve Termine' 
  AND protocol_id IN (
    SELECT id FROM ai_training_protocols WHERE title = 'Chiarezza Mentale'
  );

-- Aggiungi tutti gli altri esercizi che potrebbero essere presenti...