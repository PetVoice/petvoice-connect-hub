-- AGGIORNAMENTO GESTIRE IRRITABILITA + CALMARE AGITAZIONE + RECUPERO APATIA

UPDATE ai_training_exercises 
SET instructions = CASE 

  -- GESTIRE IRRITABILITA
  WHEN title = 'Riconoscimento Segnali' THEN ARRAY[
    '1. OSSERVAZIONE DETTAGLIATA: Studia il linguaggio corporeo del pet: orecchie tese, sguardo fisso, corpo rigido, respirazione rapida. Annota tutto.',
    '2. SEGNALI PRECOCI: I primi segnali sono sottili: leggero irrigidimento, sguardo che si fissa, coda che si ferma. Impara a riconoscerli.',
    '3. SCALA PROGRESSIONE: Crea scala 1-10 dell irritabilità. Livello 1: leggera tensione, Livello 10: aggressività aperta. Intervieni al livello 2-3.',
    '4. TRIGGER SPECIFICI: Identifica cosa scatena irritabilità: rumori, persone, cibo, territorio, stanchezza. Ogni pet ha pattern unici.',
    '5. DOCUMENTAZIONE COSTANTE: Tieni diario giornaliero con orari, situazioni, intensità, durata. I pattern emergono dopo 1-2 settimane.',
    '6. CONDIVISIONE INFO: Se vivi con altri, condividi le informazioni. Tutti devono riconoscere i segnali per intervento coerente.'
  ]

  WHEN title = 'Tecniche di Distrazione' THEN ARRAY[
    '1. PREPARAZIONE STRUMENTI: Tieni sempre pronti oggetti/suoni per distrazione: giocattolo squeaky, cibo, campanello, fischietto.',
    '2. TIMING CRUCIALE: Intervieni appena vedi i primi segnali di irritabilità, non aspettare che peggiori. Prevenire è 10 volte più facile che curare.',
    '3. DISTRAZIONE POSITIVA: Usa comando che il pet conosce bene ("seduto", "vieni") seguito da premio immediato. Deve essere un successo garantito.',
    '4. CAMBIO AMBIENTE: Se possibile, sposta il pet in ambiente diverso. Cambiare scenografia spesso resetta l umore.',
    '5. ATTIVITA ALTERNATIVE: Proponi attività che richiede concentrazione: cercare cibo nascosto, puzzle, giochi di problem solving.',
    '6. ENERGIA REDIRETTA: Canalizzi l energia negativa in attività fisica controllata: passeggiata strutturata, esercizi di obbedienza.'
  ]

  WHEN title = 'Gestione Ambiente' THEN ARRAY[
    '1. ELIMINAZIONE TRIGGER: Rimuovi o riduci al minimo i fattori che scatenano irritabilità. Se sono rumori, usa musica rilassante per mascherare.',
    '2. SPAZI SICURI: Crea zone dove il pet può ritirarsi quando si sente irritato. Deve essere accessibile sempre, mai bloccata.',
    '3. ROUTINE PREVEDIBILE: Stabilisci orari fissi per pasti, passeggiate, giochi. La prevedibilità riduce stress e irritabilità.',
    '4. CONTROLLO STIMOLI: Riduci sovrastimolazione: luci forti, rumori caotici, traffico eccessivo di persone. Ambiente calmo = pet calmo.',
    '5. TEMPERATURA COMFORT: Mantieni temperatura 20-22°C. Il caldo eccessivo aumenta irritabilità, il freddo crea tensione.',
    '6. PROFUMI CALMANTI: Usa diffusori con lavanda o camomilla (sicuri per pet). Evita profumi chimici o deodoranti forti.'
  ]

  -- CALMARE AGITAZIONE
  WHEN title = 'Respirazione Sincronizzata' THEN ARRAY[
    '1. POSIZIONAMENTO STRATEGICO: Siediti a 1 metro dal pet agitato, alla sua altezza. Non stare in piedi che può intimidire.',
    '2. RESPIRAZIONE VISIBILE: Respira profondamente e lentamente, rendendo il respiro udibile ma non esagerato. 4 secondi inspira, 6 espira.',
    '3. CONTATTO VISIVO DOLCE: Guarda il pet con occhi rilassati, lampeggia lentamente. Questo è linguaggio calmante per gli animali.',
    '4. SINCRONIZZAZIONE GRADUALE: Dopo 2-3 minuti, il pet inizierà a sincronizzare il suo respiro con il tuo. È un processo naturale.',
    '5. DURATA ADEGUATA: Continua per almeno 10 minuti anche se il pet sembra calmarsi prima. La calma deve stabilizzarsi.',
    '6. TRANSIZIONE DOLCE: Non alzarti bruscamente alla fine. Movimento lenti, voce bassa, mantieni energia calma per altri 5 minuti.'
  ]

  WHEN title = 'Massaggio Calmante' THEN ARRAY[
    '1. CONSENSO GRADUALE: Avvicinati lentamente, offri la mano da annusare. Se il pet si allontana, rispetta e riprova dopo 10 minuti.',
    '2. INIZIO MINIMALE: Inizia con un dito solo, carezze leggerissime sulla testa. Pressione come toccare una bolla di sapone.',
    '3. PROGRESSIONE ANATOMICA: Testa → orecchie (dietro) → collo → spalle → schiena. Mai saltare passaggi o andare troppo veloce.',
    '4. PRESSIONE GRADUALE: Inizia leggerissimo, aumenta gradualmente fino a pressione media. Osserva reazioni, adatta di conseguenza.',
    '5. RITMO COSTANTE: 1 carezza ogni 2-3 secondi. Ritmo lento e ipnotico che induce rilassamento. Mai irregolare o frammentato.',
    '6. MONITORAGGIO CONTINUO: Osserva segnali di rilassamento: respiro più lento, muscoli che si rilassano, occhi che si chiudono.'
  ]

  WHEN title = 'Ambiente Rilassante' THEN ARRAY[
    '1. ILLUMINAZIONE SOFFUSA: Luci al 30-40% dell intensità normale. Usa lampade da tavolo invece di luci soffitto che possono abbagliare.',
    '2. CONTROLLO RUMORE: Elimina rumori improvvisi. Usa musica classica o suoni natura a volume bassissimo (appena percettibile).',
    '3. TEMPERATURA OTTIMALE: 20-22°C è ideale. Troppo caldo agita, troppo freddo crea tensione. Usa ventilatore silenzioso se necessario.',
    '4. PROFUMI NATURALI: Diffusore con lavanda o camomilla a 3 metri di distanza. Mai spruzzare direttamente, il pet deve poter allontanarsi.',
    '5. SUPERFICI COMFORT: Tappeti morbidi, cuscini, coperte che profumano di casa. Il pet deve sentirsi sicuro e protetto.',
    '6. ELIMINAZIONE DISTRAZIONI: Spegni TV, telefoni, allontana altri animali. Il pet agitato ha bisogno di focus totale su rilassamento.'
  ]

  -- RECUPERO APATIA
  WHEN title = 'Stimolazione Gentile' THEN ARRAY[
    '1. APPROCCIO GRADUALE: Inizia con stimoli molto lievi: voce dolce, carezza leggera, presenza silenziosa. Non forzare reazioni.',
    '2. RISPETTO RITMI: Il pet apatico ha tempi più lenti. Aspetta 30 secondi tra un stimolo e l altro, non bombardare di input.',
    '3. STIMOLI POSITIVI: Usa solo associazioni positive: cibo preferito, giocattolo del cuore, odori familiari. Mai nulla stressante.',
    '4. INCREMENTO PAZIENTE: Aumenta intensità stimoli solo se c è risposta positiva. 1 passo avanti per volta, mai forzare.',
    '5. CELEBRAZIONE MINIMI: Ogni piccola reazione va celebrata: sguardo, movimento orecchio, leggero movimento coda. Rinforzo positivo costante.',
    '6. SESSIONI BREVI: Massimo 5 minuti per sessione, 3-4 volte al giorno. La sovrastimolazione peggiora l apatia.'
  ]

  WHEN title = 'Riattivazione Interesse' THEN ARRAY[
    '1. RICERCA MOTIVATORI: Testa diversi stimoli per trovare cosa ancora interessa al pet: cibi, odori, suoni, giocattoli, persone.',
    '2. PRESENTAZIONE GRADUALE: Introduci i motivatori lentamente, senza pressione. Metti cibo preferito vicino, non forzare a mangiare.',
    '3. ASSOCIAZIONI POSITIVE: Ogni volta che il pet mostra minimo interesse, crea associazione positiva con voce dolce e presenza.',
    '4. VARIETA CONTROLLATA: Ruota diversi motivatori per evitare abituazione, ma non troppi insieme che confondono.',
    '5. PAZIENZA INFINITA: L apatia richiede settimane per migliorare. Non aspettarti risultati immediati, ogni giorno è un piccolo passo.',
    '6. MONITORAGGIO PROGRESSI: Segna ogni miglioramento, anche minimo: sguardo più attento, movimento più veloce, interesse per cibo.'
  ]

  ELSE instructions
END
WHERE protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title IN ('Gestire l''Irritabilità', 'Calmare l''Agitazione', 'Recupero dall''Apatia')
) AND title IN ('Riconoscimento Segnali', 'Tecniche di Distrazione', 'Gestione Ambiente', 'Respirazione Sincronizzata', 'Massaggio Calmante', 'Ambiente Rilassante', 'Stimolazione Gentile', 'Riattivazione Interesse');