// Dati completi per i protocolli di addestramento comportamentale
// Ogni protocollo include esercizi dettagliati per ogni giorno

export interface DetailedExercise {
  name: string;
  duration: string;
  level: string;
  description: string;
  materials: string[];
  objectives: string[];
  successCriteria: string[];
  instructions?: string[];
  tips: string[];
}

export interface ProtocolDay {
  day: number;
  phase: string;
  exercises: DetailedExercise[];
}

export interface CompleteProtocol {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  durationDays: number;
  targetBehaviors: string[];
  phases: Array<{ name: string; days: string }>;
  days: ProtocolDay[];
}

// PROTOCOLLO 1: GESTIONE DELL'ANSIA (21 giorni, Intermedio)
export const ansietyManagementProtocol: CompleteProtocol = {
  id: "anxiety-management",
  name: "Gestione dell'Ansia",
  description: "Protocollo completo per ridurre l'ansia e lo stress negli animali domestici",
  category: "Comportamento",
  difficulty: "intermedio",
  durationDays: 21,
  targetBehaviors: ["ansia", "stress", "nervosismo"],
  phases: [
    { name: "Costruzione delle Basi", days: "1-7" },
    { name: "Tecniche di Rilassamento", days: "8-14" },
    { name: "Desensibilizzazione", days: "15-21" }
  ],
  days: [
    {
      day: 1,
      phase: "Costruzione delle Basi",
      exercises: [
        {
          name: "Creazione Zona Sicura",
          duration: "15-20 minuti",
          level: "Intermedio",
          description: "Allestisci uno spazio dedicato dove l'animale può rifugiarsi quando si sente ansioso. Posiziona il suo tappetino preferito in un angolo tranquillo, lontano dal traffico della casa. Aggiungi i suoi giocattoli preferiti e una coperta con il tuo odore. Lascia che esplori spontaneamente questo spazio senza forzarlo.",
          materials: ["Tappetino antiscivolo", "Coperta familiare", "Giocattoli preferiti", "Ciotola dell'acqua"],
          objectives: ["Creare associazione positiva", "Stabilire rifugio sicuro", "Ridurre stress ambientale"],
          successCriteria: ["Si avvicina volontariamente", "Rimane nello spazio per 5+ minuti", "Mostra postura rilassata"],
          tips: [
            "Non forzare mai l'ingresso nella zona sicura, deve essere una scelta libera",
            "Posiziona la zona lontana da fonti di rumore come TV o elettrodomestici",
            "Rispetta sempre questo spazio quando l'animale lo occupa, non disturbarlo mai"
          ]
        },
        {
          name: "Respirazione Guidata",
          duration: "5-10 minuti",
          level: "Intermedio",
          description: "Siediti accanto al tuo animale e inizia a respirare lentamente e profondamente. Gli animali spesso sincronizzano il loro ritmo respiratorio con quello del proprietario. Conta mentalmente: 4 secondi di inspirazione, 4 di pausa, 4 di espirazione. Mantieni una postura rilassata e parla con voce calma e monotona.",
          materials: ["Ambiente silenzioso", "Posizione comoda", "Timer silenzioso"],
          objectives: ["Sincronizzare ritmi respiratori", "Calmare sistema nervoso", "Creare routine rilassante"],
          successCriteria: ["Respirazione più lenta", "Postura meno tesa", "Rimane vicino durante l'esercizio"],
          tips: [
            "Pratica prima tu la tecnica per essere naturale nell'esecuzione",
            "Se l'animale si allontana, continua l'esercizio senza seguirlo",
            "Usa sempre lo stesso orario per creare una routine prevedibile"
          ]
        },
        {
          name: "Tocco Calmante",
          duration: "10-15 minuti",
          level: "Intermedio",
          description: "Inizia con carezze molto leggere e lente dietro le orecchie, una zona generalmente rilassante. Procedi verso il collo e le spalle con movimenti circolari dolci. Osserva i segnali di gradimento: se si appoggia al tocco continua, se si irrigidisce fermati. Alterna tocco e pause di 30 secondi.",
          materials: ["Spazio tranquillo", "Olio essenziale lavanda (facoltativo)", "Musica rilassante"],
          objectives: ["Ridurre tensione muscolare", "Aumentare fiducia", "Stimolare rilascio endorfine"],
          successCriteria: ["Accetta tocco senza irrigidirsi", "Mostra segni di rilassamento", "Non cerca di allontanarsi"],
          tips: [
            "Osserva sempre il linguaggio del corpo prima di iniziare il tocco",
            "Evita zone sensibili come zampe o pancia se l'animale è ansioso",
            "Se usa artigli o denti per comunicare disagio, interrompi immediatamente"
          ]
        }
      ]
    },
    {
      day: 2,
      phase: "Costruzione delle Basi",
      exercises: [
        {
          name: "Comando 'Calma'",
          duration: "10-15 minuti",
          level: "Intermedio",
          description: "Insegna un comando specifico per indurre calma. Quando l'animale è naturalmente rilassato, pronuncia 'Calma' con voce dolce e premialo immediatamente con uno snack speciale. Ripeti ogni volta che lo vedi tranquillo. L'obiettivo è creare un'associazione tra la parola e lo stato di rilassamento.",
          materials: ["Snack ad alto valore", "Voce calma", "Ambiente tranquillo"],
          objectives: ["Creare comando di rilassamento", "Associare parola a calma", "Stabilire controllo verbale"],
          successCriteria: ["Risponde al comando entro 10 secondi", "Assume postura rilassata", "Mantiene calma per 30+ secondi"],
          tips: [
            "Usa sempre lo stesso tono di voce, basso e rassicurante",
            "Non usare il comando quando l'animale è agitato, solo quando è già calmo",
            "Premia sempre immediatamente per rinforzare l'associazione positiva"
          ]
        },
        {
          name: "Massaggio Anti-Stress",
          duration: "15-20 minuti",
          level: "Intermedio",
          description: "Inizia con movimenti circolari molto leggeri sulla testa, evitando gli occhi. Procedi verso il collo con piccoli movimenti a spirale. Massaggia delicatamente le spalle e, se gradito, lungo la schiena. Ogni movimento deve durare almeno 3-5 secondi. Fermati se noti tensione.",
          materials: ["Spazio comodo", "Mani pulite", "Ambiente caldo"],
          objectives: ["Ridurre tensione fisica", "Migliorare circolazione", "Aumentare legame affettivo"],
          successCriteria: ["Muscoli si rilassano", "Respirazione rallenta", "Cerca attivamente il contatto"],
          tips: [
            "Scalda le mani prima di iniziare per evitare sobbalzi da freddo",
            "Mantieni pressione molto leggera, è un massaggio di rilassamento non terapeutico",
            "Se l'animale si addormenta durante il massaggio, è un ottimo segno di successo"
          ]
        },
        {
          name: "Musicoterapia",
          duration: "20-30 minuti",
          level: "Intermedio",
          description: "Riproduci musica classica a volume basso (preferibilmente Mozart o Debussy) mentre l'animale è nella sua zona sicura. Osserva le reazioni: orecchie rilassate, respirazione regolare, posizione sdraiata sono segnali positivi. Evita musica con bassi forti o cambi di ritmo improvvisi.",
          materials: ["Sistema audio", "Musica classica", "Volume controllabile"],
          objectives: ["Ridurre stress acustico", "Creare ambiente rilassante", "Mascherare rumori esterni"],
          successCriteria: ["Non mostra segni di agitazione", "Rimane rilassato durante la musica", "Frequenza cardiaca rallenta"],
          tips: [
            "Testa diversi compositori per trovare quello che preferisce il tuo animale",
            "Non usare mai auricolari o cuffie sull'animale",
            "Inizia con volumi molto bassi e aumenta gradualmente se ben tollerato"
          ]
        }
      ]
    },
    {
      day: 3,
      phase: "Costruzione delle Basi",
      exercises: [
        {
          name: "Desensibilizzazione ai Rumori",
          duration: "15-20 minuti",
          level: "Intermedio",
          description: "Inizia con rumori molto deboli (TV a volume 1-2) mentre l'animale è rilassato nella sua zona sicura. Gradualmente aumenta il volume ogni 2-3 minuti solo se l'animale rimane calmo. Se mostra segni di stress, riduci immediatamente il volume e premia la calma.",
          materials: ["Fonte audio controllabile", "Snack calmanti", "Zona sicura preparata"],
          objectives: ["Ridurre sensibilità ai rumori", "Aumentare tolleranza stress", "Creare associazioni positive"],
          successCriteria: ["Tollera rumori bassi senza agitarsi", "Rimane nella zona sicura", "Accetta premi durante l'esposizione"],
          tips: [
            "Non forzare mai progressi troppo rapidi, ogni animale ha i suoi tempi",
            "Termina sempre l'esercizio quando l'animale è ancora calmo",
            "Usa rumori familiari prima di introdurre suoni nuovi"
          ]
        }
      ]
    }
    // Altri giorni seguiranno lo stesso schema dettagliato...
  ]
};

