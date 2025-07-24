-- AGGIORNAMENTO CONTROLLO IPERATTIVITA + SUPERARE LA PAURA

UPDATE ai_training_exercises 
SET instructions = CASE 

  -- CONTROLLO IPERATTIVITA
  WHEN title = 'Esercizi di Calma' THEN ARRAY[
    '1. AMBIENTE PREPARATO: Stanza senza distrazioni, luci soffuse, temperatura fresca (18-20°C). Rimuovi giocattoli eccitanti, lascia solo oggetti calmanti.',
    '2. POSIZIONE TERRA: Guida il pet in posizione "terra" su una superficie morbida. Usa comando con voce profonda e calma, mai urlare o essere brusco.',
    '3. MANTIENI POSIZIONE: Il pet deve rimanere in posizione terra per 30 secondi inizialmente. Se si alza, riportalo delicatamente senza frustrazione.',
    '4. CAREZZE RILASSANTI: Mentre è in posizione, carezze lente e profonde sulla schiena, evita testa e orecchie che possono eccitare.',
    '5. RINFORZO PROGRESSIVO: Aumenta il tempo di 10 secondi ogni giorno solo se il pet rimane calmo. Premia la calma, non la fine del esercizio.',
    '6. ESTENSIONE GRADUALE: Obiettivo finale 5 minuti di calma. Usa timer per essere preciso, non andare a sensazione.'
  ]

  WHEN title = 'Controllo Impulsi' THEN ARRAY[
    '1. SETUP TENTAZIONE: Usa cibo molto appetitoso (pollo, formaggio) nella tua mano chiusa. Tienilo a 30cm dal muso del pet.',
    '2. COMANDO ASPETTA: Dice "aspetta" con voce ferma. Se il pet tenta di prendere il cibo, chiudi il pugno e allontana la mano.',
    '3. PAZIENZA ASSOLUTA: Non dare il cibo finché il pet non è completamente calmo per 5 secondi. Non importa quanto tempo ci vuole.',
    '4. MARCATURA SUCCESSO: Quando è calmo, dice "bravo" e da il premio. Il timing è cruciale per la comprensione.',
    '5. INCREMENTO DIFFICOLTA: Aumenta gradualmente il tempo di attesa: 10 secondi, 20 secondi, 30 secondi. Solo se ha successo.',
    '6. GENERALIZZAZIONE: Prova lo stesso esercizio in situazioni diverse: prima dei pasti, con giocattoli, con persone.'
  ]

  WHEN title = 'Rilassamento Forzato' THEN ARRAY[
    '1. TIMING STRATEGICO: Fai questo esercizio quando il pet è nel picco di iperattività, non quando è già calmo. È un reset comportamentale.',
    '2. SPAZIO DEDICATO: Usa sempre lo stesso posto, preferibilmente un angolo tranquillo con tappeto. Il pet deve riconoscere il posto come "zona calma".',
    '3. POSIZIONE FISSA: Guida il pet in posizione "terra" e resta seduto accanto senza muoverti. La tua energia calma lo influenza.',
    '4. NESSUNA INTERAZIONE: Non parlare, non accarezzare, non guardare intensamente. Solo presenza calma e supervisione.',
    '5. DURATA MINIMA: Almeno 10 minuti anche se il pet sembra calmo prima. Questo insegna che la calma deve durare.',
    '6. RILASCIO GRADUALE: Alzati lentamente, muoviti con calma, non eccitare il pet subito dopo. Mantieni energia bassa.'
  ]

  -- SUPERARE LA PAURA
  WHEN title = 'Identificazione Paure' THEN ARRAY[
    '1. OSSERVAZIONE SISTEMATICA: Per 3 giorni, annota ogni situazione che causa paura. Ora, luogo, intensità (1-10), durata, reazione specifica.',
    '2. CLASSIFICAZIONE TRIGGERS: Dividi le paure in categorie: rumori, oggetti, persone, luoghi, altri animali. Questo aiuta a creare piano specifico.',
    '3. SCALA INTENSITA: Per ogni paura, crea scala da 1 (lieve tensione) a 10 (panico totale). Inizierai sempre dal livello 1-2.',
    '4. SEGNALI PRECOCI: Impara a riconoscere i primi segnali di paura: orecchie indietro, coda bassa, corpo rigido, respirazione veloce.',
    '5. PATTERN TEMPORALI: Nota se ci sono orari o situazioni specifiche dove la paura è maggiore. Questo aiuta nella pianificazione.',
    '6. DOCUMENTAZIONE COMPLETA: Fai video o foto delle reazioni quando possibile. Questo ti aiuta a vedere miglioramenti nel tempo.'
  ]

  WHEN title = 'Desensibilizzazione Progressiva' THEN ARRAY[
    '1. PARTENZA MINIMA: Inizia con versione molto attenuata della paura. Esempio: suono cani che abbaiano al volume 1/10.',
    '2. DISTANZA SICURA: Posizionati a distanza dove il pet nota il trigger ma non mostra paura. Può essere anche 20 metri.',
    '3. DURATA BREVE: Esposizione di massimo 10 secondi la prima volta. Meglio troppo poco che troppo tanto.',
    '4. RINFORZO POSITIVO: Durante l esposizione, da premi continui e voce rassicurante. Il pet deve associare trigger con cose positive.',
    '5. INCREMENTI MINIMI: Aumenta intensità solo del 10% per volta. Passa da volume 1 a 1.1, non a 2. La fretta rovina tutto.',
    '6. REGRESSIONE OK: Se il pet mostra paura, torna immediatamente al livello precedente. Non è un fallimento, è informazione.'
  ]

  WHEN title = 'Rinforzo Positivo' THEN ARRAY[
    '1. TIMING PERFETTO: Premia il pet nel momento esatto in cui mostra coraggio, anche minimo. Un secondo di ritardo riduce efficacia.',
    '2. PREMI SPECIALI: Usa i premi più appetitosi che hai: pollo, formaggio, wurstel. La paura richiede motivazione extra.',
    '3. VOCE ENTUSIASTA: Usa tono allegro e incoraggiante quando il pet affronta la paura. La tua energia positiva lo supporta.',
    '4. VARIETA PREMI: Alterna cibo, carezze, giochi, parole positive. Questo mantiene l interesse e aumenta la motivazione.',
    '5. PREMI PREVENTIVI: Da premi anche prima che il pet mostri paura, quando è ancora calmo vicino al trigger.',
    '6. COSTANZA ASSOLUTA: Ogni volta che il pet mostra coraggio, deve essere premiato. Nessuna eccezione o diventa confuso.'
  ]

  ELSE instructions
END
WHERE protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title IN ('Controllo dell''Iperattività', 'Superare la Paura')
) AND title IN ('Esercizi di Calma', 'Controllo Impulsi', 'Rilassamento Forzato', 'Identificazione Paure', 'Desensibilizzazione Progressiva', 'Rinforzo Positivo');