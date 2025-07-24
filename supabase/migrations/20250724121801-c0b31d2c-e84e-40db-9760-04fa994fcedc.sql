-- AGGIORNAMENTO SISTEMATICO ESERCIZI: GESTIONE DELL'ANSIA - Istruzioni dettagliate

UPDATE ai_training_exercises 
SET instructions = CASE 

  WHEN title = 'Respirazione Guidata' THEN ARRAY[
    '1. PREPARAZIONE AMBIENTE: Scegli una stanza silenziosa, spegni TV e telefoni, regola la temperatura a 20-22°C. Chiudi porte e finestre per evitare rumori esterni.',
    '2. POSIZIONAMENTO STRATEGICO: Siediti sul pavimento a 50cm dal tuo pet, mantieni una postura rilassata con spalle basse e braccia aperte in modo non minaccioso.',
    '3. CONTATTO VISIVO DOLCE: Guarda il tuo pet con occhi rilassati (non fissi), lampeggia lentamente per comunicare calma. Se distoglie lo sguardo, rispetta e continua.',
    '4. RESPIRAZIONE 4-2-6: Inspira contando mentalmente 1-2-3-4, trattieni per 1-2, espira per 1-2-3-4-5-6. Rendi il respiro udibile ma non rumoroso.',
    '5. SINCRONIZZAZIONE: Dopo 3-4 respiri tuoi, osserva se il pet inizia a rilassarsi. I segnali sono: orecchie meno rigide, corpo che si abbassa, respirazione più lenta.',
    '6. DURATA E CHIUSURA: Continua per esattamente 15 minuti. Termina con una carezza dolce e un "bravo" sussurrato. Non alzarti bruscamente.'
  ]

  WHEN title = 'Zona Sicura' THEN ARRAY[
    '1. SELEZIONE SPAZIO: Scegli un angolo lontano da passaggi frequenti, preferibilmente con due pareti che offrono protezione. Evita aree vicino a porte o finestre rumorose.',
    '2. BASE COMFORT: Stendi una coperta di pile o cotone morbido (almeno 80x80cm), aggiungi un cuscino che abbia il profumo di casa. Controlla che non ci siano correnti di aria.',
    '3. OGGETTI RASSICURANTI: Posiziona il giocattolo preferito del pet e un capo di abbigliamento che profumi di te. Aggiungi una ciotolina con acqua fresca sempre disponibile.',
    '4. FEROMONI CALMANTI: Usa un diffusore di feromoni naturali posto a 2 metri di altezza, accendilo 2 ore prima del primo utilizzo. Evita profumi artificiali.',
    '5. INTRODUZIONE GRADUALE: Guida il pet verso la zona senza forzarlo, usa un tono di voce dolce dicendo "qui è il tuo posto sicuro". Premia quando si avvicina spontaneamente.',
    '6. RISPETTO DEI TEMPI: Rimani a 2-3 metri di distanza, non disturbare quando usa la zona. Osserva da lontano, intervieni solo se ti chiama.'
  ]

  WHEN title = 'Massaggio Rilassante' THEN ARRAY[
    '1. CONSENSO INIZIALE: Avvicinati lentamente, estendi la mano per fartela annusare. Se il pet si allontana, fermati e riprova dopo 10 minuti.',
    '2. INIZIO DOLCE: Inizia con carezze leggere sulla testa, usando solo la punta delle dita. Movimenti circolari di 2cm di diametro, pressione minima come accarezzare una bolla di sapone.',
    '3. PROGRESSIONE ORECCHIE: Massaggia delicatamente dietro le orecchie con pollice e indice, movimento di pizzicotto dolcissimo. Questa zona ha molti punti di pressione calmanti.',
    '4. COLLO E SPALLE: Usa tutta la mano per carezze lunghe dal collo alle spalle, sempre dal top verso il basso. Pressione media, come spalmare crema.',
    '5. SCHIENA FINALE: Movimenti lunghi dalla base del collo fino alla coda, evitando la zona lombare se il pet è sensibile. Mantieni ritmo costante di 1 carezza ogni 3 secondi.',
    '6. MONITORAGGIO REAZIONI: Osserva costantemente: orecchie rilassate, occhi socchiusi, corpo che si abbassa sono segnali positivi. Se si irrigidisce, fermati immediatamente.'
  ]

  WHEN title = 'Desensibilizzazione Graduale' THEN ARRAY[
    '1. IDENTIFICAZIONE TRIGGER: Scrivi una lista dei 3 trigger principali che causano ansia (rumori, oggetti, situazioni). Inizia sempre dal meno intenso.',
    '2. DISTANZA SICUREZZA: Posizionati a almeno 5 metri dal trigger se è un oggetto, o riduci il volume al 10% se è un suono. Il pet deve rimanere rilassato.',
    '3. ESPOSIZIONE CONTROLLATA: Presenta il trigger per massimo 30 secondi la prima volta. Se il pet resta calmo, premia immediatamente con snack di alto valore.',
    '4. INCREMENTI GRADUALI: Solo se il pet rimane rilassato per 3 sessioni consecutive, riduci la distanza di 50cm o aumenta il volume del 5%. Mai più veloce.',
    '5. GESTIONE STRESS: Se noti segni di stress (ansimare, tremare, nascondersi), fermati immediatamente e torna alla distanza precedente.',
    '6. CHIUSURA POSITIVA: Termina ogni sessione quando il pet è ancora calmo, mai quando è stressato. Finisci sempre con un gioco o attività che ama.'
  ]

  WHEN title = 'Gioco Interattivo Calmo' THEN ARRAY[
    '1. PREPARAZIONE PUZZLE: Usa giochi tipo Kong o tappetini sniffing, riempili con cibo umido o crocchette mischiate a un pò di formaggio spalmabile.',
    '2. NASCONDIGLI STRATEGICI: Nascondi 5-7 piccoli premi in punti facili da trovare: sotto cuscini, dietro sedie, in angoli accessibili. Evita posti alti o difficili.',
    '3. INCORAGGIAMENTO DOLCE: Usa voce calma e tono basso, dire "cerca il premio" o "bravo, continua così". Evita eccitazione o toni acuti che potrebbero agitare.',
    '4. RITMO CONTROLLATO: Se il pet diventa troppo eccitato, fermati 30 secondi, fallo sedere e aspetta che si calmi prima di continuare la ricerca.',
    '5. PREMI PROGRESSIVI: Ogni volta che trova un premio, fagli fare una pausa di rilassamento di 30 secondi prima del prossimo. Questo insegna autocontrollo.',
    '6. FINALE TRANQUILLO: Concludi con 5 minuti di coccole tranquille o carezze dolci. Il pet deve associare la fine del gioco con relax, non eccitazione.'
  ]

  ELSE instructions
END
WHERE protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Gestione dell''Ansia'
) AND title IN ('Respirazione Guidata', 'Zona Sicura', 'Massaggio Rilassante', 'Desensibilizzazione Graduale', 'Gioco Interattivo Calmo');