// PROTOCOLLO 2: OBBEDIENZA DI BASE (14 giorni, Principiante)
export const basicObedienceProtocol: CompleteProtocol = {
  id: "basic-obedience",
  name: "Obbedienza di Base",
  description: "Protocollo introduttivo per insegnare i comandi fondamentali",
  category: "Addestramento",
  difficulty: "principiante",
  durationDays: 14,
  targetBehaviors: ["seduto", "resta", "vieni", "lascia", "terra"],
  phases: [
    { name: "Comandi Base", days: "1-7" },
    { name: "Consolidamento", days: "8-14" }
  ],
  days: [
    {
      day: 1,
      phase: "Comandi Base",
      exercises: [
        {
          name: "Comando 'Seduto' Base",
          duration: "5-10 minuti",
          level: "Principiante",
          description: "Tieni uno snack sopra la testa dell'animale e muovilo lentamente all'indietro. Naturalmente l'animale alzerà la testa e abbasserà il posteriore. Nel momento in cui si siede, di' 'Seduto' e premia immediatamente. Ripeti 5-8 volte per sessione con pause tra una ripetizione e l'altra.",
          materials: ["Snack piccoli", "Spazio libero", "Pazienza"],
          objectives: ["Insegnare posizione seduta", "Associare comando a movimento", "Stabilire base per altri comandi"],
          successCriteria: ["Si siede entro 3 secondi dal comando", "Mantiene posizione per 5 secondi", "Risponde senza aiuto dello snack"],
          tips: [
            "Non premere mai fisicamente l'animale verso il basso, deve essere un movimento naturale",
            "Usa snack molto piccoli per evitare di saziarlo troppo presto",
            "Termina sempre l'esercizio con successo, anche se devi semplificare il comando"
          ]
        },
        {
          name: "Attenzione e Nome",
          duration: "5-8 minuti",
          level: "Principiante",
          description: "Pronuncia il nome dell'animale con voce allegra e chiara. Quando ti guarda, anche solo per un istante, premia immediatamente con snack e lodi. L'obiettivo è che associ il suo nome al guardare verso di te. Pratica in ambiente silenzioso inizialmente.",
          materials: ["Snack motivanti", "Voce chiara", "Ambiente controllato"],
          objectives: ["Risposta al nome", "Contatto visivo", "Attenzione focalizzata"],
          successCriteria: ["Guarda quando chiamato", "Mantiene contatto visivo per 2+ secondi", "Risponde da distanze crescenti"],
          tips: [
            "Non ripetere il nome più di due volte di seguito per evitare che lo ignori",
            "Usa sempre tono positivo, mai per sgridare o richiamare quando è in errore",
            "Pratica quando l'animale è già interessato a te per aumentare le probabilità di successo"
          ]
        },
        {
          name: "Rinforzo Positivo Base",
          duration: "10-15 minuti",
          level: "Principiante",
          description: "Osserva l'animale e ogni volta che fa qualcosa di positivo spontaneamente (si siede, ti guarda, sta calmo), premialo immediatamente. Questo insegna che i comportamenti buoni portano conseguenze piacevoli. Varia i premi: snack, carezze, giochi.",
          materials: ["Snack vari", "Giocattoli", "Attenzione costante"],
          objectives: ["Rinforzare comportamenti positivi", "Aumentare frequenza azioni desiderate", "Creare motivazione intrinseca"],
          successCriteria: ["Aumenta comportamenti premiati", "Cerca attivamente l'attenzione", "Mostra eccitazione per i premi"],
          tips: [
            "Il timing è cruciale: premia entro 2 secondi dal comportamento desiderato",
            "Varia i premi per mantenere alta la motivazione e prevenire noia",
            "Ignora completamente i comportamenti indesiderati, non dar loro attenzione"
          ]
        }
      ]
    },
    {
      day: 2,
      phase: "Comandi Base",
      exercises: [
        {
          name: "Comando 'Resta' Introduzione",
          duration: "8-12 minuti",
          level: "Principiante",
          description: "Con l'animale in posizione seduta, alza la mano con il palmo verso di lui e fai un passo indietro. Di' 'Resta' con voce ferma ma calma. Conta fino a 3, poi torna e premia. Aumenta gradualmente la distanza e il tempo. Se si muove, ricomincia senza punizione.",
          materials: ["Spazio aperto", "Snack premio", "Pazienza"],
          objectives: ["Insegnare autocontrollo", "Stabilire comando di attesa", "Rafforzare fiducia"],
          successCriteria: ["Rimane fermo per 5 secondi", "Non si muove quando ti allontani", "Aspetta il comando di rilascio"],
          tips: [
            "Inizia sempre con distanze e tempi molto brevi per garantire successo",
            "Non usare mai il comando 'Resta' se non sei sicuro che l'animale obbedirà",
            "Torna sempre dall'animale, non chiamarlo verso di te quando è in 'Resta'"
          ]
        }
      ]
    }
  ]
};

