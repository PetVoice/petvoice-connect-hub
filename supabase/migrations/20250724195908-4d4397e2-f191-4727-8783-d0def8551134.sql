-- Aggiorna TUTTI gli esercizi rimanenti con istruzioni dettagliate per TUTTI i protocolli

-- Usa un approccio più efficiente: aggiorna tutti gli esercizi che non hanno istruzioni sufficienti
UPDATE ai_training_exercises 
SET instructions = CASE 
  -- Gestione dell'Ansia
  WHEN title = 'Ambiente Sicuro' THEN ARRAY[
    'ZONA RIFUGIO: Crea uno spazio dedicato dove il pet può ritirarsi quando si sente ansioso.',
    'CONTROLLO ACCESSI: Assicurati che questo spazio sia accessibile solo al pet, senza interferenze.',
    'COMFORT MASSIMO: Inserisci oggetti familiari, coperte morbide e giocattoli preferiti.',
    'ILLUMINAZIONE SOFFUSA: Usa luci calde e evita illuminazione troppo forte o lampeggiante.',
    'ISOLAMENTO ACUSTICO: Minimizza rumori esterni che potrebbero aumentare l''ansia.',
    'ROUTINE DI ACCESSO: Insegna al pet che può usare questo spazio quando ne sente il bisogno.'
  ]
  WHEN title = 'Tecniche di Breathing' THEN ARRAY[
    'MODELLAMENTO RESPIRATORIO: Respira lentamente e profondamente davanti al pet perché possa imitarti.',
    'CONTEGGIO RESPIRATORIO: Usa il pattern 4-7-8 (inspira 4, trattieni 7, espira 8 secondi).',
    'SINCRONIZZAZIONE: Posiziona la mano sul fianco del pet per sentire il suo ritmo respiratorio.',
    'AMBIENTE CALMO: Pratica in uno spazio silenzioso senza distrazioni esterne.',
    'DURATA GRADUALE: Inizia con 3 minuti, aumenta di 1 minuto ogni settimana.',
    'RINFORZO POSITIVO: Premia il pet quando mantiene un ritmo respiratorio calmo.'
  ]
  WHEN title = 'Esposizione Graduale' THEN ARRAY[
    'IDENTIFICAZIONE PAURE: Elenca tutte le situazioni che causano ansia al pet.',
    'SCALA DI INTENSITÀ: Classifica ogni paura da 1 (lieve disagio) a 10 (panico totale).',
    'PARTENZA DAL MINIMO: Inizia sempre dal livello 1-2 di intensità per ogni paura.',
    'ASSOCIAZIONE POSITIVA: Combina l''esposizione con cibo, giochi o carezze piacevoli.',
    'PROGRESSIONE LENTA: Aumenta l''intensità solo quando il pet è completamente rilassato.',
    'SESSIONI BREVI: Mantieni ogni esposizione sotto i 10 minuti per evitare sovraccarico.'
  ]
  -- Controllo dell'Iperattività
  WHEN title = 'Canalizzazione Energia' THEN ARRAY[
    'ATTIVITÀ STRUTTURATE: Crea sessioni di gioco con regole chiare e tempi definiti.',
    'ESERCIZIO FISICO REGOLARE: Pianifica 30-60 minuti di attività fisica quotidiana.',
    'GIOCHI MENTALI: Introduci puzzle e giochi che richiedono concentrazione.',
    'PAUSE PROGRAMMATE: Inserisci pause di 5 minuti ogni 15 minuti di attività.',
    'RINFORZO CALMA: Premia comportamenti calmi più di quelli energici.',
    'ROUTINE ENERGETICA: Stabilisci orari fissi per le attività ad alta energia.'
  ]
  WHEN title = 'Controllo Impulsi' THEN ARRAY[
    'COMANDO WAIT: Insegna al pet ad aspettare prima di mangiare, uscire o giocare.',
    'ESERCIZI DI PAZIENZA: Pratica esercizi dove il pet deve attendere per ottenere ricompense.',
    'AUTOCONTROLLO GRADUALE: Aumenta progressivamente i tempi di attesa richiesti.',
    'ALTERNATIVE COMPORTAMENTALI: Insegna cosa fare invece di comportamenti impulsivi.',
    'RINFORZO IMMEDIATO: Premia istantaneamente ogni episodio di autocontrollo.',
    'PRATICA QUOTIDIANA: Esercita l''autocontrollo in situazioni quotidiane diverse.'
  ]
  -- Superare la Paura
  WHEN title = 'Desensibilizzazione' THEN ARRAY[
    'IDENTIFICAZIONE TRIGGER: Elenca tutti gli stimoli che causano paura nel pet.',
    'GERARCHIA PAURE: Ordina le paure dalla meno alla più intensa.',
    'DISTANZA SICURA: Inizia l''esposizione a distanza tale che il pet rimanga calmo.',
    'DURATA CONTROLLATA: Limita le prime esposizioni a 30 secondi-1 minuto.',
    'ASSOCIAZIONE POSITIVA: Associa ogni trigger a qualcosa di molto piacevole.',
    'PROGRESSIONE PAZIENTE: Riduci distanza/aumenta durata solo se il pet è rilassato.'
  ]
  WHEN title = 'Costruzione Fiducia' THEN ARRAY[
    'SUCCESSI PROGRAMMATI: Crea situazioni dove il pet può sicuramente avere successo.',
    'RINFORZO COSTANTE: Celebra ogni piccolo progresso con entusiasmo genuino.',
    'LEADERSHIP CALMA: Mostra al pet che sei un leader sicuro e affidabile.',
    'ROUTINE RASSICURANTI: Mantieni routine prevedibili che danno sicurezza.',
    'SFIDE GRADUALI: Introduci nuove sfide solo dopo aver consolidato quelle precedenti.',
    'SUPPORTO EMOTIVO: Offri comfort e rassicurazione nei momenti di incertezza.'
  ]
  -- Gestire l'Irritabilità
  WHEN title = 'Identificazione Trigger' THEN ARRAY[
    'OSSERVAZIONE SISTEMATICA: Monitora il pet per identificare tutti i fattori scatenanti.',
    'DIARIO COMPORTAMENTALE: Registra data, ora, situazione e intensità di ogni episodio.',
    'PATTERN ANALYSIS: Cerca schemi ricorrenti negli episodi di irritabilità.',
    'FATTORI AMBIENTALI: Considera temperatura, rumori, presenze, orari come possibili trigger.',
    'STATI INTERNI: Valuta fame, sete, dolore, stanchezza come cause di irritabilità.',
    'DOCUMENTAZIONE ACCURATA: Mantieni record dettagliati per identificare trend nascosti.'
  ]
  WHEN title = 'Gestione Momenti Critici' THEN ARRAY[
    'RICONOSCIMENTO PRECOCE: Impara a identificare i primi segnali di irritabilità crescente.',
    'INTERVENTO RAPIDO: Agisci immediatamente ai primi segnali, non aspettare l''escalation.',
    'TECNICHE DI DEVIAZIONE: Distrai il pet con attività alternative piacevoli.',
    'SPAZIO SICURO: Porta il pet in un ambiente calmo e controllato.',
    'VOCE CALMA: Mantieni tono di voce basso e rassicurante durante l''intervento.',
    'PAZIENZA ATTIVA: Non forzare il pet, lascia che si calmi ai suoi tempi.'
  ]
  -- Recupero dall'Apatia
  WHEN title = 'Stimolazione Graduale' THEN ARRAY[
    'VALUTAZIONE BASELINE: Determina il livello attuale di interesse e energia del pet.',
    'STIMOLI LEGGERI: Inizia con stimolazioni molto blande e non invasive.',
    'INTERESSE NATURALE: Usa oggetti, suoni o odori che naturalmente interessano il pet.',
    'DURATA MINIMA: Mantieni le sessioni molto brevi (2-3 minuti) all''inizio.',
    'OSSERVAZIONE REAZIONI: Monitora attentamente le risposte del pet a ogni stimolo.',
    'PROGRESSIONE PAZIENTE: Aumenta intensità solo quando il pet mostra interesse crescente.'
  ]
  WHEN title = 'Motivazione Intrinseca' THEN ARRAY[
    'SCOPERTA PREFERENZE: Identifica cosa piace davvero al pet attraverso osservazione.',
    'SCELTE AUTONOME: Offri al pet opzioni tra diverse attività e rispetta le sue scelte.',
    'RINFORZO NATURALE: Usa le preferenze naturali del pet come motivatori.',
    'AUTONOMIA GRADUALE: Permetti al pet di prendere sempre più iniziative.',
    'CELEBRAZIONE INTERESSE: Festeggia ogni momento in cui il pet mostra interesse spontaneo.',
    'AMBIENTE STIMOLANTE: Crea un ambiente ricco di opportunità interessanti ma non sovrastimolante.'
  ]
  -- Riduzione dello Stress
  WHEN title = 'Tecniche di Rilassamento' THEN ARRAY[
    'RILASSAMENTO MUSCOLARE: Guida il pet attraverso tensione e rilascio di ogni gruppo muscolare.',
    'AMBIENTE SERENO: Crea atmosfera calma con luci soffuse e suoni rilassanti.',
    'MASSAGGIO TERAPEUTICO: Esegui massaggi lenti e delicati su collo, spalle e schiena.',
    'RESPIRAZIONE GUIDATA: Modella respirazioni profonde e lente per il pet.',
    'POSIZIONE COMODA: Aiuta il pet a trovare la posizione più confortevole per rilassarsi.',
    'DURATA APPROPRIATA: Mantieni le sessioni tra 10-20 minuti per efficacia ottimale.'
  ]
  WHEN title = 'Mindfulness Pet' THEN ARRAY[
    'PRESENZA MOMENTO: Guida l''attenzione del pet verso le sensazioni immediate del presente.',
    'CONSAPEVOLEZZA CORPOREA: Aiuta il pet a notare le sensazioni del proprio corpo.',
    'OSSERVAZIONE SENZA GIUDIZIO: Incoraggia il pet a notare pensieri e sensazioni senza reagire.',
    'ANCORAGGIO RESPIRATORIO: Usa il respiro come punto di focalizzazione durante la pratica.',
    'AMBIENTE MINDFUL: Pratica in uno spazio tranquillo dedicato alla consapevolezza.',
    'ROUTINE QUOTIDIANA: Integra momenti di mindfulness nella routine quotidiana del pet.'
  ]
  -- Superare la Tristezza
  WHEN title = 'Attivazione Comportamentale' THEN ARRAY[
    'PIANIFICAZIONE ATTIVITÀ: Crea un calendario con attività piacevoli distribuite nella settimana.',
    'PICCOLI PASSI: Inizia con attività molto semplici che richiedono minimo sforzo.',
    'RINFORZO PARTECIPAZIONE: Premia la partecipazione alle attività, non necessariamente l''entusiasmo.',
    'VARIETÀ STIMOLANTE: Alterna diversi tipi di attività per mantenere interesse.',
    'SOCIALE GRADUALE: Inserisci gradualmente interazioni sociali positive.',
    'MONITORAGGIO UMORE: Osserva come le diverse attività influenzano l''umore del pet.'
  ]
  WHEN title = 'Rinforzo Positivo' THEN ARRAY[
    'TIMING PERFETTO: Premia comportamenti positivi immediatamente quando si verificano.',
    'VARIETÀ RICOMPENSE: Usa diversi tipi di rinforzi (cibo, gioco, carezze, lodi).',
    'INTENSITÀ APPROPRIATA: Calibra l''intensità della ricompensa al comportamento mostrato.',
    'CONSISTENZA: Mantieni coerenza nel premiare gli stessi comportamenti positivi.',
    'GRADUALITÀ: Riduci gradualmente la frequenza delle ricompense mantenendo il comportamento.',
    'RINFORZO SOCIALE: Includi lodi verbali e contatto fisico affettuoso come ricompense.'
  ]
  ELSE instructions
END
WHERE protocol_id IN (SELECT id FROM ai_training_protocols WHERE is_public = true)
AND (instructions IS NULL OR array_length(instructions, 1) IS NULL OR array_length(instructions, 1) < 4);