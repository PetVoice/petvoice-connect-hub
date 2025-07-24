-- Continua aggiornamento esercizi "Calmare l'Agitazione"

-- Esercizi di Grounding
UPDATE public.ai_training_exercises 
SET 
  tips = ARRAY[
    'Usa oggetti con texture diverse per stimolare i sensi',
    'Inizia con stimoli familiari e gradualmente introduci novità',
    'Mantieni le sessioni brevi per evitare sovrastimolazione',
    'Osserva quali texture il pet preferisce e usa quelle come punto di partenza'
  ],
  success_criteria = ARRAY[
    'Il pet esplora attivamente gli oggetti senza ansia',
    'Riduzione di comportamenti di evitamento o fuga',
    'Il pet mantiene il focus sugli stimoli sensoriali',
    'Miglioramento della capacità di concentrazione'
  ],
  objectives = ARRAY[
    'Ancorare il pet al momento presente attraverso stimoli sensoriali',
    'Ridurre l''iperattivazione mentale e fisica',
    'Sviluppare capacità di autoregolazione sensoriale',
    'Creare strategie di coping per momenti di stress'
  ]
WHERE title = 'Esercizi di Grounding' AND protocol_id IN (
  SELECT id FROM public.ai_training_protocols 
  WHERE title ILIKE '%calmare%agitazione%'
);

-- Gioco Strutturato
UPDATE public.ai_training_exercises 
SET 
  tips = ARRAY[
    'Mantieni le regole del gioco semplici e costanti',
    'Usa giochi che richiedono concentrazione ma non eccitazione eccessiva',
    'Termina sempre il gioco con il pet in stato calmo',
    'Adatta l''intensità del gioco al livello di agitazione del pet'
  ],
  success_criteria = ARRAY[
    'Il pet partecipa al gioco senza diventare sovraeccitato',
    'Capacità di seguire regole semplici durante il gioco',
    'Il pet si calma rapidamente alla fine della sessione',
    'Miglioramento del controllo degli impulsi durante l''attività'
  ],
  objectives = ARRAY[
    'Canalizzare l''energia in attività controllate e positive',
    'Insegnare autocontrollo attraverso regole di gioco',
    'Fornire stimolazione mentale in modo strutturato',
    'Rafforzare la relazione attraverso interazioni positive'
  ]
WHERE title = 'Gioco Strutturato' AND protocol_id IN (
  SELECT id FROM public.ai_training_protocols 
  WHERE title ILIKE '%calmare%agitazione%'
);

-- Stimoli Graduati
UPDATE public.ai_training_exercises 
SET 
  tips = ARRAY[
    'Inizia sempre con stimoli molto leggeri e aumenta gradualmente',
    'Fermati immediatamente se il pet mostra segni di stress',
    'Mantieni sessioni brevi per prevenire la sovrastimolazione',
    'Usa rinforzi positivi ad ogni piccolo progresso'
  ],
  success_criteria = ARRAY[
    'Il pet tollera stimoli progressivamente più intensi',
    'Riduzione delle reazioni eccessive a stimoli comuni',
    'Mantenimento della calma durante l''esposizione graduale',
    'Miglioramento della soglia di tolleranza allo stress'
  ],
  objectives = ARRAY[
    'Desensibilizzare gradualmente il pet a stimoli scatenanti',
    'Aumentare la soglia di tolleranza agli stress ambientali',
    'Sviluppare resilienza emotiva attraverso esposizione controllata',
    'Prevenire reazioni eccessive in situazioni quotidiane'
  ]
WHERE title = 'Stimoli Graduati' AND protocol_id IN (
  SELECT id FROM public.ai_training_protocols 
  WHERE title ILIKE '%calmare%agitazione%'
);

-- Training di Autocontrollo
UPDATE public.ai_training_exercises 
SET 
  tips = ARRAY[
    'Inizia con esercizi di autocontrollo molto semplici',
    'Premia immediatamente ogni comportamento di autocontrollo',
    'Mantieni le aspettative realistiche e aumenta gradualmente',
    'Usa comandi chiari e coerenti per facilitare l''apprendimento'
  ],
  success_criteria = ARRAY[
    'Il pet riesce a controllare impulsi immediate quando richiesto',
    'Aumento del tempo di attesa prima di reagire a stimoli',
    'Riduzione di comportamenti impulsivi e reattivi',
    'Miglioramento della capacità di rispondere a comandi di calma'
  ],
  objectives = ARRAY[
    'Sviluppare la capacità di autoregolazione comportamentale',
    'Insegnare a gestire impulsi e reazioni immediate',
    'Aumentare la tolleranza alla frustrazione',
    'Creare schemi comportamentali più controllati e riflessivi'
  ]
WHERE title = 'Training di Autocontrollo' AND protocol_id IN (
  SELECT id FROM public.ai_training_protocols 
  WHERE title ILIKE '%calmare%agitazione%'
);