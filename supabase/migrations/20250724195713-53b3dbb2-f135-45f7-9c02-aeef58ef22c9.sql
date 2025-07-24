-- Continua aggiornamento esercizi del protocollo "Calmare l'Agitazione"
UPDATE ai_training_exercises SET instructions = ARRAY[
  'PROGRAMMA SETTIMANALE: Crea un calendario con orari fissi per pasti, passeggiate, giochi e riposo.',
  'SEGNALI TEMPORALI: Usa sempre gli stessi segnali per ogni attività (suono, oggetto, gesto).',
  'PREPARAZIONE ANTICIPATA: Prepara tutto il necessario 10 minuti prima di ogni attività.',
  'TRANSIZIONI DOLCI: Lascia 5 minuti di buffer tra un''attività e l''altra per evitare fretta.',
  'COERENZA FAMILIARE: Assicurati che tutti i membri della famiglia seguano la stessa routine.',
  'FLESSIBILITÀ CONTROLLATA: Permetti variazioni minime (max 15 minuti) mantenendo la struttura base.'
] WHERE title = 'Routine Prevedibile' AND protocol_id IN (SELECT id FROM ai_training_protocols WHERE title = 'Calmare l''Agitazione');

UPDATE ai_training_exercises SET instructions = ARRAY[
  'SVILUPPO FUTURO: Immagina insieme al pet scenari positivi futuri (passeggiate, giochi, momenti felici).',
  'VISUALIZZAZIONE GUIDATA: Usa voce calma per descrivere situazioni rilassanti che accadranno.',
  'ASSOCIAZIONI POSITIVE: Collega eventi futuri a sensazioni piacevoli attuali.',
  'RIPETIZIONE QUOTIDIANA: Dedica 10 minuti al giorno a questa visualizzazione positiva.',
  'LINGUAGGIO CORPOREO: Mantieni postura rilassata e sorriso mentre fai la proiezione.',
  'ANCORAGGIO PRESENTE: Termina sempre riportando l''attenzione al momento presente e sicuro.'
] WHERE title = 'Proiezione Futura' AND protocol_id IN (SELECT id FROM ai_training_protocols WHERE title = 'Calmare l''Agitazione');

UPDATE ai_training_exercises SET instructions = ARRAY[
  'SELEZIONE COMPAGNI: Scegli pet ben socializzati e calmi per l''interazione.',
  'AMBIENTE NEUTRO: Organizza incontri in territorio neutro, non nel territorio di nessun pet.',
  'SUPERVISIONE ATTIVA: Monitora costantemente il linguaggio corporeo di tutti i pet coinvolti.',
  'DURATA LIMITATA: Inizia con incontri di 10 minuti, aumenta gradualmente se tutto va bene.',
  'ATTIVITÀ STRUTTURATE: Organizza attività calme come camminare insieme o mangiare a distanza.',
  'SEGNALI DI STRESS: Interrompi immediatamente se vedi segnali di stress o agitazione.'
] WHERE title = 'Socializzazione Controllata' AND protocol_id IN (SELECT id FROM ai_training_protocols WHERE title = 'Calmare l''Agitazione');

UPDATE ai_training_exercises SET instructions = ARRAY[
  'SCALA INTENSITÀ: Crea una lista di stimoli ordinati dal meno al più attivante.',
  'ESPOSIZIONE PROGRESSIVA: Inizia sempre dal stimolo meno intenso della lista.',
  'TEMPO DI ADATTAMENTO: Aspetta che il pet si abitui completamente a un livello prima di passare al successivo.',
  'DISTANZA SICURA: Mantieni distanza appropriata da stimoli potenzialmente stressanti.',
  'RINFORZO POSITIVO: Associa ogni stimolo a qualcosa di piacevole per il pet.',
  'CONTROLLO REAZIONI: Riduci l''intensità immediatamente se il pet mostra segni di stress.'
] WHERE title = 'Stimoli Graduati' AND protocol_id IN (SELECT id FROM ai_training_protocols WHERE title = 'Calmare l''Agitazione');

UPDATE ai_training_exercises SET instructions = ARRAY[
  'SIMULAZIONE STRESS: Crea situazioni moderatamente stressanti per testare le tecniche apprese.',
  'TEMPO LIMITE: Imposta un limite di tempo per vedere quanto il pet mantiene la calma.',
  'INCREMENTO GRADUALE: Aumenta progressivamente la durata delle situazioni di test.',
  'MONITORAGGIO PARAMETRI: Osserva frequenza respiratoria, linguaggio corporeo, comportamenti.',
  'INTERVENTO TEMPESTIVO: Fermati immediatamente se il pet supera la soglia di tolleranza.',
  'RINFORZO SUCCESSI: Celebra ogni successo, anche parziale, per costruire fiducia.'
] WHERE title = 'Test di Resistenza' AND protocol_id IN (SELECT id FROM ai_training_protocols WHERE title = 'Calmare l''Agitazione');

