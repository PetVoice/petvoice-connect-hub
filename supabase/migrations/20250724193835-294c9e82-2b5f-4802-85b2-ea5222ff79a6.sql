-- Aggiungi colonne dettagliate alla tabella ai_training_exercises
ALTER TABLE ai_training_exercises 
ADD COLUMN objectives TEXT[],
ADD COLUMN success_criteria TEXT[],
ADD COLUMN tips TEXT[],
ADD COLUMN level TEXT DEFAULT 'intermedio';

-- Aggiorna gli esercizi esistenti con dati più dettagliati
-- Esempi per il protocollo "Chiarezza Mentale"

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
WHERE title = 'Orientamento Spaziale' AND protocol_id = '70b43079-91f9-48dc-9cf1-afe45eb07d3e';

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
    'Mantieni gli stessi orari anche nei weekend per consolidare l\'abitudine',
    'Se devi cambiare qualcosa, fallo gradualmente in 3-4 giorni',
    'Osserva i segnali di anticipazione: sono indicatori di successo'
  ],
  level = 'facile',
  description = 'Crea una struttura quotidiana prevedibile che fornisce sicurezza emotiva. La routine costante riduce l\'ansia da incertezza e aiuta il pet a sentirsi al sicuro nel proprio ambiente.'
WHERE title = 'Routine Semplificata' AND protocol_id = '70b43079-91f9-48dc-9cf1-afe45eb07d3e';

-- Rinforzo Positivo Immediato
UPDATE ai_training_exercises 
SET 
  objectives = ARRAY[
    'Stabilire connessioni comportamento-conseguenza',
    'Aumentare motivazione all\'apprendimento',
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
WHERE title = 'Rinforzo Positivo Immediato' AND protocol_id = '70b43079-91f9-48dc-9cf1-afe45eb07d3e';

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
    'Mantiene attenzione per la durata dell\'esercizio',
    'Ignora distrazioni durante l\'attività',
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
  description = 'Sviluppa la capacità di concentrazione attraverso esercizi progressivi in ambiente controllato. L\'attenzione sostenuta è fondamentale per l\'apprendimento e riduce la confusione mentale.'
WHERE title = 'Esercizi di Concentrazione' AND protocol_id = '70b43079-91f9-48dc-9cf1-afe45eb07d3e';

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
    'Se non riconosce, avvicina l\'oggetto e aiutalo con suggerimenti gestuali'
  ],
  level = 'facile',
  description = 'Rafforza le capacità di riconoscimento e memoria attraverso associazioni ripetute. Questo esercizio riduce la confusione cognitiva e aumenta la fiducia nel mondo familiare.'
WHERE title = 'Training di Riconoscimento' AND protocol_id = '70b43079-91f9-48dc-9cf1-afe45eb07d3e';