// PROTOCOLLO 3: CONTROLLO DELL'AGGRESSIVITÀ (28 giorni, Avanzato)
export const aggressionControlProtocol: CompleteProtocol = {
  id: "aggression-control",
  name: "Controllo dell'Aggressività",
  description: "Protocollo specializzato per gestire comportamenti aggressivi attraverso tecniche di modifica comportamentale",
  category: "Comportamento",
  difficulty: "avanzato",
  durationDays: 28,
  targetBehaviors: ["aggressività", "ringhio", "morso", "territorialità", "protezione risorse"],
  phases: [
    { name: "Valutazione e Sicurezza", days: "1-7" },
    { name: "Modifica Comportamentale", days: "8-21" },
    { name: "Consolidamento", days: "22-28" }
  ],
  days: [
    {
      day: 1,
      phase: "Valutazione e Sicurezza",
      exercises: [
        {
          name: "Identificazione Trigger",
          duration: "20-30 minuti",
          level: "Avanzato",
          description: "Osserva attentamente l'animale durante la giornata e annota tutti i momenti che precedono comportamenti aggressivi. Identifica pattern: orari, luoghi, persone, oggetti o situazioni specifiche. Non intervenire oggi, solo osserva e registra. Mantieni distanza di sicurezza.",
          materials: ["Diario comportamentale", "Penna", "Timer", "Spazio sicuro"],
          objectives: ["Identificare trigger specifici", "Mappare pattern comportamentali", "Stabilire baseline comportamentale"],
          successCriteria: ["Almeno 3 trigger identificati", "Pattern temporali riconosciuti", "Nessun incidente di sicurezza"],
          tips: [
            "Mantieni sempre una via di fuga libera durante l'osservazione",
            "Non tentare di calmare o correggere oggi, concentrati solo sull'osservazione",
            "Annota anche il linguaggio del corpo che precede l'aggressività"
          ]
        },
        {
          name: "Protocollo di Sicurezza",
          duration: "15-20 minuti",
          level: "Avanzato",
          description: "Stabilisci procedure di sicurezza chiare per tutti i membri della famiglia. Identifica zone 'no-go' per l'animale quando è agitato. Prepara kit di emergenza con spray distraente (non punitivo), coperta spessa per separazione sicura, e numeri di telefono del veterinario comportamentalista.",
          materials: ["Spray aria compressa", "Coperta spessa", "Guinzaglio lungo", "Contatti emergenza"],
          objectives: ["Garantire sicurezza famiglia", "Preparare gestione crisi", "Ridurre stress situazionale"],
          successCriteria: ["Tutti conoscono il protocollo", "Kit emergenza pronto", "Zone sicure identificate"],
          tips: [
            "Il protocollo non deve mai includere punizioni fisiche o urla",
            "Pratica le procedure quando l'animale è calmo",
            "Comunica chiaramente con tutti i membri della famiglia, inclusi bambini"
          ]
        }
      ]
    }
  ]
};

