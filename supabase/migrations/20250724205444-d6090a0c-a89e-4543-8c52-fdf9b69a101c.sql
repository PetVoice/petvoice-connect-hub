-- Completa aggiornamento esercizi "Calmare l'Agitazione" - parte finale

-- Routine Prevedibile
UPDATE public.ai_training_exercises 
SET 
  tips = ARRAY[
    'Mantieni gli stessi orari ogni giorno per creare prevedibilità',
    'Usa sempre la stessa sequenza di azioni per ogni routine',
    'Introduce cambiamenti molto gradualmente e uno alla volta',
    'Crea segnali chiari che indicano l''inizio e la fine delle routine'
  ],
  success_criteria = ARRAY[
    'Il pet anticipa e si prepara per le routine stabilite',
    'Riduzione dell''ansia prima e durante le attività di routine',
    'Il pet mostra comportamenti più calmi durante i cambiamenti programmati',
    'Miglioramento generale del benessere attraverso la prevedibilità'
  ],
  objectives = ARRAY[
    'Creare sicurezza attraverso la prevedibilità delle attività',
    'Ridurre l''ansia legata all''incertezza e ai cambiamenti',
    'Stabilire schemi comportamentali stabili e rassicuranti',
    'Migliorare l''adattamento a nuove situazioni attraverso routine familiari'
  ]
WHERE title = 'Routine Prevedibile' AND protocol_id IN (
  SELECT id FROM public.ai_training_protocols 
  WHERE title ILIKE '%calmare%agitazione%'
);

-- Esercizio Mentale Calmo
UPDATE public.ai_training_exercises 
SET 
  tips = ARRAY[
    'Scegli attività mentali che richiedono concentrazione ma non eccitazione',
    'Mantieni l''ambiente calmo e privo di distrazioni durante l''esercizio',
    'Premia la concentrazione e l''impegno piuttosto che la velocità',
    'Termina sempre l''esercizio prima che il pet si stanchi eccessivamente'
  ],
  success_criteria = ARRAY[
    'Il pet mantiene la concentrazione per periodi progressivamente più lunghi',
    'Riduzione dell''iperattività mentale e fisica',
    'Il pet cerca spontaneamente attività mentali quando è agitato',
    'Miglioramento della capacità di problem-solving in stato rilassato'
  ],
  objectives = ARRAY[
    'Canalizzare l''energia mentale in attività costruttive e calmanti',
    'Sviluppare capacità di concentrazione e focus',
    'Fornire stimolazione cognitiva che promuove la calma',
    'Insegnare strategie di autoregolazione attraverso l''impegno mentale'
  ]
WHERE title = 'Esercizio Mentale Calmo' AND protocol_id IN (
  SELECT id FROM public.ai_training_protocols 
  WHERE title ILIKE '%calmare%agitazione%'
);

-- Mindfulness Guidata
UPDATE public.ai_training_exercises 
SET 
  tips = ARRAY[
    'Mantieni la tua presenza calma e centrata durante l''intera sessione',
    'Usa movimenti lenti e intenzionali per guidare l''attenzione del pet',
    'Respira profondamente e visibilmente per creare un''atmosfera di pace',
    'Non forzare la partecipazione, permetti al pet di unirsi naturalmente'
  ],
  success_criteria = ARRAY[
    'Il pet si sincronizza con il tuo stato di calma e presenza',
    'Riduzione visibile della tensione e dell''agitazione',
    'Il pet rimane presente e attento durante la sessione guidata',
    'Miglioramento della capacità di autoregolazione emotiva'
  ],
  objectives = ARRAY[
    'Insegnare la consapevolezza del momento presente',
    'Sviluppare la capacità di rimanere centrati durante lo stress',
    'Creare connessione profonda attraverso la presenza condivisa',
    'Promuovere stati mentali calmi e riflessivi'
  ]
WHERE title = 'Mindfulness Guidata' AND protocol_id IN (
  SELECT id FROM public.ai_training_protocols 
  WHERE title ILIKE '%calmare%agitazione%'
);

-- Socializzazione Controllata
UPDATE public.ai_training_exercises 
SET 
  tips = ARRAY[
    'Inizia con interazioni molto brevi e positive',
    'Scegli partner sociali calmi e ben bilanciati',
    'Mantieni sempre il controllo dell''ambiente sociale',
    'Termina le interazioni prima che il pet diventi sovrastimolato'
  ],
  success_criteria = ARRAY[
    'Il pet mantiene la calma durante le interazioni sociali',
    'Riduzione di comportamenti di agitazione o aggressività sociale',
    'Il pet cerca attivamente interazioni positive quando si sente sicuro',
    'Miglioramento delle competenze sociali in situazioni controllate'
  ],
  objectives = ARRAY[
    'Sviluppare competenze sociali in ambiente controllato e sicuro',
    'Ridurre l''ansia sociale attraverso esposizione graduale positiva',
    'Insegnare comportamenti appropriati durante le interazioni',
    'Costruire fiducia nelle relazioni sociali'
  ]
WHERE title = 'Socializzazione Controllata' AND protocol_id IN (
  SELECT id FROM public.ai_training_protocols 
  WHERE title ILIKE '%calmare%agitazione%'
);