-- Aggiorna TUTTI gli esercizi con istruzioni dettagliate nel formato richiesto dal utente

UPDATE ai_training_exercises SET instructions = ARRAY[
  'REVISIONE SISTEMATICA: Ripassa una per una tutte le routine apprese durante il protocollo, dedicando 5 minuti a ciascuna.',
  'VERIFICA AUTOMATISMI: Testa se il pet esegue le routine senza il tuo aiuto costante, osserva il livello di autonomia raggiunto.',
  'CONSOLIDAMENTO SEQUENZE: Pratica l''intera sequenza di routine dall''inizio alla fine senza interruzioni per 20 minuti.',
  'RINFORZO POSITIVO: Celebra ogni routine eseguita correttamente con lodi entusiastiche e premi fisici.',
  'IDENTIFICAZIONE PUNTI FORTI: Annota quali routine il pet padroneggia meglio per usarle come base di fiducia.',
  'PREPARAZIONE MANTENIMENTO: Stabilisci un programma settimanale di rinforzo per mantenere le routine apprese.'
] WHERE title = 'Consolidamento Routine';

UPDATE ai_training_exercises SET instructions = ARRAY[
  'RIDUZIONE SUPPORTO: Riduci il tuo aiuto del 25% ogni settimana, iniziando dalle routine che il pet padroneggia meglio.',
  'OSSERVAZIONE DISTANTE: Posizionati a 3-5 metri di distanza e osserva se il pet esegue le routine autonomamente.',
  'INTERVENTO MINIMALE: Intervieni solo se il pet si blocca completamente per più di 30 secondi, poi ritorna a distanza.',
  'DOCUMENTAZIONE DETTAGLIATA: Registra per iscritto il livello di autonomia raggiunto per ogni routine (scala 1-10).',
  'TEST PROGRESSIVI: Aumenta gradualmente la difficoltà delle situazioni in cui richiedi autonomia.',
  'CELEBRAZIONE INDIPENDENZA: Premia massimamente ogni episodio di autonomia riuscita per rinforzare l''indipendenza.'
] WHERE title = 'Test di Autonomia Graduale';

UPDATE ai_training_exercises SET instructions = ARRAY[
  'INVENTARIO COMPLETO: Elenca tutti i possibili trigger di aggressività (persone, animali, oggetti, situazioni, rumori).',
  'SCALA DI INTENSITÀ: Valuta ogni trigger da 1 (lieve reazione) a 10 (aggressività massima) basandoti su episodi passati.',
  'DOCUMENTAZIONE EPISODI: Registra data, ora, contesto e intensità di ogni episodio aggressivo delle ultime 4 settimane.',
  'COMPORTAMENTI SPECIFICI: Annota esattamente cosa fa il pet (ringhia, abbaia, si irrigidisce, attacca) per ogni trigger.',
  'DISTANZE CRITICHE: Misura a che distanza da ogni trigger il pet inizia a mostrare i primi segnali di agitazione.',
  'BASELINE SICUREZZA: Stabilisci la situazione più calma possibile come punto di partenza per il training.'
] WHERE title = 'Assessment Iniziale Aggressività';

UPDATE ai_training_exercises SET instructions = ARRAY[
  'PREPARAZIONE PERCORSO: Scegli un percorso di 200 metri in zona molto tranquilla, senza altri cani o distrazioni forti.',
  'GUINZAGLIO CORTO: Usa guinzaglio di massimo 1.5 metri per mantenere controllo costante vicino alla tua gamba.',
  'MONITORAGGIO COSTANTE: Osserva ogni 10 secondi il linguaggio corporeo del pet: tensione muscolare, orecchie, coda.',
  'STOP PREVENTIVI: Fermati immediatamente ai primi segnali di agitazione, attendi che il pet si calmi prima di proseguire.',
  'COMANDI IN MOVIMENTO: Pratica "seduto", "aspetta", "vieni" ogni 50 metri per mantenere focus su di te.',
  'RINFORZO CAMMINATA: Premia con bocconcini ogni 30 secondi di camminata calma al guinzaglio.'
] WHERE title = 'Autocontrollo in Movimento';

