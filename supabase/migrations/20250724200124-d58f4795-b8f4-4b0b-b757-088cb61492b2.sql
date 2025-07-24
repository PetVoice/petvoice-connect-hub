-- Continua con tutti gli altri esercizi che hanno ancora istruzioni incomplete

UPDATE ai_training_exercises SET instructions = ARRAY[
  'IDENTIFICAZIONE SEGNALI: Impara a riconoscere i primi segnali di perdita di controllo: rigidità corporea, respirazione accelerata.',
  'COMANDO STOP FERMO: Usa un comando "STOP" con voce ferma e autoritaria, mai urlando o in modo aggressivo.',
  'REDIRECT IMMEDIATO: Subito dopo il comando, redirigi l''attenzione su un''attività alternativa positiva.',
  'PREMIO ISTANTANEO: Non appena il pet si ferma e ti guarda, premialo immediatamente con bocconcino speciale.',
  'RIPETIZIONE STRUTTURATA: Pratica questa sequenza 5-8 volte al giorno in situazioni controllate.',
  'GENERALIZZAZIONE: Testa il comando in contesti diversi per assicurarti funzioni in ogni situazione.'
] WHERE title = 'Controllo Impulsi Base';

UPDATE ai_training_exercises SET instructions = ARRAY[
  'DISTANZA SICURA: Presenta ogni trigger a distanza tale che il pet lo noti ma rimanga calmo (zona di comfort).',
  'ASSOCIAZIONE IMMEDIATA: Nel momento in cui il pet vede il trigger, dai immediatamente il premio più prezioso.',
  'SESSIONI MICRO: Mantieni ogni sessione sotto i 3 minuti per evitare sovraccarico emotivo.',
  'INCREMENTI GRADUALI: Avvicina il trigger di 50cm solo dopo 3 sessioni di successo alla distanza precedente.',
  'MONITORAGGIO STRESS: Fermati immediatamente se vedi segnali di stress: ansimare, tremare, rigidità.',
  'CONCLUSIONE POSITIVA: Termina sempre ogni sessione con il pet rilassato e premiato.'
] WHERE title = 'Counter-Conditioning Base';

UPDATE ai_training_exercises SET instructions = ARRAY[
  'MICRO-ESPOSIZIONI: Esponi il pet al trigger per massimo 2-3 secondi nelle prime sessioni.',
  'CONTROLLO INTENSITÀ: Usa il trigger al livello più basso possibile: volume minimo, distanza massima, movimento lento.',
  'OSSERVAZIONE CONTINUA: Monitora frequenza respiratoria, postura, pupille per rilevare stress precoce.',
  'STOP PREVENTIVO: Interrompi immediatamente se vedi il primo segnale di escalation, non aspettare.',
  'INCREMENTI MINIMI: Aumenta esposizione di 1 secondo o 10cm alla volta, mai salti improvvisi.',
  'PAUSA OBBLIGATORIA: Lascia sempre 2-3 ore tra una sessione e l''altra per elaborazione emotiva.'
] WHERE title = 'Desensibilizzazione Sistematica';

UPDATE ai_training_exercises SET instructions = ARRAY[
  'MISURAZIONE PRECISA: Usa un metro per misurare esattamente la distanza minima a cui il pet rimane calmo.',
  'MARCATORI VISIVI: Posiziona oggetti colorati per segnare visivamente la distanza di sicurezza.',
  'RISPETTO ASSOLUTO: Non permettere mai a trigger di avvicinarsi oltre questa distanza senza consenso.',
  'RINFORZO DISTANZA: Premia massimamente il pet ogni volta che mantiene la calma alla distanza di sicurezza.',
  'RIDUZIONE GRADUALE: Riduci la distanza di soli 25cm ogni settimana, solo se pet rimane sempre calmo.',
  'PIANO DI BACKUP: Se il pet mostra stress, torna immediatamente alla distanza precedente sicura.'
] WHERE title = 'Distanza di Sicurezza';

UPDATE ai_training_exercises SET instructions = ARRAY[
  'AMBIENTI MULTIPLI: Testa le tecniche apprese in almeno 5 luoghi diversi: casa, giardino, strada, parco.',
  'PERSONE DIVERSE: Pratica il controllo con diverse persone presenti: familiari, estranei, bambini.',
  'ORARI VARIABILI: Esercita il controllo in momenti diversi: mattina, pomeriggio, sera per generalizzare.',
  'STIMOLI CRESCENTI: Aumenta gradualmente la complessità dell''ambiente mantenendo il controllo.',
  'ADATTAMENTO RAPIDO: Modifica le strategie in base al contesto specifico mantenendo i principi base.',
  'DOCUMENTAZIONE CONTESTI: Registra in quali contesti il controllo funziona meglio e in quali serve rinforzo.'
] WHERE title = 'Generalizzazione Contesti';

UPDATE ai_training_exercises SET instructions = ARRAY[
  'REGOLE CIBO: Stabilisci che il pet deve aspettare il tuo permesso prima di mangiare, sempre.',
  'COMANDO LASCIA: Insegna "lascia" con oggetti di valore crescente: bastoncino, giocattolo, cibo.',
  'ESERCIZI CONDIVISIONE: Pratica situazioni dove il pet deve condividere spazio o risorse con altri.',
  'CONTROLLO ACCESSO: Tu decidi sempre quando il pet può accedere a cibo, giocattoli, spazi confortevoli.',
  'RINFORZO COMPORTAMENTO: Premia generosamente ogni volta che il pet condivide o aspetta senza conflitti.',
  'SUPERVISIONE COSTANTE: Non lasciare mai il pet non supervisionato con risorse che potrebbero causare conflitti.'
] WHERE title = 'Gestione delle Risorse';

UPDATE ai_training_exercises SET instructions = ARRAY[
  'SEGNALI PRECOCI: Impara a riconoscere i primi segnali di frustrazione: irrigidimento, respiro veloce, fissare.',
  'INTERVENTO LAMPO: Non appena vedi i primi segnali, intervieni immediatamente con redirect.',
  'DISTRAZIONE POSITIVA: Usa il giocattolo o attività preferita del pet per spostare il focus.',
  'AMBIENTE CALMO: Porta immediatamente il pet in un ambiente meno stimolante e più controllato.',
  'RINFORZO AUTOCONTROLLO: Premia massimamente ogni volta che il pet gestisce frustrazione senza escalation.',
  'PREVENZIONE ATTIVA: Anticipa situazioni frustranti e prepara strategie preventive.'
] WHERE title = 'Gestione Frustrazione';

UPDATE ai_training_exercises SET instructions = ARRAY[
  'CONFINI FISICI: Usa barriere fisiche (cancelletti, guinzagli) per definire chiaramente il territorio del pet.',
  'REGOLE ACCESSO: Stabilisci dove il pet può e non può andare, mantieni sempre le stesse regole.',
  'CONTROLLO ENTRATE: Gestisci personalmente ogni accesso di persone/animali al territorio del pet.',
  'COMPORTAMENTO NEUTRALE: Insegna al pet a rimanere neutrale quando qualcuno entra nel suo territorio.',
  'RINFORZO CONDIVISIONE: Premia ogni volta che il pet accetta presenza di altri nel suo spazio.',
  'SUPERVISIONE ATTIVA: Non lasciare mai il pet incustodito quando ci sono "intrusi" nel suo territorio.'
] WHERE title = 'Gestione Territorio';