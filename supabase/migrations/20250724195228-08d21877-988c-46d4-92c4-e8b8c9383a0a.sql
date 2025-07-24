-- 1. Corregge l'incoerenza di livello: allinea il difficulty del protocollo con il level degli esercizi
UPDATE ai_training_protocols 
SET difficulty = 'facile'
WHERE title = 'Chiarezza Mentale' AND difficulty != 'facile';

-- 2. Aggiorna tutti gli esercizi con istruzioni dettagliate passo-passo numerati
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  'POSIZIONAMENTO STRATEGICO: Siediti a 1 metro dal pet agitato, alla sua altezza. Non stare in piedi che può intimidire.',
  'RESPIRAZIONE VISIBILE: Respira profondamente e lentamente, rendendo il respiro udibile ma non esagerato. 4 secondi inspira, 6 espira.',
  'CONTATTO VISIVO DOLCE: Guarda il pet con occhi rilassati, lampeggia lentamente. Questo è linguaggio calmante per gli animali.',
  'SINCRONIZZAZIONE GRADUALE: Dopo 2-3 minuti, il pet inizierà a sincronizzare il suo respiro con il tuo. È un processo naturale.',
  'DURATA ADEGUATA: Continua per almeno 10 minuti anche se il pet sembra calmarsi prima. La calma deve stabilizzarsi.',
  'TRANSIZIONE DOLCE: Non alzarti bruscamente alla fine. Movimento lenti, voce bassa, mantieni energia calma per altri 5 minuti.'
]
WHERE title = 'Respirazione Sincronizzata';

UPDATE ai_training_exercises 
SET instructions = ARRAY[
  'PREPARAZIONE AMBIENTE: Scegli uno spazio familiare per il pet, preferibilmente dove ha già i suoi punti di riferimento visivi.',
  'POSIZIONAMENTO OGGETTI: Posiziona 3-4 oggetti familiari in punti fissi della stanza sempre nelle stesse posizioni ogni giorno.',
  'PERCORSO GUIDATO: Cammina lentamente con il pet da un oggetto all''altro, usando sempre lo stesso ordine sequenziale.',
  'COMANDO VERBALE: Usa sempre la stessa parola ("casa", "posto", "qui") quando raggiungi ogni punto di riferimento.',
  'RIPETIZIONE COSTANTE: Ripeti il percorso 5-6 volte consecutive, mantenendo sempre la stessa velocità e sequenza.',
  'CONSOLIDAMENTO: Nelle ultime 2 ripetizioni lascia che il pet anticipi il percorso, seguendolo invece di guidarlo.'
]
WHERE title = 'Orientamento Spaziale';

UPDATE ai_training_exercises 
SET instructions = ARRAY[
  'PIANIFICAZIONE ORARIA: Stabilisci orari fissi per pasti, passeggiate, giochi. Scrivi tutto su un foglio visibile.',
  'OGGETTI DESIGNATI: Usa sempre gli stessi oggetti per ogni attività (stessa ciotola, stesso guinzaglio, stesso giocattolo).',
  'SEQUENZA IDENTICA: Mantieni sempre lo stesso ordine nelle azioni: prima il collare, poi il guinzaglio, poi la porta.',
  'ELIMINAZIONE VARIAZIONI: Non cambiare mai l''ordine degli eventi o gli oggetti usati, anche se sembra noioso.',
  'RINFORZO POSITIVO: Premia verbalmente il pet ogni volta che anticipa correttamente il prossimo passo della routine.',
  'MONITORAGGIO REAZIONI: Osserva se il pet mostra segni di rilassamento man mano che la routine diventa prevedibile.'
]
WHERE title = 'Routine Semplificata';

UPDATE ai_training_exercises 
SET instructions = ARRAY[
  'TIMING PERFETTO: Premia immediatamente (entro 2 secondi) qualsiasi comportamento positivo del pet.',
  'RICOMPENSA VARIABILE: Alterna tra cibo, carezze e parole dolci. Non usare sempre la stessa ricompensa.',
  'MARCATORE VERBALE: Usa sempre la stessa parola ("bravo", "bene") nel momento esatto del comportamento corretto.',
  'INTENSITÀ ADEGUATA: La ricompensa deve essere proporzionata: grande premio per grandi progressi, piccolo per piccoli passi.',
  'IGNORARE ERRORI: Non sgridare mai. Semplicemente ignora i comportamenti sbagliati e aspetta quelli giusti.',
  'SESSIONI BREVI: Mantieni le sessioni di addestramento sotto i 5 minuti per evitare stress cognitivo.'
]
WHERE title = 'Rinforzo Positivo Immediato';