// PROTOCOLLO 4: CONTROLLO DEGLI IMPULSI (21 giorni, Intermedio)
export const impulseControlProtocol: CompleteProtocol = {
  id: "impulse-control",
  name: "Controllo degli Impulsi",
  description: "Protocollo per animali iperattivi e impulsivi, finalizzato a sviluppare autocontrollo",
  category: "Comportamento",
  difficulty: "intermedio",
  durationDays: 21,
  targetBehaviors: ["iperattività", "impulsività", "saltare", "eccitazione eccessiva"],
  phases: [
    { name: "Fondamenti dell'Autocontrollo", days: "1-7" },
    { name: "Esercizi di Pazienza", days: "8-14" },
    { name: "Applicazione Pratica", days: "15-21" }
  ],
  days: [
    {
      day: 1,
      phase: "Fondamenti dell'Autocontrollo",
      exercises: [
        {
          name: "Esercizio 'Aspetta'",
          duration: "10-15 minuti",
          level: "Intermedio",
          description: "Prepara il cibo dell'animale mentre lui guarda. Tieni la ciotola in alto e di' 'Aspetta' con voce calma ma ferma. Conta mentalmente fino a 3 secondi, poi appoggia la ciotola. Se si precipita, riprendi la ciotola e ripeti. Aumenta gradualmente il tempo di attesa.",
          materials: ["Ciotola del cibo", "Cibo abituale", "Pazienza", "Timer mentale"],
          objectives: ["Sviluppare autocontrollo", "Insegnare attesa per ricompense", "Ridurre impulsività alimentare"],
          successCriteria: ["Aspetta 5 secondi senza muoversi", "Non si precipita verso il cibo", "Risponde al comando verbale"],
          tips: [
            "Non arrabbiarti se all'inizio non riesce, l'autocontrollo si sviluppa gradualmente",
            "Usa il cibo normale, non snack speciali, per evitare sovraeccitazione",
            "Se è troppo eccitato, aspetta che si calmi prima di iniziare l'esercizio"
          ]
        },
        {
          name: "Gioco Controllato",
          duration: "15-20 minuti",
          level: "Intermedio",
          description: "Inizia un gioco che l'animale ama, ma interrompilo ogni 30-60 secondi dicendo 'Stop' e nascondendo il giocattolo. Aspetta che si calmi completamente (seduto o sdraiato) prima di riprendere. Questo insegna che il divertimento continua solo con autocontrollo.",
          materials: ["Giocattolo preferito", "Spazio di gioco", "Comando 'Stop' chiaro"],
          objectives: ["Insegnare controllo durante eccitazione", "Associare calma a continuazione del gioco", "Sviluppare risposta a comandi durante stimolazione"],
          successCriteria: ["Si ferma al comando 'Stop'", "Si calma entro 10 secondi", "Aspetta rilancio del gioco"],
          tips: [
            "Scegli giochi che puoi controllare facilmente (evita rincorse)",
            "Non usare giochi che aumentano troppo l'eccitazione inizialmente",
            "Premia sempre la calma con la ripresa del gioco, non con snack"
          ]
        }
      ]
    }
  ]
};

// PROTOCOLLO 5: GESTIONE DELLE PAURE (21 giorni, Intermedio)
export const fearManagementProtocol: CompleteProtocol = {
  id: "fear-management",
  name: "Gestione delle Paure",
  description: "Protocollo di desensibilizzazione per superare fobie e paure specifiche",
  category: "Comportamento",
  difficulty: "intermedio",
  durationDays: 21,
  targetBehaviors: ["paura", "fobie", "evitamento", "panico"],
  phases: [
    { name: "Identificazione e Sicurezza", days: "1-7" },
    { name: "Desensibilizzazione Graduale", days: "8-14" },
    { name: "Rafforzamento Positivo", days: "15-21" }
  ],
  days: [
    {
      day: 1,
      phase: "Identificazione e Sicurezza",
      exercises: [
        {
          name: "Mappatura delle Paure",
          duration: "25-30 minuti",
          level: "Intermedio",
          description: "Crea una lista dettagliata di tutto ciò che spaventa l'animale, classificando ogni paura da 1 (leggero disagio) a 10 (panico totale). Osserva le reazioni a distanza sicura: tremori, nascondersi, respirazione affannosa, salivazione. Non esporre intenzionalmente alle paure oggi.",
          materials: ["Diario delle paure", "Scala di valutazione", "Ambiente controllato"],
          objectives: ["Catalogare tutte le paure", "Valutare intensità reazioni", "Pianificare approccio graduale"],
          successCriteria: ["Almeno 5 paure identificate", "Intensità valutata correttamente", "Piano di desensibilizzazione abbozzato"],
          tips: [
            "Osserva in momenti diversi della giornata per paure situazionali",
            "Includi paure verso oggetti, suoni, persone e situazioni",
            "Non forzare mai l'esposizione durante questa fase di valutazione"
          ]
        },
        {
          name: "Creazione Rifugio Sicuro",
          duration: "20-25 minuti",
          level: "Intermedio",
          description: "Allestisci uno spazio dove l'animale può rifugiarsi durante episodi di paura. Deve essere un luogo facilmente accessibile, silenzioso, con i suoi oggetti preferiti. Aggiungi coperte per creare un ambiente 'tana'. Questo spazio deve essere sempre rispettato e mai violato.",
          materials: ["Coperte morbide", "Giocattoli rassicuranti", "Ciotola acqua", "Illuminazione soffusa"],
          objectives: ["Creare santuario emotivo", "Fornire controllo sulla situazione", "Ridurre stress di base"],
          successCriteria: ["Animale esplora lo spazio volontariamente", "Rimane rilassato nel rifugio", "Non viene disturbato quando lo usa"],
          tips: [
            "Il rifugio non deve mai essere usato come punizione o isolamento forzato",
            "Posizionalo lontano da fonti di rumore e passaggio frequente",
            "Mantieni sempre lo stesso posto per creare prevedibilità"
          ]
        }
      ]
    }
  ]
};

