-- AGGIORNAMENTO FINALI: SUPERARE TRISTEZZA + CHIAREZZA MENTALE + RIDUZIONE STRESS

UPDATE ai_training_exercises 
SET instructions = CASE 

  -- SUPERARE LA TRISTEZZA
  WHEN title = 'Attivazione Dolce' THEN ARRAY[
    '1. TIMING RISPETTOSO: Scegli momenti quando il pet è più ricettivo, mai forzare quando vuole stare solo. Rispetta i suoi ritmi naturali.',
    '2. APPROCCIO GRADUALE: Inizia sedendoti vicino senza interagire, poi voce dolce, poi contatto fisico leggero. Ogni passo richiede consenso.',
    '3. STIMOLI POSITIVI: Usa solo associazioni che il pet ama: cibo preferito, giocattolo del cuore, profumi familiari. Niente novità stressanti.',
    '4. ENERGIA CALMA: La tua energia deve essere rilassata ma positiva. Non eccitato o troppo energico, ma nemmeno depresso come il pet.',
    '5. SESSIONI BREVI: Massimo 10 minuti per sessione, poi lascia il pet in pace. Meglio più sessioni brevi che una lunga oppressiva.',
    '6. RINFORZO MINIMO: Celebra ogni piccola risposta positiva con voce dolce e premi leggeri. Non esagerare che può sopraffare.'
  ]

  WHEN title = 'Stimolazione Sensoriale' THEN ARRAY[
    '1. TEST GRADUALE: Prova diversi stimoli sensoriali uno alla volta: odori (cibo, erba), suoni (musica dolce), texture (coperte morbide).',
    '2. ODORI FAMILIARI: Inizia con profumi che il pet associa con momenti felici: il tuo odore, cibo preferito, giocattolo del cuore.',
    '3. SUONI RILASSANTI: Musica classica a volume bassissimo, suoni natura, o la tua voce che legge. Mai rumori forti o improvvisi.',
    '4. TEXTURE COMFORT: Superfici morbide, calde, rassicuranti. Coperte pile, tappeti soffici, cuscini che profumano di casa.',
    '5. TEMPERATURE PIACEVOLI: Leggero calore con coperta o pad riscaldante (sicuro), mai troppo caldo. Il calore conforta la tristezza.',
    '6. VARIAZIONE MINIMA: Cambia un solo elemento per volta, osserva reazioni per 2-3 giorni prima di provare altro.'
  ]

  WHEN title = 'Costruzione Fiducia' THEN ARRAY[
    '1. PRESENZA COSTANTE: Stai vicino al pet senza pretendere interazione. La tua presenza rassicurante è già un sostegno.',
    '2. PREVEDIBILITA: Fai sempre le stesse cose nello stesso ordine: stessa ora, stesso posto, stessa routine. La prevedibilità rassicura.',
    '3. RISPETTO SPAZI: Se il pet si allontana, non seguirlo. Rispetta il suo bisogno di spazio, torna quando è pronto.',
    '4. COMUNICAZIONE DOLCE: Parla con voce bassa e monotona, come una ninna nanna. Le parole contano meno del tono.',
    '5. CONTATTO CONSENSUALE: Offri la mano da annusare, aspetta che il pet inizi il contatto. Mai forzare carezze o abbracci.',
    '6. COSTANZA EMOTIVA: Mantieni sempre la stessa energia calma e positiva. Il pet ha bisogno di stabilità emotiva da te.'
  ]

  -- CHIAREZZA MENTALE
  WHEN title = 'Esercizi Cognitivi Base' THEN ARRAY[
    '1. PUZZLE SEMPLICI: Inizia con giochi facili che il pet può risolvere: cibo nascosto sotto ciotola capovolta, aperture semplici.',
    '2. SEQUENZE MEMORIA: Nascondi premio sempre nello stesso posto per 5 volte, poi cambia. Questo stimola memoria e adattabilità.',
    '3. COMANDI VARIATI: Alterna comandi base (seduto, terra, resta, vieni) in ordine casuale per mantenere mente attiva.',
    '4. PROBLEM SOLVING: Metti premio in contenitore semi-aperto che richiede manipolazione leggera per aprire.',
    '5. RICONOSCIMENTO PATTERN: Stabilisci sequenza fissa (3 premi, pausa, 3 premi) per alcune sessioni, poi cambia per stimolare adattamento.',
    '6. TEMPO GIUSTO: Sessioni di 5-7 minuti massimo. La concentrazione mentale stanca più di quella fisica.'
  ]

  WHEN title = 'Stimolazione Mentale' THEN ARRAY[
    '1. VARIETA CONTROLLED: Cambia tipo di giochi ogni 2-3 giorni ma non ogni giorno. Troppi cambiamenti confondono, troppo pochi annoiano.',
    '2. DIFFICOLTA PROGRESSIVA: Inizia facile (90% successo), aumenta difficoltà solo quando il pet padroneggia il livello attuale.',
    '3. MULTI-SENSORIALE: Combina odori, suoni, vista: nascondi cibo che profuma, usa contenitori che fanno rumore quando mossi.',
    '4. ESPLORAZIONE GUIDATA: Porta il pet in ambienti nuovi ma sicuri, lascia esplorare liberamente per 10 minuti con supervisione.',
    '5. INTERAZIONE SOCIALE: Se ci sono altri pet, organizza giochi di gruppo semplici che richiedono cooperazione.',
    '6. DOCUMENTAZIONE: Annota quali giochi il pet preferisce e riesce meglio. Personalizza basandoti sui suoi punti di forza.'
  ]

  WHEN title = 'Concentrazione Focalizzata' THEN ARRAY[
    '1. AMBIENTE NEUTRO: Stanza senza distrazioni, temperatura comfort, luci normali. Il pet deve poter concentrare tutta l attenzione sull esercizio.',
    '2. OBIETTIVO UNICO: Un solo compito per sessione. Non mischiare comandi diversi o giochi multipli. Focus totale su una cosa.',
    '3. RINFORZO IMMEDIATO: Premia nel momento esatto in cui il pet mostra concentrazione, non solo quando completa il compito.',
    '4. DURATA GRADUALE: Inizia con 30 secondi di concentrazione richiesta, aumenta di 15 secondi ogni volta che ha successo.',
    '5. BREAK STRUTTURATI: Ogni 2 minuti di concentrazione, pausa di 30 secondi con libertà totale. Poi riprendi l esercizio.',
    '6. SEGNALI STANCHEZZA: Se il pet distoglie spesso lo sguardo, sbadiglia, si agita, ferma immediatamente. Concentrazione forzata è controproducente.'
  ]

  -- RIDUZIONE DELLO STRESS
  WHEN title = 'Ambiente Anti-Stress' THEN ARRAY[
    '1. CONTROLLO RUMORI: Identifica e riduci tutti i rumori stressanti: TV alta, traffico, elettrodomestici. Usa materiali fonoassorbenti se necessario.',
    '2. ILLUMINAZIONE NATURALE: Preferisci luce naturale a quella artificiale. Se usi luci artificiali, temperatura colore calda (2700K-3000K).',
    '3. SPAZI DEFINITI: Crea zone specifiche per ogni attività: mangiare, dormire, giocare, rilassarsi. Il pet deve sapere cosa aspettarsi in ogni zona.',
    '4. PROFUMI NEUTRI: Elimina profumi chimici, detersivi forti, candele profumate. Usa solo odori naturali che il pet associa con sicurezza.',
    '5. TEMPERATURE STABILI: Evita sbalzi termici. Mantieni 20-22°C costanti. Usa umidificatore se l aria è troppo secca.',
    '6. PERCORSI LIBERI: Assicura che il pet possa muoversi liberamente senza ostacoli. Vie di fuga sempre libere per sicurezza psicologica.'
  ]

  WHEN title = 'Tecniche Rilassamento' THEN ARRAY[
    '1. RESPIRAZIONE GUIDATA: Siediti vicino al pet, respira lentamente e profondamente. 4 secondi inspira, 6 espira. Il pet si sincronizzerà naturalmente.',
    '2. MASSAGGIO PROGRESSIVO: Inizia dalla testa con pressione leggerissima, procedi verso collo, spalle, schiena. Movimenti lenti e ripetitivi.',
    '3. VOCE MONOTONA: Parla o leggi con voce bassa e uniforme. Il tono monotono ha effetto ipnotico e rilassante.',
    '4. MUSICA TERAPEUTICA: Usa musica classica (Mozart, Bach) o suoni natura a volume molto basso. Mai musica con ritmi irregolari.',
    '5. CALORE TERAPEUTICO: Usa pad riscaldante sicuro per pet o coperta calda (non bollente). Il calore rilassa muscoli e mente.',
    '6. ROUTINE SERALE: Stabilisci sequenza fissa pre-nanna: stesse attività nello stesso ordine ogni sera. La routine calma e rassicura.'
  ]

  WHEN title = 'Monitoraggio Stress' THEN ARRAY[
    '1. SCALA NUMERICA: Valuta livello stress del pet ogni giorno scala 1-10. Usa sempre gli stessi criteri per coerenza.',
    '2. SEGNALI FISICI: Monitora: respirazione rapida, tremori, salivazione eccessiva, perdita appetito, cambi postura.',
    '3. SEGNALI COMPORTAMENTALI: Annota: agitazione, nascondersi, aggressività, apatia, comportamenti compulsivi.',
    '4. TRIGGER TRACKING: Registra cosa scatena stress: orari, situazioni, persone, rumori. Pattern emergono dopo 1-2 settimane.',
    '5. PROGRESSI MISURABILI: Confronta livelli stress settimanalmente. Miglioramenti graduali sono normali, non aspettarti cambi drastici.',
    '6. ADATTAMENTO PIANO: Modifica tecniche basandoti sui risultati. Se qualcosa non funziona dopo 1 settimana, prova approccio diverso.'
  ]

  ELSE instructions
END
WHERE protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title IN ('Superare la Tristezza', 'Chiarezza Mentale', 'Riduzione dello Stress')
) AND title IN ('Attivazione Dolce', 'Stimolazione Sensoriale', 'Costruzione Fiducia', 'Esercizi Cognitivi Base', 'Stimolazione Mentale', 'Concentrazione Focalizzata', 'Ambiente Anti-Stress', 'Tecniche Rilassamento', 'Monitoraggio Stress');