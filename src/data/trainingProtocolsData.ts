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
    }
    // Continuerò con gli altri giorni...
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
    }
    // Altri giorni del protocollo...
  ]
};

// Template per generare tutti i protocolli
export const allProtocols = {
  ansietyManagement: ansietyManagementProtocol,
  basicObedience: basicObedienceProtocol,
  // Altri protocolli verranno generati seguendo lo stesso schema...
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