UPDATE ai_training_exercises 
SET instructions = ARRAY[
  'AMBIENTE NEUTRO: Scegli uno spazio senza distrazioni: televisione spenta, telefono silenziato, altre persone lontane.',
  'OGGETTO FOCUS: Usa un oggetto semplice (palla colorata, bastoncino) che il pet possa fissare visivamente.',
  'COMANDO ATTENZIONE: Inizia sempre con "guarda" o "occhi" tenendo l''oggetto a 30cm dal muso del pet.',
  'DURATA GRADUALE: Inizia con 3 secondi di attenzione, aumenta di 2 secondi ogni giorno fino ad arrivare a 15 secondi.',
  'DISTRAZIONE CONTROLLATA: Dopo 1 settimana, introduci una piccola distrazione (rumore leggero) mantenendo il focus.',
  'PREMIO DIFFERITO: Aspetta che il pet mantenga l''attenzione per tutto il tempo richiesto prima di premiarlo.'
]
WHERE title = 'Esercizi di Concentrazione';

UPDATE ai_training_exercises 
SET instructions = ARRAY[
  'PREPARAZIONE STIMOLI: Prepara 5 oggetti diversi che il pet conosce bene (giocattolo, ciotola, guinzaglio, etc).',
  'PRESENTAZIONE SINGOLA: Mostra un oggetto alla volta tenendolo a distanza di 50cm dal pet per 5 secondi.',
  'COMANDO RICONOSCIMENTO: Chiedi "cos''è questo?" o "che cosa?" con tono dolce e incoraggiante.',
  'TEMPO DI ELABORAZIONE: Dai al pet 10-15 secondi per annusare, guardare e riconoscere l''oggetto senza fretta.',
  'RINFORZO NOMINALE: Quando il pet mostra interesse, ripeti il nome dell''oggetto 3 volte chiaramente.',
  'ROTAZIONE SISTEMATICA: Ripeti con tutti e 5 gli oggetti, poi ricomincia il ciclo per 3 giri totali.'
]
WHERE title = 'Training di Riconoscimento';

UPDATE ai_training_exercises 
SET instructions = ARRAY[
  'VALUTAZIONE INIZIALE: Osserva il livello di agitazione del pet da 1 a 10. Annota il numero prima di iniziare.',
  'RESPIRAZIONE CONDIVISA: Siediti accanto al pet e respira profondamente, facendo sentire il tuo respiro calmo.',
  'CONTATTO FISICO DOLCE: Se il pet lo permette, appoggia delicatamente una mano sul suo fianco senza pressione.',
  'VOCE MONOTONA: Parla con voce molto bassa e monotona, raccontando qualcosa di noioso (es. cosa hai mangiato).',
  'MOVIMENTO RIDOTTO: Riduci al minimo i tuoi movimenti. Ogni gesto deve essere lento e prevedibile.',
  'VALUTAZIONE FINALE: Dopo 10 minuti, rivaluta il livello di agitazione. L''obiettivo è ridurlo di almeno 3 punti.'
]
WHERE title = 'Stabilizzazione Emotiva';

UPDATE ai_training_exercises 
SET instructions = ARRAY[
  'SCELTA COMANDO: Scegli un comando semplice di una sola parola che il pet già conosce (es. "seduto", "vieni").',
  'RIPETIZIONE IMMEDIATA: Dai il comando, attendi la risposta, poi ripeti lo stesso comando dopo 30 secondi.',
  'INTERVALLI CRESCENTI: Ripeti il comando ogni 30 secondi per 5 volte, poi ogni minuto per altre 5 volte.',
  'RINFORZO COSTANTE: Premia ogni risposta corretta, anche se è la settima ripetizione dello stesso comando.',
  'MONITORAGGIO RISPOSTE: Conta quante volte il pet risponde correttamente. L''obiettivo è 8 su 10.',
  'VARIAZIONE GIORNALIERA: Ogni giorno usa un comando diverso, ma mantieni sempre la stessa struttura temporale.'
]
WHERE title = 'Memoria a Breve Termine';

UPDATE ai_training_exercises 
SET instructions = ARRAY[
  'CATENA SEMPLICE: Inizia con una sequenza di 3 azioni: seduto → zampa → premio.',
  'DIMOSTRAZIONI RIPETUTE: Esegui tu stesso la sequenza 3 volte prima di chiedere al pet di provare.',
  'GUIDA FISICA DOLCE: Aiuta il pet con guide fisiche gentili per le prime 5 ripetizioni della sequenza.',
  'RIDUZIONE AIUTO: Dalla sesta ripetizione, riduci gradualmente l''aiuto fisico fino a usare solo comandi verbali.',
  'TEMPO DI ELABORAZIONE: Dai al pet 10 secondi tra un comando e l''altro per elaborare e rispondere.',
  'AGGIUNTA GRADUALE: Quando la sequenza da 3 è perfetta, aggiungi un quarto elemento il giorno successivo.'
]
WHERE title = 'Sequenze Logiche Semplici';

