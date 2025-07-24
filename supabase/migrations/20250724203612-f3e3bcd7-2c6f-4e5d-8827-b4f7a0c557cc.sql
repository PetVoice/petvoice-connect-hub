-- Continua con gli altri esercizi del protocollo "Controllo dell'Iperattività"

-- 5. Pausa Obbligatoria
UPDATE ai_training_exercises 
SET 
  instructions = ARRAY[
    '1. SEGNALE VISIVO: Usa un tappetino specifico come "zona pausa" che il pet deve riconoscere visivamente.',
    '2. COMANDO CHIARO: Dai comando "PAUSA" o "STOP" con gesto della mano a palmo aperto verso di lui.',
    '3. GUIDA FISICA: Le prime volte guidalo fisicamente al tappetino senza forzature, solo con incoraggiamento.',
    '4. DURATA CRESCENTE: Inizia con 15 secondi di pausa, aumenta di 10 secondi ogni settimana fino a 2 minuti.',
    '5. NESSUNA INTERAZIONE: Durante la pausa tu non parli, non guardi, non interagisci per non rinforzare l''eccitazione.',
    '6. PREMIO AL TERMINE: Solo quando è completamente calmo per tutto il tempo richiesto, dai premio e liberazione.',
    '7. PRATICA QUOTIDIANA: Ripeti 5-6 volte al giorno durante diversi momenti di iperattività.'
  ],
  description = 'Tecnica di time-out positivo per insegnare pause obbligatorie durante momenti di sovraeccitazione.',
  updated_at = NOW()
WHERE title = 'Pausa Obbligatoria' 
  AND protocol_id IN (SELECT id FROM ai_training_protocols WHERE title = 'Controllo dell''Iperattività');

-- 6. Focus Training Intensivo
UPDATE ai_training_exercises 
SET 
  instructions = ARRAY[
    '1. CONTATTO VISIVO: Inizia ottenendo 3 secondi di contatto visivo costante prima di iniziare qualsiasi attività.',
    '2. COMANDO FOCUS: Insegna comando "GUARDAMI" o "FOCUS" con premio immediato quando ti guarda negli occhi.',
    '3. DISTRAZIONI GRADUATE: Introduce distrazioni progressive (rumori, oggetti, movimento) mentre deve mantenere focus.',
    '4. DURATA ESTESA: Aumenta gradualmente il tempo di focus richiesto da 5 secondi a 1-2 minuti.',
    '5. MOVIMENTO CONTROLLATO: Chiedi focus mentre camminate insieme, durante giochi, in situazioni dinamiche.',
    '6. INTERRUZIONI IMMEDIATE: Se perde focus, ferma tutto immediatamente e ricomincia dal comando base.',
    '7. RINFORZO VARIABILE: Usa premi di valore diverso - maggiore focus = premio migliore.'
  ],
  description = 'Allenamento intensivo per sviluppare capacità di concentrazione e mantenere attenzione focalizzata.',
  updated_at = NOW()
WHERE title = 'Focus Training Intensivo' 
  AND protocol_id IN (SELECT id FROM ai_training_protocols WHERE title = 'Controllo dell''Iperattività');

-- 7. Mental Stimulation Intensiva
UPDATE ai_training_exercises 
SET 
  instructions = ARRAY[
    '1. SESSIONI MULTIPLE: Programma 3-4 sessioni da 15 minuti di stimolazione mentale durante la giornata.',
    '2. PUZZLE COMPLESSI: Usa puzzle che richiedono problem-solving multi-step (apertura scatole, sequenze azioni).',
    '3. GIOCHI OLFATTIVI: Nascondi cibo in multiple locations che richiedono ricerca sistematica e pazienza.',
    '4. COMANDI CONCATENATI: Insegna sequenze di 3-4 comandi da eseguire in ordine specifico.',
    '5. NOVITÀ COSTANTE: Introduce elementi nuovi ogni 2-3 giorni per mantenere la mente attiva.',
    '6. TEMPO LIMITE: Imposta timer per creare senso di urgenza ma senza pressione eccessiva.',
    '7. VALUTAZIONE PROGRESSI: Documenta miglioramenti nella velocità e precisione di risoluzione problemi.'
  ],
  description = 'Programma intensivo di stimolazione cognitiva per stancare la mente e ridurre energia in eccesso.',
  updated_at = NOW()
WHERE title = 'Mental Stimulation Intensiva' 
  AND protocol_id IN (SELECT id FROM ai_training_protocols WHERE title = 'Controllo dell''Iperattività');

-- 8. Impulse Control Avanzato
UPDATE ai_training_exercises 
SET 
  instructions = ARRAY[
    '1. CIBO SOSPESO: Tieni il cibo a mezz''aria per 10-30 secondi prima di darglielo, deve rimanere seduto.',
    '2. PORTA APERTA: Apri la porta di casa ma lui deve aspettare il tuo "OK" prima di uscire.',
    '3. GIOCO INTERROTTO: Durante il gioco più divertente, fermati improvvisamente e chiedi "aspetta" per 15 secondi.',
    '4. STIMOLI FORTI: Presenta stimoli molto eccitanti (palla, guinzaglio) ma deve rimanere calmo fino al comando.',
    '5. TENTAZIONI MULTIPLE: Metti più oggetti interessanti vicino ma deve ignorarli fino al permesso specifico.',
    '6. TEST RESISTENZA: Aumenta gradualmente l''intensità della tentazione e il tempo di attesa richiesto.',
    '7. SCENARIO REALI: Pratica controllo impulsi in situazioni quotidiane (campanello, altri animali, cibo caduto).'
  ],
  description = 'Esercizi avanzati per sviluppare forte autocontrollo di fronte a tentazioni e stimoli eccitanti.',
  updated_at = NOW()
WHERE title = 'Impulse Control Avanzato' 
  AND protocol_id IN (SELECT id FROM ai_training_protocols WHERE title = 'Controllo dell''Iperattività');