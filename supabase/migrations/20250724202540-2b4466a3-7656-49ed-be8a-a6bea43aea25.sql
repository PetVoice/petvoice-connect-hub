-- Completa gli ultimi esercizi del protocollo "Superare la Paura"

-- 13. Training Positivo Avanzato
UPDATE ai_training_exercises 
SET 
  instructions = ARRAY[
    '1. COMANDO AVANZATO: Scegli "cerca" o "porta" - comandi che richiedono pensiero attivo e costruiscono fiducia.',
    '2. OGGETTO FAMILIARE: Inizia con un oggetto che conosce bene e che ama (giocattolo preferito).',
    '3. DIMOSTRAZIONE CALMA: Mostragli cosa vuoi con movimenti lenti, fai tu l''azione una volta.',
    '4. RICHIESTA GENTILE: Usa tono di voce come se stessi chiedendo un favore, non impartendo un ordine.',
    '5. PREMIO TENTATIVO: Premia qualsiasi movimento verso l''obiettivo, anche se non perfetto.',
    '6. PAUSE FREQUENTI: Sessioni di massimo 5 minuti, se sbaglia fai pausa e riprova dopo.',
    '7. CELEBRAZIONE SUCCESSI: Ogni successo è una festa - il pet deve sentirsi un campione.'
  ],
  description = 'Comandi complessi che stimolano la mente e aumentano autostima, usando esclusivamente metodi positivi per costruire sicurezza.'
WHERE protocol_id = '4799a1cb-dd9e-4d1e-ad10-809263f51e18' AND title = 'Training Positivo Avanzato';

-- 14. Simulazione Controllata
UPDATE ai_training_exercises 
SET 
  instructions = ARRAY[
    '1. VERSIONE MINIATURA: Ricrea la situazione di paura in versione molto ridotta e controllabile.',
    '2. TUO STATO EMOTIVO: Tu devi essere perfettamente calmo e sicuro - il pet legge le tue emozioni.',
    '3. DURATA BREVISSIMA: Massimo 10-15 secondi di esposizione alla simulazione.',
    '4. MONITORAGGIO CONTINUO: Osserva ogni minimo segnale di stress per interrompere immediatamente.',
    '5. VIA DI FUGA: Assicurati sempre che il pet possa allontanarsi liberamente se vuole.',
    '6. PREMIO PRECOCE: Al primo accenno di calma, premia subito senza aspettare comportamenti perfetti.',
    '7. FINE POSITIVA: Termina sempre mentre è ancora calmo, mai durante un momento di stress.'
  ],
  description = 'Test controllato della situazione temuta in versione ridotta, per valutare progressi e abituare gradualmente.'
WHERE protocol_id = '4799a1cb-dd9e-4d1e-ad10-809263f51e18' AND title = 'Simulazione Controllata';

-- 15. Esplorazione Guidata
UPDATE ai_training_exercises 
SET 
  instructions = ARRAY[
    '1. LUOGO NUOVO TRANQUILLO: Scegli un posto mai visitato ma molto tranquillo (parco in orario silenzioso).',
    '2. OGGETTI FAMILIARI: Porta la sua coperta, un giocattolo e premi per creare "isole di sicurezza".',
    '3. ARRIVO GRADUALE: Fermati al limite dell''area nuova e aspetta che si orienti per 5-10 minuti.',
    '4. SUO RITMO: Lascia che sia lui a decidere quando e dove andare, tu segui senza dirigere.',
    '5. PAUSE FREQUENTI: Fermati ogni pochi passi per permettere elaborazione degli stimoli nuovi.',
    '6. SUPPORTO EMOTIVO: Parla con voce rassicurante quando sembra incerto o preoccupato.',
    '7. RIENTRO STRATEGICO: Torna verso casa prima che mostri stanchezza o sovraccarico sensoriale.'
  ],
  description = 'Scoperta sicura di nuovi ambienti per aumentare fiducia ed espandere gradualmente la zona di comfort.'