// PROTOCOLLO 6: SOCIALIZZAZIONE (28 giorni, Intermedio)
export const socializationProtocol: CompleteProtocol = {
  id: "socialization",
  name: "Socializzazione",
  description: "Protocollo per migliorare le competenze sociali con altri animali e persone",
  category: "Sociale",
  difficulty: "intermedio",
  durationDays: 28,
  targetBehaviors: ["timidezza", "aggressività sociale", "isolamento", "paura degli estranei"],
  phases: [
    { name: "Costruzione Fiducia", days: "1-10" },
    { name: "Esposizione Graduale", days: "11-21" },
    { name: "Interazione Attiva", days: "22-28" }
  ],
  days: [
    {
      day: 1,
      phase: "Costruzione Fiducia",
      exercises: [
        {
          name: "Rinforzo dell'Autostima",
          duration: "15-20 minuti",
          level: "Intermedio",
          description: "Dedica tempo esclusivo all'animale facendo attività che gli piacciono e in cui riesce bene. Può essere il suo gioco preferito, comandi che conosce già, o semplicemente carezze rilassanti. L'obiettivo è aumentare la sua sicurezza in se stesso attraverso esperienze positive.",
          materials: ["Giocattoli preferiti", "Snack motivanti", "Spazio tranquillo", "Attenzione dedicata"],
          objectives: ["Aumentare autostima", "Rafforzare legame umano-animale", "Creare stato emotivo positivo"],
          successCriteria: ["Mostra segni di gioia e rilassamento", "Cerca attivamente l'interazione", "Postura corporea aperta e fiduciosa"],
          tips: [
            "Concentrati su ciò che l'animale fa bene, non su ciò che deve imparare",
            "Usa il suo linguaggio del corpo per capire cosa gli piace di più",
            "Evita situazioni stressanti o sfidanti durante questo periodo di costruzione fiducia"
          ]
        },
        {
          name: "Osservazione Sociale Passiva",
          duration: "10-15 minuti",
          level: "Intermedio",
          description: "Porta l'animale in un luogo dove può osservare altri animali o persone da distanza sicura (es. panchina in parco). Non forzare interazioni, lascia che osservi semplicemente. Premia la calma e la curiosità positiva. Se mostra stress, aumenta la distanza.",
          materials: ["Guinzaglio lungo", "Snack calmanti", "Posizione di osservazione sicura"],
          objectives: ["Abituare alla presenza di altri", "Ridurre reattività", "Insegnare che altri non sono minacce"],
          successCriteria: ["Osserva senza agitarsi", "Accetta premi durante l'osservazione", "Postura rilassata o curiosa"],
          tips: [
            "Mantieni sempre una distanza che permette all'animale di rimanere sotto soglia di stress",
            "Non avvicinarti ad altri animali durante questa fase",
            "Termina l'esercizio mentre l'animale è ancora calmo e positivo"
          ]
        }
      ]
    }
  ]
};

// PROTOCOLLO 7: COMPORTAMENTI DISTRUTTIVI (21 giorni, Intermedio)
export const destructiveBehaviorsProtocol: CompleteProtocol = {
  id: "destructive-behaviors",
  name: "Comportamenti Distruttivi",
  description: "Protocollo per gestire masticazione, scavo e altri comportamenti distruttivi",
  category: "Comportamento",
  difficulty: "intermedio",
  durationDays: 21,
  targetBehaviors: ["masticazione distruttiva", "scavo", "graffi", "distruzione oggetti"],
  phases: [
    { name: "Analisi e Prevenzione", days: "1-7" },
    { name: "Reindirizzamento", days: "8-14" },
    { name: "Consolidamento Positivo", days: "15-21" }
  ],
  days: [
    {
      day: 1,
      phase: "Analisi e Prevenzione",
      exercises: [
        {
          name: "Analisi delle Cause",
          duration: "20-30 minuti",
          level: "Intermedio",
          description: "Identifica quando e perché avvengono i comportamenti distruttivi: noia, ansia da separazione, dentizione, territorio? Osserva pattern temporali, oggetti preferiti per la distruzione, stato emotivo dell'animale prima dell'episodio. Annota tutto in un diario comportamentale.",
          materials: ["Diario comportamentale", "Penna", "Macchina fotografica per danni"],
          objectives: ["Identificare cause scatenanti", "Comprendere pattern comportamentali", "Pianificare interventi mirati"],
          successCriteria: ["Almeno 3 cause identificate", "Pattern temporali riconosciuti", "Correlazioni comportamentali evidenziate"],
          tips: [
            "Non limitarti a osservare i danni, cerca di capire il 'perché' dietro il comportamento",
            "Considera fattori ambientali: rumori, cambiamenti, presenza/assenza di persone",
            "Nota se la distruzione avviene solo in tua assenza o anche quando sei presente"
          ]
        },
        {
          name: "Messa in Sicurezza Ambiente",
          duration: "15-25 minuti",
          level: "Intermedio",
          description: "Rimuovi o proteggi tutti gli oggetti di valore che potrebbero essere distrutti. Usa spray deterrenti naturali (agrumi) su mobili, nascondi cavi elettrici, sposta scarpe e oggetti personali. L'obiettivo è prevenire danni mentre lavori sulla modifica comportamentale.",
          materials: ["Spray deterrente naturale", "Protezioni per cavi", "Contenitori sicuri", "Barriere fisiche"],
          objectives: ["Prevenire ulteriori danni", "Ridurre opportunità di rinforzo negativo", "Creare ambiente sicuro"],
          successCriteria: ["Tutti gli oggetti di valore protetti", "Nessun nuovo danno per 24 ore", "Ambiente sicuro per l'animale"],
          tips: [
            "Non utilizzare mai prodotti chimici tossici come deterrenti",
            "La prevenzione è temporanea, non risolve il problema alla radice",
            "Mantieni comunque oggetti appropriati per masticare o graffiare disponibili"
          ]
        }
      ]
    }
  ]
};

