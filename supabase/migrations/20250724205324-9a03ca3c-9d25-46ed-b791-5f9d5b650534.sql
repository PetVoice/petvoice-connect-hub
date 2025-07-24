-- Aggiorna tutti gli esercizi di "Calmare l'Agitazione" con tips e success_criteria

-- Ambiente di Calma
UPDATE public.ai_training_exercises 
SET 
  tips = ARRAY[
    'Mantieni l''ambiente sempre pulito e ordinato per ridurre stress',
    'Usa colori neutri e rilassanti nell''arredamento',
    'Evita rumori improvvisi durante la sessione',
    'Controlla che la temperatura sia confortevole'
  ],
  success_criteria = ARRAY[
    'Il pet mostra segni visibili di rilassamento (respirazione più lenta, postura distesa)',
    'Riduzione di comportamenti di stress come ansimare o tremare',
    'Il pet rimane nell''area designata senza cercare di fuggire',
    'Diminuzione generale dell''agitazione nel corso della sessione'
  ],
  objectives = ARRAY[
    'Creare un ambiente che promuova la calma e il rilassamento',
    'Ridurre i fattori ambientali che causano agitazione',
    'Stabilire associazioni positive con lo spazio di tranquillità',
    'Fornire un rifugio sicuro quando il pet si sente sovraccarico'
  ]
WHERE title = 'Ambiente di Calma' AND protocol_id IN (
  SELECT id FROM public.ai_training_protocols 
  WHERE title ILIKE '%calmare%agitazione%'
);

-- Movimenti Lenti  
UPDATE public.ai_training_exercises 
SET 
  tips = ARRAY[
    'Muoviti sempre in modo prevedibile e graduale',
    'Evita gesti bruschi o movimenti improvvisi',
    'Parla con voce calma e tranquilla durante i movimenti',
    'Osserva le reazioni del pet e rallenta se necessario'
  ],
  success_criteria = ARRAY[
    'Il pet non si startisce o si allontana dai tuoi movimenti',
    'Riduzione della tensione muscolare nel pet',
    'Il pet mantiene il contatto visivo senza segni di stress',
    'Miglioramento graduale della tolleranza ai movimenti umani'
  ],
  objectives = ARRAY[
    'Insegnare al pet a rimanere calmo in presenza di movimento umano',
    'Ridurre l''ipervigilanza e le reazioni eccessive',
    'Creare prevedibilità nelle interazioni fisiche',
    'Sviluppare fiducia attraverso movimenti controllati'
  ]
WHERE title = 'Movimenti Lenti' AND protocol_id IN (
  SELECT id FROM public.ai_training_protocols 
  WHERE title ILIKE '%calmare%agitazione%'
);

-- Respirazione Sincronizzata
UPDATE public.ai_training_exercises 
SET 
  tips = ARRAY[
    'Respira in modo visibilmente profondo e lento per dare l''esempio',
    'Posizionati vicino al pet mantenendo una postura rilassata',
    'Usa la tua respirazione come ritmo guida per l''intera sessione',
    'Mantieni il contatto visivo dolce durante la sincronizzazione'
  ],
  success_criteria = ARRAY[
    'Il pet inizia a sincronizzare il ritmo respiratorio con il tuo',
    'Visibile rallentamento della respirazione del pet',
    'Riduzione dell''ansimare eccessivo o irregolare',
    'Il pet mantiene una posizione rilassata durante l''esercizio'
  ],
  objectives = ARRAY[
    'Sincronizzare i ritmi fisiologici per promuovere calma',
    'Insegnare tecniche di autoregolazione respiratoria',
    'Rafforzare il legame through shared breathing patterns',
    'Ridurre l''attivazione del sistema nervoso simpatico'
  ]
WHERE title = 'Respirazione Sincronizzata' AND protocol_id IN (
  SELECT id FROM public.ai_training_protocols 
  WHERE title ILIKE '%calmare%agitazione%'
);

-- Massaggio Calmante
UPDATE public.ai_training_exercises 
SET 
  tips = ARRAY[
    'Inizia sempre con tocchi leggeri e aumenta gradualmente la pressione',
    'Rispetta le zone che il pet preferisce evitare',
    'Usa movimenti circolari lenti e costanti',
    'Fermati immediatamente se il pet mostra segni di disagio'
  ],
  success_criteria = ARRAY[
    'Il pet si rilassa visibilmente sotto il tocco',
    'Riduzione della tensione muscolare nelle aree massaggiate',
    'Il pet cerca attivamente il contatto fisico',
    'Diminuzione generale dei livelli di stress corporeo'
  ],
  objectives = ARRAY[
    'Rilasciare la tensione muscolare attraverso il tocco terapeutico',
    'Aumentare la produzione di endorfine e ossitocina',
    'Rafforzare il legame attraverso il contatto fisico positivo',
    'Insegnare al pet ad associare il tocco umano con il relax'
  ]
WHERE title = 'Massaggio Calmante' AND protocol_id IN (
  SELECT id FROM public.ai_training_protocols 
  WHERE title ILIKE '%calmare%agitazione%'
);