UPDATE ai_training_exercises 
SET instructions = ARRAY[
  'VOCABOLARIO RIDOTTO: Usa solo 5 parole durante tutto l''esercizio: "bene", "no", "vieni", "stop", "bravo".',
  'TONO UNIFORME: Mantieni sempre lo stesso tono di voce per ogni parola, senza variazioni emotive.',
  'GESTI ACCOMPAGNATORI: Associa ogni parola a un gesto sempre identico (es. "vieni" + mano aperta).',
  'TEMPO DI RISPOSTA: Aspetta sempre 5 secondi dopo ogni comando prima di ripeterlo o cambiarlo.',
  'RIPETIZIONE STRUTTURATA: Ripeti ogni comando 3 volte consecutive prima di passare al successivo.',
  'CONCLUSIONE POSITIVA: Termina sempre con "bravo" accompagnato da carezza, indipendentemente dalla performance.'
]
WHERE title = 'Comunicazione Semplificata';

UPDATE ai_training_exercises 
SET instructions = ARRAY[
  'PERCORSO FISSO: Stabilisci un percorso di 10 metri che userai sempre, marcando inizio e fine con oggetti colorati.',
  'GUIDA COSTANTE: Cammina sempre alla stessa velocità (lenta), sempre sullo stesso lato del pet.',
  'PUNTI DI RIFERIMENTO: Posiziona 3 oggetti visibili lungo il percorso sempre nelle stesse posizioni.',
  'COMANDI POSIZIONALI: Usa "sinistra", "destra", "avanti" solo nei punti prestabiliti del percorso.',
  'RIPETIZIONE GIORNALIERA: Percorri lo stesso tragitto 5 volte consecutive ogni giorno alla stessa ora.',
  'AUTONOMIA GRADUALE: Dalla seconda settimana, lascia che il pet preceda leggermente, seguendo il percorso memorizzato.'
]
WHERE title = 'Navigazione Assistita';

UPDATE ai_training_exercises 
SET instructions = ARRAY[
  'SPECCHIO POSIZIONATO: Metti un piccolo specchio a terra dove il pet possa vedere il suo riflesso chiaramente.',
  'NOME RIPETUTO: Ripeti il nome del pet 10 volte mentre lui guarda il suo riflesso nello specchio.',
  'AUTOCAREZZA GUIDATA: Guida la zampa del pet a toccare delicatamente il suo stesso muso mentre dici il suo nome.',
  'RICONOSCIMENTO VOCALE: Registra la tua voce che chiama il pet e falla sentire mentre lui è davanti allo specchio.',
  'OGGETTI PERSONALI: Mostra al pet i suoi oggetti personali (ciotola, giocattolo) mentre ripeti "tuo" e il suo nome.',
  'ROUTINE IDENTIFICATIVA: Ogni giorno alla stessa ora, ripeti la frase "tu sei [nome]" 20 volte con tono affettuoso.'
]
WHERE title = 'Rafforzamento Identità';

UPDATE ai_training_exercises 
SET instructions = ARRAY[
  'PROBLEMA SEMPLICE: Nascondi un bocconcino sotto uno di 3 bicchieri capovolti, sempre lo stesso bicchiere per i primi giorni.',
  'DIMOSTRAZIONE LENTA: Nascondi il premio molto lentamente, assicurandoti che il pet veda tutto il processo.',
  'TEMPO DI RIFLESSIONE: Dopo aver nascosto il premio, conta fino a 10 prima di permettere al pet di cercare.',
  'GUIDA GRADUALE: Se il pet sbaglia, indicagli dolcemente il bicchiere giusto senza frustrazioni.',
  'RINFORZO LOGICO: Quando trova il premio, ripeti "bravo, qui" per associare il successo alla posizione.',
  'COMPLESSITÀ CRESCENTE: Dopo 5 giorni di successi, inizia a cambiare quale bicchiere nasconde il premio.'
]
WHERE title = 'Problem Solving Guidato';

UPDATE ai_training_exercises 
SET instructions = ARRAY[
  'CALENDARIO VISIVO: Crea un calendario semplice con immagini delle attività del pet (pasto, passeggiata, gioco).',
  'ROUTINE SETTIMANALE: Stabilisci che lunedì = bagno, martedì = gioco lungo, mercoledì = passeggiata extra, etc.',
  'PREPARAZIONE ANTICIPATA: Il giorno prima, mostra al pet gli oggetti che userete il giorno dopo.',
  'RINFORZO TEMPORALE: Ripeti "domani" mentre mostri cosa accadrà, "oggi" mentre fate l''attività corrente.',
  'CONTROLLO ANSIE: Se il pet mostra ansia per attività future, rassicuralo mostrando che oggi è diverso da domani.',
  'VALUTAZIONE ADATTAMENTO: Osserva se il pet inizia ad anticipare le attività del giorno successivo.'
]
WHERE title = 'Pianificazione Mantenimento';