// PROTOCOLLO 8: ANSIA DA SEPARAZIONE (28 giorni, Avanzato)
export const separationAnxietyProtocol: CompleteProtocol = {
  id: "separation-anxiety",
  name: "Ansia da Separazione",
  description: "Protocollo specializzato per animali che soffrono quando lasciati soli",
  category: "Comportamento",
  difficulty: "avanzato",
  durationDays: 28,
  targetBehaviors: ["ansia separazione", "distruzione in assenza", "vocalizzazioni eccessive", "eliminazione inappropriata"],
  phases: [
    { name: "Costruzione Indipendenza", days: "1-10" },
    { name: "Desensibilizzazione Partenza", days: "11-21" },
    { name: "Gestione Separazioni Lunghe", days: "22-28" }
  ],
  days: [
    {
      day: 1,
      phase: "Costruzione Indipendenza",
      exercises: [
        {
          name: "Esercizi di Indipendenza in Casa",
          duration: "10-20 minuti",
          level: "Avanzato",
          description: "Mentre sei in casa, incoraggia l'animale a stare in stanze diverse da te. Inizia sedendoti in una stanza mentre lui è nella stanza accanto, con porte aperte. Gradualmente aumenta la distanza fisica pur rimanendo in casa. Premia quando rimane calmo da solo.",
          materials: ["Giocattoli interessanti", "Snack lunga durata", "Spazi comodi per l'animale"],
          objectives: ["Sviluppare indipendenza graduale", "Ridurre dipendenza dalla presenza umana", "Creare comfort nell'essere soli"],
          successCriteria: ["Rimane calmo in stanza separata", "Non segue ossessivamente", "Trova occupazioni autonome"],
          tips: [
            "Non fare mai partenze drammatiche o ritorni eccessivamente eccitanti",
            "Ignora completamente comportamenti di ricerca di attenzione",
            "Premia solo quando l'animale è calmo e indipendente"
          ]
        },
        {
          name: "Routine Pre-Partenza Neutra",
          duration: "5-10 minuti",
          level: "Avanzato",
          description: "Pratica tutti i gesti che fai prima di uscire (prendere chiavi, indossare giacca, prendere borsa) senza effettivamente uscire. Fallo più volte al giorno in momenti casuali. L'obiettivo è che questi gesti non scatenino più ansia perché non sempre significano partenza.",
          materials: ["Chiavi", "Giacca", "Borsa", "Scarpe"],
          objectives: ["Desensibilizzare ai segnali di partenza", "Ridurre ansia anticipatoria", "Rendere neutri i preparativi"],
          successCriteria: ["Non mostra agitazione ai preparativi", "Rimane rilassato durante i gesti", "Non anticipa la partenza"],
          tips: [
            "Varia l'ordine dei preparativi per evitare che impari una sequenza specifica",
            "Fallo anche quando non hai intenzione di uscire",
            "Non consolare mai l'animale se mostra ansia durante questi esercizi"
          ]
        }
      ]
    }
  ]
};

// PROTOCOLLO 9: TRAINING AVANZATO (35 giorni, Avanzato)
export const advancedTrainingProtocol: CompleteProtocol = {
  id: "advanced-training",
  name: "Training Avanzato",
  description: "Protocollo per animali che hanno già le basi e vogliono imparare comandi complessi",
  category: "Addestramento",
  difficulty: "avanzato",
  durationDays: 35,
  targetBehaviors: ["comandi complessi", "sequenze", "problem solving", "precisione"],
  phases: [
    { name: "Consolidamento Basi", days: "1-10" },
    { name: "Introduzione Comandi Complessi", days: "11-25" },
    { name: "Perfezionamento e Sequenze", days: "26-35" }
  ],
  days: [
    {
      day: 1,
      phase: "Consolidamento Basi",
      exercises: [
        {
          name: "Test di Valutazione Competenze",
          duration: "20-30 minuti",
          level: "Avanzato",
          description: "Valuta la precisione e velocità di risposta ai comandi base: seduto, resta, vieni, terra, lascia. Ogni comando deve essere eseguito entro 3 secondi e mantenuto per almeno 10 secondi. Testa anche il richiamo da distanze crescenti e con distrazioni minime.",
          materials: ["Cronometro", "Metro per distanze", "Snack di valore", "Distrazioni controllate"],
          objectives: ["Valutare livello attuale", "Identificare aree di miglioramento", "Stabilire baseline per progressi"],
          successCriteria: ["80% comandi eseguiti correttamente", "Risposta entro 3 secondi", "Mantiene comandi per 10+ secondi"],
          tips: [
            "Non abbassare i criteri se l'animale non supera il test, potrebbe non essere pronto per training avanzato",
            "Testa in diverse condizioni: casa, giardino, con distrazioni lievi",
            "Annota precisamente i risultati per monitorare progressi futuri"
          ]
        },
        {
          name: "Perfezionamento della Precisione",
          duration: "15-25 minuti",
          level: "Avanzato",
          description: "Lavora sulla precisione dei comandi base. Per 'seduto', l'animale deve sedersi perfettamente dritto. Per 'terra', deve sdraiarsi completamente. Per 'resta', non deve muovere nemmeno le zampe. Premia solo esecuzioni perfette, ignora quelle approssimative.",
          materials: ["Snack di alto valore", "Spazio con riferimenti visivi", "Pazienza infinita"],
          objectives: ["Aumentare precisione esecuzione", "Sviluppare attenzione ai dettagli", "Preparare per comandi complessi"],
          successCriteria: ["Esecuzione precisa 9 volte su 10", "Posizioni mantenute stabilmente", "Correzioni spontanee se impreciso"],
          tips: [
            "La precisione richiede tempo, non frettare i risultati",
            "Usa il rinforzo positivo differenziale: premi di più le esecuzioni migliori",
            "Se l'animale si frustra, torna a criteri più semplici temporaneamente"
          ]
        }
      ]
    }
  ]
};

