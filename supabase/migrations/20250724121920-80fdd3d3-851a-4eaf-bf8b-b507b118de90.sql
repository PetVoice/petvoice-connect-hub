-- AGGIORNAMENTO ALTRI ESERCIZI GESTIONE ANSIA + CONTROLLO AGGRESSIVITA

UPDATE ai_training_exercises 
SET instructions = CASE 

  -- GESTIONE ANSIA - Altri esercizi
  WHEN title = 'Training di Base Rilassato' THEN ARRAY[
    '1. PREPARAZIONE CALMA: Scegli un momento in cui il pet è già rilassato, mai dopo pasti o giochi eccitanti. Ambiente silenzioso, premi di alto valore pronti.',
    '2. COMANDO SEDUTO DOLCE: Usa solo la voce, tono basso e calmo, dice "seduto" una volta sola. Se non risponde, non ripetere, aspetta 10 secondi e riprova.',
    '3. RINFORZO ISTANTANEO: Nel momento esatto in cui il pet si siede, marca con "bravo" e premia immediatamente. Il timing è tutto per la comprensione.',
    '4. SESSIONI BREVISSIME: Massimo 5 minuti per comando, mai superare. Meglio 3 sessioni da 3 minuti che una da 10 minuti che stanca.',
    '5. COMANDO RESTA: Solo dopo 5 successi di "seduto", introduci "resta". Inizia con 3 secondi, aumenta di 2 secondi ogni giorno se ha successo.',
    '6. CHIUSURA RILASSANTE: Termina sempre con "bravo" e 2 minuti di coccole tranquille. Il pet deve associare training con relax, non stress.'
  ]

  WHEN title = 'Routine di Rilassamento Quotidiana' THEN ARRAY[
    '1. ORARIO FISSO: Scegli lo stesso orario ogni giorno, preferibilmente 30 minuti prima del riposo serale. Crea una routine che il pet riconosca.',
    '2. PREPARAZIONE AMBIENTE: Abbassa luci gradualmente in 10 minuti, riduci rumori, temperatura a 20-22°C. Usa sempre la stessa sequenza per creare associazioni.',
    '3. RESPIRAZIONE SINCRONIZZATA: Siediti vicino al pet, respira profondamente e lentamente per 5 minuti. Il tuo stato calmo influenza il suo.',
    '4. MASSAGGIO SISTEMATICO: Sempre nello stesso ordine: testa (2 min), orecchie (2 min), collo (3 min), schiena (5 min). Pressione leggera e costante.',
    '5. LETTURA CALMANTE: Leggi ad alta voce con voce monotona e rilassante per 10 minuti. Il suono della tua voce lo tranquillizza.',
    '6. POSIZIONE RIPOSO: Accompagna il pet verso il suo posto letto, resta 5 minuti finché non si rilassa completamente. Non andare via bruscamente.'
  ]

  WHEN title = 'Test di Fiducia' THEN ARRAY[
    '1. SIMULAZIONE GRADUALE: Ricrea situazioni che prima causavano ansia, ma in versione molto attenuata. Esempio: suono campanello molto basso.',
    '2. OSSERVAZIONE PASSIVA: Non intervenire immediatamente, osserva la reazione del pet per 30 secondi. Annota linguaggio corporeo e comportamenti.',
    '3. INTERVENTO POSITIVO: Solo se il pet resta calmo per 30 secondi, premia con snack e "bravo". Se si agita, non premiare ma neanche sgridare.',
    '4. MONITORAGGIO PROGRESSI: Tieni un diario giornaliero: situazione, reazione (scala 1-10), durata, miglioramenti. Questo aiuta a vedere i progressi.',
    '5. CELEBRAZIONE SUCCESSI: Ogni piccolo miglioramento va celebrato con entusiasmo appropriato. Rinforzo positivo costruisce fiducia.',
    '6. PIANIFICAZIONE FUTURA: Basandoti sui risultati, pianifica esercizi per la settimana successiva. Aumenta difficoltà solo se c è stabilità.'
  ]

  -- CONTROLLO AGGRESSIVITA - Esercizi principali
  WHEN title = 'Controllo dello Spazio' THEN ARRAY[
    '1. DEFINIZIONE ZONE: Stabilisci aree specifiche dove il pet può stare (tappeto, cuccia) e dove non può andare (divano, cucina). Usa barriere fisiche se necessario.',
    '2. COMANDO POSTO: Insegna "al posto" portando il pet fisicamente nell area designata. Premia quando ci va spontaneamente, ignora quando va altrove.',
    '3. RISPETTO GERARCHIE: Tu decidi quando il pet può avvicinarsi. Se arriva senza permesso, girati e ignoralo completamente per 2 minuti.',
    '4. CONTROLLO RISORSE: Cibo, giochi, attenzioni sono tue da dare quando decidi tu. Il pet deve aspettare un tuo segnale prima di accedere.',
    '5. MOVIMENTO CONTROLLATO: Il pet non deve bloccare passaggi o seguirti ovunque. Usa "resta" per farlo rimanere fermo quando necessario.',
    '6. CONSISTENZA ASSOLUTA: Tutti in famiglia devono applicare le stesse regole. Una sola eccezione può rovinare settimane di lavoro.'
  ]

  WHEN title = 'Gestione Triggers' THEN ARRAY[
    '1. IDENTIFICAZIONE PRECISA: Scrivi lista dettagliata di cosa scatena aggressività: altri animali, rumori, tocco, cibo, territorio. Sii specifico.',
    '2. EVITAMENTO INIZIALE: Nelle prime 2 settimane, evita completamente i trigger mentre lavori su autocontrollo generale. Prevenire è meglio che curare.',
    '3. DISTRAZIONE PRECOCE: Non appena vedi i primi segnali di tensione (orecchie dritte, corpo rigido), distrai immediatamente con comando noto.',
    '4. COMANDO STOP: Insegna "stop" con voce ferma ma non aggressiva. Il pet deve fermarsi immediatamente, premialo se obbedisce.',
    '5. REDIRECT POSITIVO: Dopo "stop", da immediatamente un comando che il pet sa fare bene (seduto, terra) per spostare focus su successo.',
    '6. RINFORZO CALMA: Premia sempre lo stato calmo, mai l aggressività. Anche se si ferma dopo aver mostrato aggressività, premia il fermarsi.'
  ]

  WHEN title = 'Esercizi di Controllo' THEN ARRAY[
    '1. CONTROLLO CIBO: Il pet deve aspettare il tuo "ok" prima di mangiare. Metti la ciotola, di "aspetta", conta 10 secondi, poi "ok". Aumenta gradualmente.',
    '2. CONTROLLO PASSAGGIO: Il pet non deve passare per primo da porte. Tu esci/entri prima, lui aspetta "ok". Questo rinforza leadership.',
    '3. CONTROLLO ATTENZIONE: Il pet deve aspettare che tu inizi le interazioni. Se ti salta addosso o cerca attenzione, ignoralo finché non si calma.',
    '4. CONTROLLO GIOCHI: Tu decidi quando iniziare e finire i giochi. Se il pet diventa troppo eccitato, gioco finisce immediatamente.',
    '5. CONTROLLO SPAZIO PERSONALE: Il pet deve rispettare il tuo spazio personale. Se invade, usa "indietro" e crea distanza fisica.',
    '6. CONTROLLO COMANDI: Il pet deve rispondere ai comandi di base (seduto, terra, resta, vieni) in modo affidabile prima di passare a controlli più complessi.'
  ]

  ELSE instructions
END
WHERE protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title IN ('Gestione dell''Ansia', 'Controllo dell''Aggressività')
) AND title IN ('Training di Base Rilassato', 'Routine di Rilassamento Quotidiana', 'Test di Fiducia', 'Controllo dello Spazio', 'Gestione Triggers', 'Esercizi di Controllo');