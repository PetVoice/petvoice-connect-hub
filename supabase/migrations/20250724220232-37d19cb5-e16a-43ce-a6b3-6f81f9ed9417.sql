-- Correzione con i titoli REALI degli esercizi per "Gestire l'Irritabilità"

-- Identificazione Trigger (hanno già istruzioni brevi)
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. OSSERVAZIONE ATTENTA: MONITORA comportamenti e situazioni che precedono episodi irritabilità',
  '2. DIARIO TRIGGER: ANNOTA orari, luoghi e circostanze specifiche degli episodi di tensione',
  '3. SEGNALI PRECOCI: IDENTIFICA i primi segni fisici di agitazione (respirazione, postura, sguardo)',
  '4. PATTERN RICORRENTI: RICONOSCI situazioni che sistematicamente causano reazioni negative',
  '5. SOGLIA TOLLERANZA: DETERMINA livello di stimoli oltre cui il pet diventa irritabile',
  '6. FATTORI ESTERNI: ELENCA elementi ambientali che influenzano umore (rumore, folla, caldo)',
  '7. TIMING CRITICO: MAPRA momenti della giornata quando irritabilità è più probabile',
  '8. COLLEGAMENTO EMOTIVO: COMPRENDI link tra stato emotivo del pet e reazioni aggressive'
],
updated_at = NOW()
WHERE title = 'Identificazione Trigger' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Gestire l''Irritabilità'
);

-- Creazione Zona Buffer
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. SPAZIO DEDICATO: CREA zona tranquilla esclusivamente per il pet quando si sente sopraffatto',
  '2. MATERIALI COMFORT: AGGIUNGI oggetti familiari che trasmettono sicurezza e rilassamento',
  '3. ACCESSO LIBERO: GARANTISCI che il pet possa raggiungere questo spazio SEMPRE senza ostacoli',
  '4. REGOLA SACRA: NESSUNO disturba il pet quando è nella zona buffer - rispetto assoluto',
  '5. ASSOCIAZIONE POSITIVA: OFFRI occasionalmente snack speciali solo in questo spazio',
  '6. SEGNALI CHIARI: INSEGNA al pet che questo spazio è SUA sicurezza quando tutto è troppo',
  '7. POSIZIONAMENTO STRATEGICO: COLLOCA in area tranquilla, lontana da passaggi e rumori forti',
  '8. RICONOSCIMENTO USO: CELEBRA ogni volta che il pet sceglie autonomamente di usare questo spazio'
],
updated_at = NOW()
WHERE title = 'Creazione Zona Buffer' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Gestire l''Irritabilità'
);

-- Riconoscimento Segnali Precoci
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. LINGUAGGIO CORPOREO: STUDIA tensione muscolare, postura rigida, sguardo fisso intenso',
  '2. RESPIRAZIONE CAMBIATA: NOTA passaggio a respiro più veloce o trattenuto',
  '3. MOVIMENTI SPECIFICI: IDENTIFICA gesti ripetitivi che precedono esplosioni di irritabilità',
  '4. VOCALIZZAZIONI SOTTILI: RICONOSCI cambi nel tono, frequenza o intensità dei suoni',
  '5. INTERAZIONE SOCIALE: OSSERVA evitamento contatto o aumento distanza da altri',
  '6. APPETITO COMPORTAMENTO: MONITORA cambi in interesse per cibo, giochi, attività',
  '7. TIMING REAZIONE: MISURA velocità con cui escalation avviene per prevenire meglio',
  '8. INTERVENTO PRECOCE: APPLICA strategie di calma IMMEDIATAMENTE ai primi segnali'
],
updated_at = NOW()
WHERE title = 'Riconoscimento Segnali Precoci' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Gestire l''Irritabilità'
);

-- Interruzione Pattern
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. DISTRAZIONE IMMEDIATA: APPENA inizia irritabilità, REDIRECT verso attività piacevole',
  '2. CAMBIO AMBIENTE: SPOSTA fisicamente il pet in location diversa per spezzare pattern',
  '3. ELEMENTO CALMANTE: INTRODUCE suono, profumo o oggetto che ha effetto rilassante',
  '4. EVITA CONFRONTO: MAI sfidare o contrastare direttamente durante episodio irritabilità',
  '5. VOCE CALMA: MANTIENI tono basso e rilassato anche se situazione è tesa',
  '6. SPAZIO FISICO: DAI distanza al pet se necessario, non forzare vicinanza',
  '7. TIMING PERFETTO: INTERVIENI nel primo 10% escalation, non aspettare che peggiori',
  '8. CONSISTENZA METODO: USA sempre stessa strategia interruzione per creare prevedibilità'
],
updated_at = NOW()
WHERE title = 'Interruzione Pattern' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Gestire l''Irritabilità'
);