// PROTOCOLLO 10: CALMARE L'AGITAZIONE (14 giorni, Principiante)
export const calmingProtocol: CompleteProtocol = {
  id: "calming-agitation",
  name: "Calmare l'Agitazione",
  description: "Protocollo rapido per ridurre stati di agitazione e ipereccitazione",
  category: "Benessere",
  difficulty: "principiante",
  durationDays: 14,
  targetBehaviors: ["agitazione", "ipereccitazione", "stress acuto", "irrequietezza"],
  phases: [
    { name: "Tecniche di Calma Immediata", days: "1-7" },
    { name: "Consolidamento e Prevenzione", days: "8-14" }
  ],
  days: [
    {
      day: 1,
      phase: "Tecniche di Calma Immediata",
      exercises: [
        {
          name: "Respirazione Sincronizzata",
          duration: "10-15 minuti",
          level: "Principiante",
          description: "Siediti accanto al tuo animale domestico e inizia a respirare lentamente e profondamente. Gli animali tendono a sincronizzare il loro ritmo respiratorio con quello del proprietario. Inspira per 4 secondi, trattieni per 2, espira per 6 secondi. Mantieni questa routine mentre osservi se l'animale rallenta la sua respirazione. Non forzare il contatto fisico se l'animale è agitato, ma rimani nelle vicinanze mantenendo un'energia calma e centrata.",
          materials: ["Spazio tranquillo", "Superficie comoda per sedersi", "Timer silenzioso", "Ambiente senza distrazioni"],
          objectives: ["Sincronizzare i ritmi respiratori", "Trasmettere calma attraverso la presenza", "Attivare risposta di rilassamento del sistema nervoso"],
          successCriteria: ["L'animale rallenta visibilmente la respirazione", "Riduzione dei movimenti frenetici", "Postura più rilassata entro 10 minuti"],
          tips: [
            "Pratica prima tu stesso la tecnica di respirazione per essere naturale nell'esecuzione",
            "Non guardare direttamente l'animale agitato, poiché potrebbe interpretarlo come confronto",
            "Se l'animale si allontana, continua l'esercizio dove sei, spesso tornerà da solo"
          ]
        },
        {
          name: "Massaggio Calmante Punti Specifici",
          duration: "8-12 minuti",
          level: "Principiante",
          description: "Concentrati su tre punti specifici: la base delle orecchie (massaggia con movimenti circolari molto delicati), il centro del petto (pressione leggera con il palmo della mano), e la base del collo. Ogni punto va massaggiato per 2-3 minuti con pressione molto leggera. Fermati immediatamente se l'animale mostra segni di fastidio.",
          materials: ["Mani pulite e calde", "Olio di cocco (facoltativo)", "Ambiente silenzioso"],
          objectives: ["Stimolare punti di rilassamento", "Ridurre tensione muscolare", "Rilasciare endorfine naturali"],
          successCriteria: ["L'animale non si allontana dal tocco", "Muscoli si rilassano sotto le dita", "Postura generale diventa meno rigida"],
          tips: [
            "Riscalda sempre le mani prima di iniziare per evitare sobbalzi",
            "Inizia con tocchi ancora più leggeri e aumenta gradualmente la pressione solo se ben tollerata",
            "Alcune specie preferiscono il massaggio in momenti specifici della giornata"
          ]
        },
        {
          name: "Distrazione Positiva Controllata",
          duration: "5-10 minuti",
          level: "Principiante",
          description: "Utilizza un'attività che richiede concentrazione ma che l'animale trova piacevole. Può essere annusare snack nascosti in un tappetino per il foraggiamento, masticare un gioco specifico, o seguire un giocattolo che si muove lentamente. L'obiettivo è reindirizzare l'energia nervosa verso un'attività costruttiva.",
          materials: ["Tappetino per foraggiamento", "Snack odorosi", "Giocattoli da masticare sicuri", "Giocattolo interattivo"],
          objectives: ["Reindirizzare energia nervosa", "Stimolare concentrazione positiva", "Ridurre comportamenti frenetici"],
          successCriteria: ["Si concentra sull'attività per almeno 3 minuti", "Riduzione dei comportamenti ripetitivi", "Sembra trovare piacere nell'attività"],
          tips: [
            "Scegli attività che già conosce e ama per garantire successo immediato",
            "Non introdurre giochi nuovi durante stati di agitazione",
            "Se ignora l'attività, non insistere: potrebbe essere troppo agitato per concentrarsi"
          ]
        }
      ]
    },
    {
      day: 2,
      phase: "Tecniche di Calma Immediata",
      exercises: [
        {
          name: "Tecnica del Contenimento Sicuro",
          duration: "5-15 minuti",
          level: "Principiante",
          description: "Crea un piccolo spazio accogliente utilizzando cuscini o coperte, sufficientemente grande per l'animale ma abbastanza piccolo da farlo sentire protetto. Questo simula la sensazione di sicurezza di una tana. Non forzare l'animale dentro, ma incoraggialo dolcemente mostrando snack o giocattoli all'interno.",
          materials: ["Coperte morbide", "Cuscini", "Snack motivanti", "Giocattolo rassicurante"],
          objectives: ["Creare senso di sicurezza", "Ridurre stimoli esterni", "Fornire rifugio emotivo"],
          successCriteria: ["Entra volontariamente nello spazio", "Rimane almeno 3 minuti", "Mostra segni di rilassamento"],
          tips: [
            "Non chiudere mai l'animale nello spazio, deve poter uscire liberamente",
            "Usa tessuti che portano il tuo odore per aumentare la sensazione di sicurezza",
            "Rispetta questo spazio anche dopo l'esercizio: deve rimanere sempre disponibile"
          ]
        }
      ]
    }
  ]
};

