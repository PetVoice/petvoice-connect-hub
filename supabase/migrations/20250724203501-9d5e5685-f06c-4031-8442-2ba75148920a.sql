-- Aggiorna tutti gli esercizi dei protocolli "Controllo dell'Iperattività" con istruzioni dettagliate

-- 1. Training di Autocontrollo Dinamico
UPDATE ai_training_exercises 
SET 
  instructions = ARRAY[
    '1. RISCALDAMENTO ATTIVO: Inizia con 3-4 minuti di attività fisica moderata (cammina veloce, gioco leggero) per attivare il corpo.',
    '2. FASE INTENSA: Aumenta l''intensità dell''attività (corsa, gioco di tira e molla, salti) per 2-3 minuti fino ad avere energia alta.',
    '3. COMANDO STOP: Nel momento di massima attivazione, dai un comando fermo e chiaro "STOP" o "FERMO" con gesto della mano.',
    '4. IMMOBILITÀ TOTALE: Il pet deve fermarsi completamente e rimanere immobile per almeno 5 secondi (aumenta gradualmente).',
    '5. PREMIO IMMEDIATO: Nel momento esatto in cui si ferma, premia con entusiasmo e premio ad alto valore.',
    '6. RIPRESA CONTROLLATA: Dopo la pausa, riprendi l''attività con comando "VAI" o "GIOCA" per associare controllo al divertimento.',
    '7. RIPETIZIONI CRESCENTI: Ripeti il ciclo 5-7 volte aumentando progressivamente il tempo di stop richiesto.'
  ],
  description = 'Esercizio fondamentale per insegnare autocontrollo durante l''attività fisica, alternando momenti di alta energia a fermate improvvise.'
WHERE title = 'Training di Autocontrollo Dinamico' 
  AND protocol_id IN (SELECT id FROM ai_training_protocols WHERE title = 'Controllo dell''Iperattività');

-- 2. Puzzle Mentali Progressivi
UPDATE ai_training_exercises 
SET 
  instructions = ARRAY[
    '1. SELEZIONE PUZZLE: Inizia con puzzle alimentari di base (Kong riempito, palla distributrice cibo) per valutare il livello.',
    '2. PRESENTAZIONE CALMA: Mostra il puzzle quando il pet è già in stato calmo, mai durante momenti di iperattivazione.',
    '3. GUIDA INIZIALE: Le prime volte dimostra come funziona, aiutalo a ottenere i primi successi senza frustrazioni.',
    '4. AUMENTO DIFFICOLTÀ: Ogni 3-4 giorni introduci un livello di difficoltà maggiore (labirinti più complessi, meccanismi nuovi).',
    '5. TEMPO LIMITATO: Imposta sessioni di 10-15 minuti massimo per mantenere focus e evitare frustrazione eccessiva.',
    '6. ROTAZIONE STIMOLI: Cambia tipo di puzzle ogni settimana per mantenere il cervello attivo e la curiosità alta.',
    '7. PREMIO PROCESSO: Premia l''impegno e la persistenza, non solo il risultato finale, per incoraggiare problem-solving.'
  ],
  description = 'Stimolazione cognitiva progressiva per stancare la mente, ridurre iperattività attraverso il focus mentale e sviluppare pazienza.'
WHERE title = 'Puzzle Mentali Progressivi' 
  AND protocol_id IN (SELECT id FROM ai_training_protocols WHERE title = 'Controllo dell''Iperattività');

-- 3. Esercizio Fisico Strutturato
UPDATE ai_training_exercises 
SET 
  instructions = ARRAY[
    '1. WARM-UP GRADUALE: 5 minuti di camminata veloce per preparare muscoli e articolazioni senza sovraeccitare.',
    '2. FASE CARDIO: Alterna 2 minuti di corsa con 1 minuto di camminata per 15 minuti totali, mantieni ritmo costante.',
    '3. GIOCHI RIPORTO: 10 minuti di giochi di riporto intensi con palla o frisbee, focalizzati su velocità e precisione.',
    '4. PERCORSO OSTACOLI: Crea un semplice percorso (coni, salti bassi, tunnel) per stimolare coordinazione e focus.',
    '5. MONITORAGGIO SEGNI: Controlla costantemente respiro, salivazione eccessiva e energie per evitare sovraeccitazione.',
    '6. IDRATAZIONE REGOLARE: Pausa acqua ogni 5-7 minuti, specialmente durante temperature elevate o alta intensità.',
    '7. COOL-DOWN STRUTTURATO: Termina con 5 minuti di camminata lenta e stretching per rilassare progressivamente.'
  ],
  description = 'Programma di esercizio fisico intenso ma controllato per scaricare energia in eccesso in modo produttivo e strutturato.'
WHERE title = 'Esercizio Fisico Strutturato' 
  AND protocol_id IN (SELECT id FROM ai_training_protocols WHERE title = 'Controllo dell''Iperattività');

-- 4. Autocontrollo Base
UPDATE ai_training_exercises 
SET 
  instructions = ARRAY[
    '1. COMANDO ASPETTA CIBO: Prima di ogni pasto, richiedi "aspetta" per 5-10 secondi prima di dare l''ok per mangiare.',
    '2. PAUSE DURANTE GIOCO: Durante qualsiasi gioco, ferma l''attività ogni 2-3 minuti chiedendo "calma" per 15 secondi.',
    '3. RESPIRAZIONE GUIDATA: Siediti vicino al pet e respira lentamente e profondamente per 3-5 minuti insieme.',
    '4. PREMIO CALMA IMMEDIATA: Nel momento esatto in cui mostra segni di rilassamento, premia immediatamente con qualcosa di speciale.',
    '5. SESSIONI MICRO: Fai questi esercizi 6-8 volte al giorno per solo 2-3 minuti ciascuna per non sovraccaricare.',
    '6. COMANDO DI RILASCIO: Insegna un comando specifico ("OK" o "VAI") per segnalare quando può riprendere l''attività.',
    '7. CONSISTENZA TOTALE: Applica questi principi sempre, anche durante interazioni casuali, per creare abitudine.'
  ],
  description = 'Esercizi fondamentali di autocontrollo che insegnano a gestire impulsi e sviluppare pazienza in situazioni quotidiane.'
WHERE title = 'Autocontrollo Base' 
  AND protocol_id IN (SELECT id FROM ai_training_protocols WHERE title = 'Controllo dell''Iperattività');