UPDATE ai_training_exercises SET instructions = ARRAY[
  'PIANIFICAZIONE EVENTO: Organizza una "festa" speciale con l''attività più gradita al pet (gioco preferito, cibo speciale).',
  'SIMBOLI TANGIBILI: Crea un "diploma" fatto a mano o compra un nuovo collare/medaglietta come premio simbolico.',
  'DOCUMENTAZIONE RICORDI: Scatta foto del pet durante la celebrazione e crea un album dei progressi fatti.',
  'CONDIVISIONE FAMIGLIA: Coinvolgi tutti i membri della famiglia nella celebrazione per massimizzare il rinforzo sociale.',
  'RINFORZO EMOTIVO: Usa tono di voce entusiasta e carezze prolungate per comunicare quanto sei orgoglioso.',
  'CHIUSURA POSITIVA: Termina la celebrazione con un momento di calma e affetto per consolidare il legame.'
] WHERE title = 'Celebrazione Finale';

UPDATE ai_training_exercises SET instructions = ARRAY[
  'DOCUMENTAZIONE COMPLETA: Crea un report scritto con tutti i miglioramenti comportamentali osservati settimana per settimana.',
  'EVIDENZE FOTOGRAFICHE: Confronta foto/video del pet prima e dopo il training per mostrare i cambiamenti.',
  'CERTIFICATO SIMBOLICO: Disegna o stampa un certificato con il nome del pet e i traguardi raggiunti.',
  'CONDIVISIONE RISULTATI: Presenta i risultati a famiglia/amici per rinforzare socialmente i progressi del pet.',
  'PORTFOLIO COMPETENZE: Elenca tutte le nuove competenze acquisite dal pet durante il protocollo.',
  'PIANIFICAZIONE FUTURA: Usa questa documentazione per pianificare obiettivi futuri e mantenimento.'
] WHERE title = 'Certificazione Progressi';

UPDATE ai_training_exercises SET instructions = ARRAY[
  'COMANDO UNIVERSALE: Stabilisci un comando di emergenza unico ("STOP", "BASTA") da usare solo in situazioni critiche.',
  'PRATICA INTENSIVA: Esercita il comando 10 volte al giorno in situazioni non critiche per automatizzarlo.',
  'RICHIAMO IMMEDIATO: Dopo il comando di stop, chiama immediatamente il pet verso di te con richiamo di emergenza.',
  'SIMULAZIONI REALISTICHE: Crea scenari di emergenza controllati per testare l''efficacia del comando.',
  'RINFORZO MASSIMO: Premia con i bocconcini più preziosi ogni volta che il pet risponde al comando di emergenza.',
  'CONTROLLO VOCALE: Pratica il comando con diversi toni di voce per assicurarti funzioni anche urlando.'
] WHERE title = 'Comando Emergenza';

UPDATE ai_training_exercises SET instructions = ARRAY[
  'SELEZIONE MIGLIORI: Identifica i 3 esercizi che hanno dato i risultati migliori e ripetili quotidianamente.',
  'RINFORZO AUTOMATICO: Pratica i comportamenti positivi appresi fino a che diventano automatici senza comando.',
  'RIMOZIONE GRADUALE: Rimuovi un supporto alla volta (guinzaglio, ricompense, comandi) mantenendo il comportamento.',
  'GENERALIZZAZIONE: Pratica i comportamenti appresi in contesti sempre diversi per generalizzare l''apprendimento.',
  'MONITORAGGIO QUALITÀ: Verifica che la qualità dei comportamenti rimanga alta anche senza supporti.',
  'PIANO MANTENIMENTO: Stabilisci sessioni di rinforzo bi-settimanali per mantenere i guadagni ottenuti.'
] WHERE title = 'Consolidamento Gains';