WHERE protocol_id = '4799a1cb-dd9e-4d1e-ad10-809263f51e18' AND title = 'Esplorazione Guidata';

-- 16. Test di Progresso
UPDATE ai_training_exercises 
SET 
  instructions = ARRAY[
    '1. TRIGGER ORIGINALE: Riesponi al trigger che causava paura all''inizio, ma con intensità graduale.',
    '2. DOCUMENTAZIONE VIDEO: Filma la sessione per confrontare oggettivamente con i comportamenti iniziali.',
    '3. SCALA VALUTAZIONE: Usa scala 1-10 per valutare livello di stress mostrato (1=calmo, 10=panico).',
    '4. TEMPO ESPOSIZIONE: Misura quanto tempo riesce a rimanere calmo prima di mostrare stress.',
    '5. DISTANZA COMFORT: Annota la distanza minima dal trigger che riesce a tollerare serenamente.',
    '6. RECUPERO RAPIDO: Osserva quanto velocemente si calma dopo aver rimosso il trigger.',
    '7. CELEBRAZIONE PROGRESSI: Anche piccoli miglioramenti sono vittorie enormi - celebra tutto!'
  ],
  description = 'Valutazione oggettiva dei miglioramenti ottenuti confrontando le reazioni attuali con quelle iniziali.'
WHERE protocol_id = '4799a1cb-dd9e-4d1e-ad10-809263f51e18' AND title = 'Test di Progresso';

-- 17. Consolidamento
UPDATE ai_training_exercises 
SET 
  instructions = ARRAY[
    '1. ESERCIZI PREFERITI: Identifica i 3-4 esercizi che hanno funzionato meglio durante il protocollo.',
    '2. COMBINAZIONI EFFICACI: Prova a combinare tecniche diverse che si sono dimostrate vincenti.',
    '3. ROUTINE QUOTIDIANA: Integra gli esercizi migliori nella routine quotidiana normale.',
    '4. AMBIENTE POSITIVO: Mantieni sempre un''atmosfera rilassata e celebrativa durante le attività.',
    '5. RINFORZO VARIABILE: Cambia tipo di premi per mantenere alta la motivazione.',
    '6. AUTOSUFFICIENZA: Incoraggia comportamenti calmi spontanei senza bisogno di dirigere.',
    '7. FIDUCIA COSTRUITA: Riconosci e celebra quanto sia cresciuta la fiducia reciproca.'
  ],
  description = 'Rinforzo sistematico di tutte le tecniche che hanno dato risultati migliori per consolidare i progressi ottenuti.'
WHERE protocol_id = '4799a1cb-dd9e-4d1e-ad10-809263f51e18' AND title = 'Consolidamento';

-- 18. Pianificazione Futura
UPDATE ai_training_exercises 
SET 
  instructions = ARRAY[
    '1. STRATEGIE VINCENTI: Scrivi una lista delle tecniche che hanno funzionato meglio per riferimento futuro.',
    '2. ROUTINE MANTENIMENTO: Pianifica una routine settimanale con 2-3 esercizi per mantenere i progressi.',
    '3. PIANO REGRESSIONI: Prepara un piano d''azione per eventuali ricadute o situazioni difficili.',
    '4. CALENDARIO PROMEMORIA: Imposta promemoria mensili per sessioni di "ripasso" delle tecniche.',
    '5. RETE SUPPORTO: Identifica persone (vet, trainer) da contattare se servono consigli.',
    '6. OBIETTIVI FUTURI: Stabilisci nuovi obiettivi graduale per continuare a crescere insieme.',
    '7. DOCUMENTAZIONE PROGRESSO: Mantieni un diario dei successi per motivazione nei momenti difficili.'
  ],
  description = 'Preparazione strategica per mantenere i progressi ottenuti e gestire eventuali sfide future con fiducia.'
WHERE protocol_id = '4799a1cb-dd9e-4d1e-ad10-809263f51e18' AND title = 'Pianificazione Futura';