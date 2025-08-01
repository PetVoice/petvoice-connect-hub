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
          name: "Mappatura Comportamentale Iniziale",
          duration: "25-30 minuti",
          level: "Intermedio",
          description: "Osserva e documenta tutti i comportamenti ansiosi del tuo pet per 30 minuti usando una griglia comportamentale. Annota frequenza, intensità (scala 1-10), durata e trigger specifici. Non intervenire, solo osserva. Crea una mappa termica dei luoghi dove l'ansia è più frequente. Registra orari di picco e momenti di calma relativa.",
          materials: ["Griglia comportamentale prestampata", "Cronometro silenzioso", "Matita morbida", "Cartina casa/giardino", "Termometro stress"],
          objectives: ["Creare baseline comportamentale accurata", "Identificare pattern ansiosi nascosti", "Stabilire metriche di progresso obiettive"],
          successCriteria: ["Completata griglia per 30 minuti", "Identificati almeno 3 trigger specifici", "Documentate 5+ manifestazioni ansiose"],
          tips: [
            "Usa un linguaggio neutro nelle annotazioni, evita interpretazioni emotive",
            "Registra anche micro-comportamenti: movimenti delle orecchie, respirazione, postura della coda",
            "Se l'animale nota la tua osservazione, fingi di leggere o fare altro"
          ]
        },
        {
          name: "Installazione Zona Rifugio Sensoriale",
          duration: "20-25 minuti",
          level: "Intermedio", 
          description: "Costruisci una zona rifugio multisensoriale usando principi di design terapeutico. Posiziona tessuti con texture diverse, installa illuminazione soffusa regolabile, crea barriere acustiche con materiali assorbenti. Aggiungi elementi olfattivi calmanti e una superficie termoregolata. Testa l'accettazione graduale senza forzare l'ingresso.",
          materials: ["Tessuti texture multiple", "Lampada dimmerabile LED", "Pannelli fonoassorbenti", "Diffusore aromi naturali", "Tappeto termico programmabile", "Barriere visive mobili"],
          objectives: ["Creare ambiente neuroriabilitativo", "Stimolare risposte parasimpatiche", "Offrire controllo ambientale all'animale"],
          successCriteria: ["Zona completamente allestita", "Animale esplora per 2+ minuti", "Nessun segno di stress durante installazione"],
          tips: [
            "Costruisci la zona gradualmente in 3 sessioni per non sovraccaricare",
            "Testa ogni elemento sensoriale separatamente prima di combinare",
            "Posiziona entrate multiple per evitare sensazione di intrappolamento"
          ]
        },
        {
          name: "Protocollo Sincronizzazione Respiratoria Avanzata",
          duration: "15-20 minuti",
          level: "Intermedio",
          description: "Applica tecniche di respirazione coscienti modificate per animali. Siediti a 1.5 metri dall'animale, inizia con ritmo respiratorio 4-4-6 (inspirazione-pausa-espirazione). Gradualmente rallenta a 6-4-8 monitorando la sincronizzazione. Usa visualizzazioni colorate mentali durante l'esercizio. Registra variazioni nella frequenza respiratoria dell'animale con stethoscopio.",
          materials: ["Stetoscopio veterinario", "Metronomo silenzioso", "Cronometro con vibrazione", "Diario respiratorio", "Cuscino meditazione"],
          objectives: ["Indurre coregolazione neurovegetativa", "Attivare riflesso di rilassamento condizionato", "Creare anchoring respiratorio"],
          successCriteria: ["Sincronizzazione per 5+ minuti", "Riduzione 20% freq. respiratoria", "Animale rimane in zona per tutto l'esercizio"],
          tips: [
            "Pratica la tecnica da solo prima per renderla naturale e fluida",
            "Se l'animale iperventila, interrompi e riprendi con ritmi più lenti",
            "Evita contatto visivo diretto durante i primi 5 minuti"
          ]
        }
      ]
    },
    {
      day: 2,
      phase: "Costruzione delle Basi",
      exercises: [
        {
          name: "Sviluppo Comando 'Reset Mentale'",
          duration: "12-18 minuti",
          level: "Intermedio",
          description: "Insegna un comando specifico per interrompere spirali ansiose. Quando l'animale è naturalmente calmo dopo un episodio ansioso, pronuncia 'Reset' con tono specifico (grave, lungo) e premia con snack ad alto valore + carezza specifica. Ripeti ogni transizione naturale ansia→calma. Crea associazione neurologica tra parola e stato di pace.",
          materials: ["Snack premium freeze-dried", "Clicker a tono grave", "Diario stati mentali", "Orologio con timer vibrazione"],
          objectives: ["Creare interruttore neurochimico", "Stabilire controllo verbale su stati emotivi", "Accelerare recupero post-stress"],
          successCriteria: ["Risposta al comando entro 8 secondi", "Mantiene calma per 45+ secondi", "Ricerca il comando quando ansioso"],
          tips: [
            "Non usare mai il comando durante picchi ansiosi, solo nelle transizioni naturali",
            "Varia la tonalità fino a trovare quella più efficace per il tuo animale",
            "Abbina sempre il comando a uno snack speciale che usi solo per questo"
          ]
        },
        {
          name: "Massaggio Neuroterapeutico Mirato",
          duration: "18-25 minuti",
          level: "Intermedio",
          description: "Applica sequenze di massaggio basate sui punti di agopressione veterinaria. Inizia dal punto 'Calming Heaven' dietro le orecchie con pressione rotatoria lenta. Procedi ai punti cervicali C3-C5 con micro-movimenti. Continua sui meridiani principali seguendo mappa specifica. Registra risposte fisiologiche durante ogni sessione.",
          materials: ["Mappa agopressione veterinaria", "Olio di sesamo riscaldato", "Cronometro progressivo", "Termometro infrarossi", "Quaderno risposte"],
          objectives: ["Attivare punti neuroregolatori specifici", "Rilasciare endorfine endogene", "Creare memoria corporea di rilassamento"],
          successCriteria: ["Tollera pressioni per 3+ minuti", "Temperatura corporea diminuisce", "Cerca attivamente il contatto"],
          tips: [
            "Riscalda l'olio a temperatura corporea per evitare shock termici",
            "Applica pressione graduale: inizia leggero e aumenta solo se accettato",
            "Interrompi se noti tremori o tensione eccessiva, riprendi il giorno dopo"
          ]
        },
        {
          name: "Musicoterapia Frequenziale Personalizzata",
          duration: "25-35 minuti",
          level: "Intermedio",
          description: "Crea playlist personalizzata testando diverse frequenze neuroacustiche. Inizia con 432Hz (frequenza della terra), procedi con 528Hz (riparazione DNA), testa 741Hz (pulizia emotiva). Registra reazioni comportamentali per ogni frequenza. Costruisci profilo sonoro individuale. Utilizza cuffie bone-conduction per evitare stress uditivo.",
          materials: ["Generator frequenze app", "Speaker bone-conduction", "Decibel meter", "Scheda reazioni comportamentali", "Cuffie noise-cancelling per te"],
          objectives: ["Identificare frequenze neurologicamente ottimali", "Creare biblioteca sonora personalizzata", "Stabilire protocollo audio-neurologico"],
          successCriteria: ["Identificate 2+ frequenze rilassanti", "Sessione completa senza stress", "Frequenza cardiaca rallenta del 15%"],
          tips: [
            "Mantieni sempre volume sotto 40dB per proteggere udito sensibile",
            "Testa frequenze in giorni diversi per evitare adattamento neurologico",
            "Registra anche orario e condizioni ambientali per pattern completi"
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
          name: "Fondamenta Comando 'Seduto' - Metodo Luring",
          duration: "8-12 minuti",
          level: "Principiante",
          description: "Utilizza la tecnica del luring per insegnare il comando seduto. Posiziona uno snack 2cm sopra il naso dell'animale, muovi lentamente verso la parte posteriore della testa creando un arco. Questo movimento naturale porterà l'animale a sedersi. Pronuncia 'Seduto' esattamente quando il posteriore tocca terra, poi premia immediatamente. Ripeti 6 volte con pause di 30 secondi.",
          materials: ["Snack morbidi 5mm", "Clicker preciso", "Superficie antiscivolo", "Cronometro vibrazione"],
          objectives: ["Stabilire associazione movimento-comando-ricompensa", "Creare muscle memory per posizione seduta", "Introdurre timing perfetto del rinforzo"],
          successCriteria: ["Esecuzione corretta 5/6 volte", "Risposta entro 2 secondi dal gesto", "Mantiene posizione per 3+ secondi"],
          tips: [
            "Mantieni lo snack sempre alla stessa altezza per consistency neuromotoria",
            "Se l'animale salta per afferrare lo snack, abbassa la velocità del movimento",
            "Premia sempre dal basso verso l'alto per rinforzare la posizione seduta"
          ]
        },
        {
          name: "Protocollo Attivazione Nome - Focus Magnetico",
          duration: "6-10 minuti",
          level: "Principiante",
          description: "Sviluppa risposta condizionata al nome attraverso training focus magnetico. Pronuncia il nome con intonazione crescente (da basso a acuto) quando l'animale NON ti sta guardando. Nel momento esatto del contatto visivo, usa clicker + snack premium. Crea pattern neurochimico nome = guardare = ricompensa superiore.",
          materials: ["Clicker professionale", "Snack freeze-dried premium", "Ambiente acusticamente controllato", "Goniometro per angoli visuali"],
          objectives: ["Creare riflesso condizionato nome-sguardo", "Stabilire valore supremo del contatto visivo", "Costruire base per tutti i comandi futuri"],
          successCriteria: ["Orientamento entro 1.5 secondi", "Contatto visivo mantenuto 3+ secondi", "Risposta da angoli 180° di distanza"],
          tips: [
            "Non chiamare mai il nome quando l'animale è già attento a te",
            "Varia l'intonazione ma mantieni sempre crescente per creare aspettativa positiva", 
            "Se non risponde dopo 2 chiamate, cambia posizione e riprova dopo 2 minuti"
          ]
        },
        {
          name: "Sistema Rinforzo Differenziale - Escalation Premi",
          duration: "12-18 minuti",
          level: "Principiante",
          description: "Implementa sistema di rinforzo a gradualità crescente. Identifica 5 comportamenti target spontanei dell'animale (sedersi, guardarti, stare calmo, avvicinarsi, toccarti). Assegna valore progressivo: comportamento base = snack normale, eccellente = snack premium + lodi entusiastiche + carezza speciale. Crea gerarchia motivazionale chiara.",
          materials: ["5 tipologie snack valore crescente", "Tabella comportamenti target", "Timer intervalli variabili", "Registro rinforzi"],
          objectives: ["Stabilire sistema motivazionale stratificato", "Aumentare qualità comportamenti spontanei", "Creare anticipazione e ricerca attiva di premi"],
          successCriteria: ["Riconosce differenze valore premi", "Intensifica comportamenti più premiati", "Cerca attivamente comportamenti target"],
          tips: [
            "Non premiare mai comportamento mediocre con premio alto o creerai confusione",
            "Mantieni ratio 70% premi bassi, 25% medi, 5% premium per creare aspettativa",
            "Registra quale snack genera più entusiasmo per personalizzare la gerarchia"
          ]
        }
      ]
    },
    {
      day: 2,
      phase: "Comandi Base",
      exercises: [
        {
          name: "Comando 'Resta' - Protocollo Distanza Progressiva",
          duration: "10-15 minuti",
          level: "Principiante",
          description: "Sviluppa autocontrollo attraverso distanze progressive e cronometrate. Con animale in posizione seduta solida, alza palmo in posizione STOP a 30cm dal muso. Pronuncia 'Resta' con voce ferma (tono grave costante). Fai MEZZO passo indietro, conta 2 secondi, torna, premia. Incrementa: 1 passo (3 sec), 1.5 passi (5 sec), 2 passi (7 sec).",
          materials: ["Cronometro silenzioso", "Nastro metrico", "Snack valore alto", "Superficie demarcata"],
          objectives: ["Costruire controllo impulsi graduali", "Estendere durata concentrazione", "Creare fiducia in comando di attesa"],
          successCriteria: ["Resta fermo durante allontanamento", "Mantiene posizione tempo richiesto", "Non anticipa rilascio comando"],
          tips: [
            "Non accelerare progressione se non padroneggia step precedente",
            "Usa sempre stessa gestualità: palmo STOP + voce + movimento backward identico",
            "Se rompe il 'resta', torna immediatamente a distanza precedente di successo"
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

// PROTOCOLLO 12: MIGLIORAMENTO DELL'UMORE (21 giorni, Intermedio)
export const moodEnhancementProtocol: CompleteProtocol = {
  id: "mood-enhancement",
  name: "Superare la Tristezza",
  description: "Protocollo per stimolare l'umore e aumentare l'energia del pet attraverso attività coinvolgenti e socializzazione",
  category: "Benessere",
  difficulty: "facile",
  durationDays: 15,
  targetBehaviors: ["tristezza", "apatia", "depressione", "svogliatezza", "melanconico"],
  phases: [
    { name: "Attivazione Energetica", days: "1-5" },
    { name: "Stimolazione Sociale", days: "6-10" },
    { name: "Consolidamento Positivo", days: "11-15" }
  ],
  days: [
    {
      day: 1,
      phase: "Attivazione Energetica",
      exercises: [
        {
          name: "Stimolazione Sensoriale Positiva",
          duration: "15-20 minuti",
          level: "Facile",
          description: "Crea esperienze sensoriali piacevoli per riattivare l'interesse dell'animale. Usa profumi naturali (erba gatta per gatti, odori di cibo preferito), texture diverse (tessuti morbidi, superfici fredde), suoni rilassanti (musica classica a basso volume). Osserva quali stimoli catturano la sua attenzione e costruisci su quelli.",
          materials: ["Erba gatta o odori preferiti", "Tessuti di texture diverse", "Musica rilassante", "Snack odorosi"],
          objectives: ["Risvegliare interesse sensoriale", "Stimolare curiosità naturale", "Creare associazioni positive"],
          successCriteria: ["Mostra interesse per almeno 2 stimoli", "Interagisce volontariamente", "Postura più attenta e vigile"],
          tips: [
            "Non sovraccaricare con troppi stimoli insieme, introduce uno alla volta",
            "Presta attenzione ai segnali di gradimento: avvicinamento, annusare, toccare",
            "Ripeti gli stimoli che hanno ottenuto risposta positiva nei giorni seguenti"
          ]
        },
        {
          name: "Gioco Dolce e Incoraggiante",
          duration: "10-15 minuti",
          level: "Facile",
          description: "Proponi giochi molto semplici che l'animale può 'vincere' facilmente per aumentare la sua autostima. Nascondi snack in luoghi facili da trovare, lancia giocattoli morbidi a distanza ravvicinata, o semplicemente trascina una corda lentamente. L'obiettivo è il successo garantito e il divertimento senza frustrazione.",
          materials: ["Snack piccoli e appetitosi", "Giocattoli morbidi", "Corda o nastro", "Spazi di gioco sicuri"],
          objectives: ["Aumentare autostima attraverso successi", "Riattivare istinto di gioco", "Creare momenti di gioia"],
          successCriteria: ["Partecipa attivamente al gioco", "Mostra segni di divertimento", "Cerca di continuare l'attività"],
          tips: [
            "Celebra ogni piccolo successo con entusiasmo genuino",
            "Se sembra stanco o disinteressato, accorcia la sessione ma mantieni la frequenza",
            "Termina sempre mentre l'animale è ancora interessato, non aspettare che si annoi"
          ]
        }
      ]
    },
    {
      day: 2,
      phase: "Attivazione Energetica",
      exercises: [
        {
          name: "Routine di Attivazione Mattutina",
          duration: "10-12 minuti",
          level: "Facile",
          description: "Crea una routine energizzante da fare ogni mattina: aprire tende per far entrare luce naturale, mettere musica allegra a volume basso, preparare una colazione speciale, fare stretching dolce insieme. La routine deve essere prevedibile e sempre positiva.",
          materials: ["Finestre con buona esposizione", "Playlist musicale allegra", "Cibo speciale mattutino"],
          objectives: ["Stabilire inizio giornata positivo", "Aumentare esposizione alla luce", "Creare aspettative positive"],
          successCriteria: ["Anticipa la routine con interesse", "Energia aumenta durante le attività", "Umore migliora nel corso della mattinata"],
          tips: [
            "Mantieni la routine anche nei fine settimana per consistency",
            "Adatta gli orari ai ritmi naturali dell'animale",
            "La luce naturale è fondamentale per regolare i ritmi circadiani"
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
  advancedCalmTraining: advancedCalmTrainingProtocol,
  moodEnhancement: moodEnhancementProtocol
};

// Funzione per raccomandare protocolli basati sull'analisi dell'umore
export const getRecommendedProtocol = (analysisResults: string[]): string | null => {
  const negativeKeywords = analysisResults.map(result => result.toLowerCase());
  
  // ANSIA e STRESS
  if (negativeKeywords.some(keyword => ['ansia', 'stress', 'nervoso', 'tensione', 'agitato', 'inquieto', 'preoccupato'].includes(keyword))) {
    return 'anxiety-management';
  }
  
  // AGGRESSIVITÀ
  if (negativeKeywords.some(keyword => ['aggressivo', 'aggressività', 'ringhio', 'morso', 'attacco', 'minaccioso', 'territoriale'].includes(keyword))) {
    return 'aggression-control';
  }
  
  // IPERATTIVITÀ e IMPULSI
  if (negativeKeywords.some(keyword => ['iperattivo', 'eccitato', 'irrequieto', 'salta', 'impulsivo', 'incontrollabile', 'frenetico'].includes(keyword))) {
    return 'impulse-control';
  }
  
  // PAURA e FOBIE
  if (negativeKeywords.some(keyword => ['paura', 'pauroso', 'fobia', 'spavento', 'timido', 'terrorizzato', 'ansioso'].includes(keyword))) {
    return 'fear-management';
  }
  
  // TRISTEZZA e DEPRESSIONE
  if (negativeKeywords.some(keyword => ['tristezza', 'triste', 'depresso', 'depressione', 'apatia', 'svogliato', 'melanconico', 'demoralizzato', 'abbattuto', 'scoraggiato'].includes(keyword))) {
    return 'mood-enhancement';
  }
  
  // DISOBBEDIENZA
  if (negativeKeywords.some(keyword => ['disobbediente', 'non ascolta', 'ignorante', 'ribelle', 'testardo', 'indisciplinato'].includes(keyword))) {
    return 'basic-obedience';
  }
  
  // COMPORTAMENTI DISTRUTTIVI
  if (negativeKeywords.some(keyword => ['distruttivo', 'mastica', 'rompe', 'graffia', 'distrugge', 'vandalo', 'danneggia'].includes(keyword))) {
    return 'destructive-behaviors';
  }
  
  // ANSIA DA SEPARAZIONE
  if (negativeKeywords.some(keyword => ['separazione', 'abbandono', 'solo', 'piange quando parti', 'distruttivo quando solo'].includes(keyword))) {
    return 'separation-anxiety';
  }
  
  // PROBLEMI DI SOCIALIZZAZIONE
  if (negativeKeywords.some(keyword => ['antisociale', 'isolato', 'evita altri animali', 'non socializza', 'ritirato'].includes(keyword))) {
    return 'socialization';
  }
  
  // AGITAZIONE GENERALE
  if (negativeKeywords.some(keyword => ['agitazione', 'irrequietezza', 'nervosismo', 'tensione', 'irritabilità'].includes(keyword))) {
    return 'calming-agitation';
  }
  
  // Se l'analisi mostra risultati positivi, non raccomandare protocolli
  if (negativeKeywords.some(keyword => ['felice', 'calmo', 'equilibrato', 'sereno', 'tranquillo', 'rilassato'].includes(keyword))) {
    return null;
  }
  
  // Default: se ci sono parole negative generiche, raccomanda gestione ansia
  if (negativeKeywords.some(keyword => ['negativo', 'problematico', 'difficile', 'preoccupante'].includes(keyword))) {
    return 'anxiety-management';
  }
  
  return null;
};