// PROTOCOLLO 11: TRAINING DI CALMA AVANZATO (21 giorni, Avanzato)
export const advancedCalmTrainingProtocol: CompleteProtocol = {
  id: "advanced-calm-training",
  name: "Training di Calma Avanzato",
  description: "Esercizi per mantenere la calma in situazioni di stress crescente.",
  category: "Comportamento",
  difficulty: "avanzato",
  durationDays: 21,
  targetBehaviors: ["calma", "controllo stress", "resilienza"],
  phases: [
    { name: "Fondamenti di Calma", days: "1-7" },
    { name: "Gestione Distrazioni", days: "8-14" },
    { name: "Calma Avanzata", days: "15-21" }
  ],
  days: [
    {
      day: 1,
      phase: "Fondamenti di Calma",
      exercises: [
        {
          name: "Training di Calma Avanzato",
          duration: "30 minuti",
          level: "Avanzato",
          description: "Esercizi per mantenere la calma in situazioni di stress crescente.",
          materials: ["Ambiente controllabile", "Distrazioni graduate", "Premi ad alto valore"],
          objectives: ["Mantenere calma sotto stress", "Aumentare resilienza", "Sviluppare autocontrollo"],
          successCriteria: ["Rimane calmo per 30 minuti", "Tollera distrazioni crescenti", "Risponde al comando 'calmo'"],
          instructions: [
            "PREPARA ambiente silenzioso con TAPPETO COMODO",
            "POSIZIONA pet sul tappeto, SIEDITI a 1 metro di distanza", 
            "PRONUNCIA 'calmo' quando pet è rilassato, PREMIA immediatamente",
            "INTRODUCI distrazioni graduali (SUONI BASSI → rumori domestici)",
            "AUMENTA durata: 5 min → 10 min → 15 min → 30 min PROGRESSIVAMENTE",
            "PREMIA solo stati di CALMA COMPLETA, IGNORA agitazione",
            "TERMINA con pet calmo, RIDUCI distrazioni gradualmente",
            "MONITORA segnali stress, ADATTA intensità se necessario"
          ],
          tips: [
            "PREPARA ambiente silenzioso con TAPPETO COMODO",
            "POSIZIONA pet sul tappeto, SIEDITI a 1 metro di distanza", 
            "PRONUNCIA 'calmo' quando pet è rilassato, PREMIA immediatamente",
            "INTRODUCI distrazioni graduali (SUONI BASSI → rumori domestici)",
            "AUMENTA durata: 5 min → 10 min → 15 min → 30 min PROGRESSIVAMENTE",
            "PREMIA solo stati di CALMA COMPLETA, IGNORA agitazione",
            "TERMINA con pet calmo, RIDUCI distrazioni gradualmente",
            "MONITORA segnali stress, ADATTA intensità se necessario"
          ]
        }
      ]
    }
  ]
};

// Template per generare tutti i protocolli
export const allProtocols = {
  ansietyManagement: ansietyManagementProtocol,
  basicObedience: basicObedienceProtocol,
  aggressionControl: aggressionControlProtocol,
  impulseControl: impulseControlProtocol,
  fearManagement: fearManagementProtocol,
  socialization: socializationProtocol,
  destructiveBehaviors: destructiveBehaviorsProtocol,
  separationAnxiety: separationAnxietyProtocol,
  advancedTraining: advancedTrainingProtocol,
  calmingAgitation: calmingProtocol,
  advancedCalmTraining: advancedCalmTrainingProtocol
};

// Funzione per raccomandare protocolli basati sull'analisi dell'umore
export const getRecommendedProtocol = (analysisResults: string[]): string | null => {
  const negativeKeywords = analysisResults.map(result => result.toLowerCase());
  
  if (negativeKeywords.some(keyword => ['ansia', 'stress', 'nervoso', 'tensione'].includes(keyword))) {
    return 'anxiety-management';
  }
  
  if (negativeKeywords.some(keyword => ['aggressivo', 'aggressività', 'ringhio', 'morso'].includes(keyword))) {
    return 'aggression-control';
  }
  
  if (negativeKeywords.some(keyword => ['iperattivo', 'eccitato', 'irrequieto', 'salta'].includes(keyword))) {
    return 'impulse-control';
  }
  
  if (negativeKeywords.some(keyword => ['paura', 'pauroso', 'fobia', 'spavento'].includes(keyword))) {
    return 'fear-management';
  }
  
  if (negativeKeywords.some(keyword => ['disobbediente', 'non ascolta', 'ignorante'].includes(keyword))) {
    return 'basic-obedience';
  }
  
  if (negativeKeywords.some(keyword => ['distruttivo', 'mastica', 'rompe', 'graffia'].includes(keyword))) {
    return 'destructive-behaviors';
  }
  
  // Se l'analisi mostra risultati positivi, non raccomandare protocolli
  if (negativeKeywords.some(keyword => ['felice', 'calmo', 'equilibrato', 'sereno'].includes(keyword))) {
    return null;
  }
  
  return null;
};