UPDATE ai_training_exercises SET instructions = ARRAY[
  'RICONOSCIMENTO IMPULSI: Insegna al pet a riconoscere quando sta per reagire impulsivamente.',
  'COMANDO STOP: Stabilisci un comando chiaro che il pet deve seguire per fermarsi.',
  'TECNICA PAUSA: Insegna al pet a fare una pausa di 5 secondi prima di reagire.',
  'ALTERNATIVE POSITIVE: Offri sempre un''alternativa positiva all''impulso negativo.',
  'PRATICA QUOTIDIANA: Esercita l''autocontrollo in situazioni quotidiane a basso stress.',
  'RINFORZO IMMEDIATO: Premia istantaneamente ogni episodio di autocontrollo riuscito.'
] WHERE title = 'Training di Autocontrollo' AND protocol_id IN (SELECT id FROM ai_training_protocols WHERE title = 'Calmare l''Agitazione');

UPDATE ai_training_exercises SET instructions = ARRAY[
  'POSIZIONE CONFORTEVOLE: Aiuta il pet a trovare la posizione più comoda per rilassarsi.',
  'RILASSAMENTO MUSCOLARE: Guida il pet attraverso tensione e rilasciamento di ogni gruppo muscolare.',
  'RESPIRAZIONE GUIDATA: Modella respirazioni lente e profonde per il pet.',
  'VISUALIZZAZIONE: Usa voce calma per guidare il pet in immagini mentali rilassanti.',
  'DURATA PROGRESSIVA: Inizia con 5 minuti, aumenta gradualmente fino a 20 minuti.',
  'PRATICA REGOLARE: Ripeti l''esercizio sempre alla stessa ora per creare abitudine.'
] WHERE title = 'Training di Rilassamento' AND protocol_id IN (SELECT id FROM ai_training_protocols WHERE title = 'Calmare l''Agitazione');

UPDATE ai_training_exercises SET instructions = ARRAY[
  'TEST COMPRENSIVO: Testa tutte le tecniche apprese in una sessione di valutazione completa.',
  'SCENARI REALISTICI: Simula situazioni reali che il pet potrebbe incontrare quotidianamente.',
  'DOCUMENTAZIONE RISULTATI: Registra per iscritto i progressi e le aree che necessitano rinforzo.',
  'CONFRONTO INIZIALE: Compara i risultati attuali con la valutazione iniziale del protocollo.',
  'PIANIFICAZIONE FUTURA: Crea un piano di mantenimento basato sui risultati ottenuti.',
  'CELEBRAZIONE SUCCESSI: Riconosci e celebra tutti i progressi fatti dal pet durante il percorso.'
] WHERE title = 'Valutazione Finale' AND protocol_id IN (SELECT id FROM ai_training_protocols WHERE title = 'Calmare l''Agitazione');

UPDATE ai_training_exercises SET instructions = ARRAY[
  'PIANIFICAZIONE SETTIMANALE: Stabilisci 2-3 sessioni di mantenimento a settimana.',
  'MONITORAGGIO CONTINUO: Osserva quotidianamente il comportamento del pet per segni di regressione.',
  'RINFORZO PERIODICO: Ripeti le tecniche più efficaci ogni settimana.',
  'ADATTAMENTI STAGIONALI: Modifica il piano in base ai cambiamenti stagionali o di routine.',
  'COINVOLGIMENTO FAMIGLIA: Assicurati che tutti i familiari mantengano l''approccio appreso.',
  'VALUTAZIONI MENSILI: Ogni mese fai una valutazione completa per aggiustare il piano.'
] WHERE title = 'Piano di Mantenimento' AND protocol_id IN (SELECT id FROM ai_training_protocols WHERE title = 'Calmare l''Agitazione');

-- Ora aggiungiamo istruzioni per gli altri protocolli
-- Protocollo: Controllo dell'Aggressività
UPDATE ai_training_exercises SET instructions = ARRAY[
  'ANALISI TRIGGER: Identifica tutti i fattori scatenanti del comportamento aggressivo del pet.',
  'DOCUMENTAZIONE DETTAGLIATA: Registra data, ora, situazione e intensità di ogni episodio aggressivo.',
  'PATTERN RECOGNITION: Cerca schemi ricorrenti negli episodi (orari, luoghi, persone coinvolte).',
  'SOGLIE DI TOLLERANZA: Determina i limiti di tolleranza del pet prima che scatti l''aggressività.',
  'SEGNALI PRECOCI: Impara a riconoscere i segnali che precedono l''episodio aggressivo.',
  'AMBIENTE SICURO: Modifica l''ambiente per ridurre al minimo i trigger identificati.'
] WHERE title = 'Autonomia Guidata' AND protocol_id IN (SELECT id FROM ai_training_protocols WHERE title = 'Controllo dell''Aggressività');