-- Training di Pazienza
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. GRATIFICAZIONE RITARDATA: INIZIA con attese di 5 secondi, aumenta gradualmente',
  '2. PREMIA ATTESA CALMA: RICOMPENSA solo quando pet aspetta senza agitazione',
  '3. INCREMENTI LENTI: AUMENTA tempi attesa di 2-3 secondi alla volta massimo',
  '4. RINFORZI MOTIVANTI: USA ricompense che il pet trova IRRESISTIBILI per mantenere motivazione',
  '5. SEGNALE RILASCIO: STABILISCI comando chiaro che indica "ora puoi avere la ricompensa"',
  '6. PRATICA QUOTIDIANA: ESERCITA pazienza 3-5 volte al giorno in contesti diversi',
  '7. SUCCESSO GARANTITO: MANTIENI sempre livello di sfida che permette successo 80% volte',
  '8. CELEBRAZIONE PROGRESSO: FESTEGGIA ogni miglioramento nella capacità di attendere'
],
updated_at = NOW()
WHERE title = 'Training di Pazienza' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Gestire l''Irritabilità'
);

-- Controllo Ambientale  
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. RIDUZIONE RUMORI: ELIMINA o minimizza suoni fastidiosi che scatenano irritabilità',
  '2. GESTIONE AFFOLLAMENTO: EVITA situazioni con troppe persone/animali contemporaneamente',
  '3. RISORSE SEPARATE: FORNISCI cibo, acqua, giochi personali per evitare competizione',
  '4. ROUTINE PREVEDIBILI: STABILISCI orari fissi per attività quotidiane principali',
  '5. ILLUMINAZIONE ADEGUATA: REGOLA luce per evitare stress da troppo buio o troppo chiaro',
  '6. TEMPERATURA COMFORT: MANTIENI ambiente termicamente confortevole per il pet',
  '7. RIMOZIONE TRIGGER: IDENTIFICA e rimuovi oggetti/situazioni che causano stress',
  '8. ZONA CONTROLLO: CREA ambiente dove pet ha controllo su alcune scelte quotidiane'
],
updated_at = NOW()
WHERE title = 'Controllo Ambientale' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Gestire l''Irritabilità'
);

-- Tecniche di Redirezione
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. ATTIVITÀ FISICA: OFFRI esercizio quando pet mostra tensione per scaricare energia',
  '2. GIOCHI CONCENTRAZIONE: USA puzzle o attività che richiedono focus mentale intenso',
  '3. SFOGO ENERGIA: FORNISCI modi appropriati per esprimere frustrazione fisicamente',
  '4. PREMIA PARTECIPAZIONE: RICOMPENSA ogni tentativo di partecipare a attività alternative',
  '5. VARIAZIONE OPZIONI: MANTIENI diverse attività disponibili per redirect efficace',
  '6. TIMING REDIRECT: APPLICA redirezione PRIMA che irritabilità raggiunga picco',
  '7. RINFORZO SUCCESSO: CELEBRA quando pet accetta redirect e si calma',
  '8. ADATTAMENTO PREFERENZE: OSSERVA quali redirect funzionano meglio e usali prioritariamente'
],
updated_at = NOW()
WHERE title = 'Tecniche di Redirezione' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Gestire l''Irritabilità'
);

-- Training di Comunicazione
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. SEGNALI DISAGIO: INSEGNA al pet modi appropriati per comunicare quando è a disagio',
  '2. PREMIA COMUNICAZIONE CALMA: RICOMPENSA SEMPRE quando pet comunica bisogni senza aggressività',
  '3. IGNORA AGGRESSIVITÀ: NON rispondere a richieste fatte con irritabilità o aggressione',
  '4. RISPOSTA COERENTE: RISPONDI SEMPRE ai segnali appropriati per rinforzare comunicazione positiva',
  '5. TEMPO ASCOLTO: CONCEDI tempo al pet per esprimere bisogni prima di agire',
  '6. VALIDAZIONE EMOZIONI: RICONOSCI verbalmente i sentimenti del pet anche se negativi',
  '7. ALTERNATIVE ESPRESSIVE: OFFRI diversi modi per comunicare (sguardi, gesti, posizioni)',
  '8. MODELING COMUNICAZIONE: DIMOSTRA tu stesso comunicazione calma e rispettosa'
],
updated_at = NOW()
WHERE title = 'Training di Comunicazione' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Gestire l''Irritabilità'
);

-- Esercizi di Tolleranza
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. ESPOSIZIONE GRADUALE: INTRODUCE irritanti minori per periodi molto brevi inizialmente',
  '2. PREMIA TOLLERANZA: RICOMPENSA anche tolleranza di pochi secondi per costruire resistenza',
  '3. AUMENTO LENTISSIMO: INCREMENTA durata esposizione di 1-2 secondi alla volta',
  '4. MONITORAGGIO STRESS: INTERROMPI IMMEDIATAMENTE se diventa troppo stressante',
  '5. PAUSA RECUPERO: CONCEDI tempo tra esposizioni per elaborazione emotiva',
  '6. ASSOCIAZIONE POSITIVA: ABBINA presenza irritante a esperienze molto piacevoli',
  '7. CONTROLLO INTENSITÀ: USA livello più basso possibile di stimolo irritante',
  '8. SUCCESSO COSTRUTTIVO: MANTIENI sempre livello di successo per costruire fiducia'
],
updated_at = NOW()
WHERE title = 'Esercizi di Tolleranza' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Gestire l''Irritabilità'
);

-- Socializzazione con Limiti
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. REGOLE CHIARE: STABILISCI confini chiari per interazioni sociali sin dall inizio',
  '2. SPAZI PERSONALI: RISPETTA e fai rispettare il bisogno di spazio del pet',
  '3. SUPERVISIONE COSTANTE: MONITORA tutte le interazioni sociali per prevenire escalation',
  '4. RIMOZIONE PREVENTIVA: TOGLI pet da situazione PRIMA che diventi problematica',
  '5. PARTNER COMPATIBILI: SCEGLI altri animali/persone con energie simili e calme',
  '6. DURATA CONTROLLATA: LIMITA tempo interazioni sociali per evitare sovraccarico',
  '7. RINFORZO POSITIVO: PREMIA comportamenti sociali appropriati e rispettosi',
  '8. GRADUALITÀ PROGRESSIVA: AUMENTA complessità sociale solo dopo successi consolidati'
],
updated_at = NOW()
WHERE title = 'Socializzazione con Limiti' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Gestire l''Irritabilità'
);

-- Training di Autocontrollo
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. COMANDO FERMATI: INSEGNA segnale specifico che significa "fermati e pensa"',
  '2. AUTOCONTROLLO PREMIATO: RICOMPENSA ogni momento di pausa e autoriflessione',
  '3. PRATICA PROVOCAZIONI: ESERCITA autocontrollo in situazioni leggermente provocatorie',
  '4. RICONOSCIMENTO SPONTANEO: CELEBRA quando pet si autocontrolla senza comando',
  '5. TEMPO RIFLESSIONE: CONCEDI sempre tempo per elaborare prima di richiedere risposta',
  '6. MODELING CALMO: DIMOSTRA tu stesso autocontrollo emotivo come esempio',
  '7. STRATEGIE PERSONALI: OSSERVA e rinforza tecniche di autocontrollo che pet sviluppa naturalmente',
  '8. PROGRESSIONE SFIDE: AUMENTA difficoltà situazioni solo dopo successi consolidati'
],
updated_at = NOW()
WHERE title = 'Training di Autocontrollo' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Gestire l''Irritabilità'
);

-- Tecniche di Grounding
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. FOCUS FISICO: GUIDA attenzione pet verso sensazioni fisiche immediate (zampe a terra, superficie)',
  '2. RESPIRAZIONE CONDIVISA: RESPIRA lentamente e profondamente accanto al pet come modello',
  '3. SUONI AMBIENTE: AIUTA pet a concentrarsi su suoni naturali calmanti presenti',
  '4. QUI E ORA: RIPORTA attenzione al momento presente attraverso stimoli sensoriali immediati',
  '5. TOCCO GROUNDING: USA contatto fisico gentile per ancorare pet al presente',
  '6. MOVIMENTO LENTO: INCORAGGIA movimenti deliberati e consapevoli invece di agitazione',
  '7. AMBIENTE STABILE: FORNISCI riferimenti fisici costanti che danno senso di stabilità',
  '8. RIPETIZIONE CALMANTE: USA frasi o azioni ripetitive che creano ritmo rilassante'
],
updated_at = NOW()
WHERE title = 'Tecniche di Grounding' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Gestire l''Irritabilità'
);

-- Sviluppo Empatia
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. MODELING EMPATICO: DIMOSTRA considerazione e gentilezza verso altri in presenza del pet',
  '2. RICOMPENSA CONSIDERAZIONE: PREMIA ogni comportamento che mostra attenzione verso bisogni altri',
  '3. GRUPPO PICCOLO: PRATICA interazioni empatiche in contesti con pochi partecipanti',
  '4. COMPORTAMENTO PROSOCIALE: RINFORZA azioni che beneficiano il gruppo non solo il pet',
  '5. LETTURA EMOZIONI: AIUTA pet a riconoscere stati emotivi di altri esseri',
  '6. RISPOSTA APPROPRIATA: INSEGNA reazioni adeguate a emozioni altrui (comfort, spazio, etc)',
  '7. CONDIVISIONE RISORSE: PRATICA condivisione volontaria in situazioni controllate',
  '8. CELEBRAZIONE COLLETTIVA: INCLUDE pet in celebrazioni di successi altrui'
],
updated_at = NOW()
WHERE title = 'Sviluppo Empatia' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Gestire l''Irritabilità'
);

-- Pratica in Situazioni Reali
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. SCENARI CONTROLLATI: CREA situazioni realistiche ma gestibili per praticare autocontrollo',
  '2. SUPPORTO DISCRETO: FORNISCI aiuto senza sostituirti al pet nella gestione situazione',
  '3. INTERVENTO EMERGENZA: INTERVIENI solo se pet è veramente in difficoltà estrema',
  '4. DOCUMENTAZIONE PRECISA: REGISTRA come pet gestisce diverse situazioni reali',
  '5. GRADUALITÀ REALISTICA: AUMENTA complessità situazioni mantenendo possibilità successo',
  '6. AMBIENTE NATURALE: PRATICA in luoghi e contesti dove pet normalmente si trova',
  '7. VARIAZIONE CIRCOSTANZE: CAMBIA orari, persone, elementi per generalizzare apprendimento',
  '8. RINFORZO IMMEDIATO: RICOMPENSA successi reali molto più di quelli in training artificiale'
],
updated_at = NOW()
WHERE title = 'Pratica in Situazioni Reali' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Gestire l''Irritabilità'
);

-- Rinforzo Comportamenti Alternativi
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. IDENTIFICAZIONE ALTERNATIVE: TROVA comportamenti specifici che pet può fare INVECE di irritarsi',
  '2. RINFORZO IMMEDIATO: PREMIA alternative positive nel momento esatto in cui accadono',
  '3. IGNORARE TOTALE: NON dare NESSUNA attenzione a comportamenti irritabili',
  '4. COERENZA ASSOLUTA: TUTTI in famiglia devono applicare stesso sistema rinforzi',
  '5. VARIAZIONE PREMI: ALTERNA tipi ricompense per mantenere alta motivazione',
  '6. TIMING PERFETTO: PREMIO deve arrivare entro 2 secondi dal comportamento corretto',
  '7. PROGRESSIONE NATURALE: RINFORZA approssimazioni sempre più vicine al comportamento ideale',
  '8. CELEBRAZIONE SUCCESSI: FESTEGGIA ogni volta che pet sceglie alternativa positiva'
],
updated_at = NOW()
WHERE title = 'Rinforzo Comportamenti Alternativi' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Gestire l''Irritabilità'
);

-- Problem Solving Collaborativo
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. PROBLEMI SEMPLICI: PRESENTA sfide che richiedono cooperazione tra pet e umano',
  '2. LAVORO SQUADRA: STRUTTURA attività dove successo dipende da collaborazione',
  '3. SUCCESSI CONDIVISI: CELEBRATE insieme ogni problema risolto cooperativamente',
  '4. FIDUCIA RECIPROCA: COSTRUISCI attività che richiedono fiducia tra pet e famiglia',
  '5. COMUNICAZIONE NECESSARIA: CREA situazioni dove pet deve comunicare per risolvere problema',
  '6. RUOLI COMPLEMENTARI: ASSEGNA compiti diversi ma interconnessi a pet e umano',
  '7. PAZIENZA CONDIVISA: PRATICATE insieme gestione frustrazione durante problem solving',
  '8. ORGOGLIO COLLETTIVO: SVILUPPATE senso di orgoglio per successi ottenuti insieme'
],
updated_at = NOW()
WHERE title = 'Problem Solving Collaborativo' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Gestire l''Irritabilità'
);

-- Autonomia di Autoregolazione
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. RIDUZIONE SUPPORTO: GRADUALMENTE diminuisci aiuto esterno per gestione irritabilità',
  '2. GESTIONE INDIPENDENTE: LASCIA pet gestire situazioni moderatamente difficili da solo',
  '3. INTERVENTO EMERGENZA: INTERVIENI solo quando pet è veramente in crisi seria',
  '4. RICONOSCIMENTO AUTOGESTIONE: PREMIA specificamente quando pet si autoregola senza aiuto',
  '5. FIDUCIA CAPACITÀ: DIMOSTRA fiducia nelle capacità del pet di gestire se stesso',
  '6. SPAZIO DECISIONALE: CONCEDI scelte su come gestire situazioni irritanti',
  '7. MONITORAGGIO DISCRETO: OSSERVA da distanza senza interferire immediatamente',
  '8. CELEBRAZIONE AUTONOMIA: FESTEGGIA ogni progresso verso autosufficienza emotiva'
],
updated_at = NOW()
WHERE title = 'Autonomia di Autoregolazione' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Gestire l''Irritabilità'
);

-- Continua con gli altri esercizi rimanenti...