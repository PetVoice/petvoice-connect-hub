UPDATE public.ai_training_exercises 
SET 
  objectives = ARRAY[
    'Sincronizzare i ritmi fisiologici per promuovere calma',
    'Insegnare tecniche di autoregolazione respiratoria', 
    'Rafforzare il legame attraverso la sincronizzazione',
    'Ridurre l''attivazione del sistema nervoso simpatico'
  ],
  tips = ARRAY[
    'Respira tu stesso in modo visibile e profondo',
    'Mantieni una postura rilassata e aperta',
    'Sincronizza il tuo ritmo con quello del pet',
    'Crea un''atmosfera di calma e presenza'
  ],
  success_criteria = ARRAY[
    'Il pet sincronizza il ritmo respiratorio',
    'Visibile rallentamento della respirazione',
    'Riduzione dell''ansimare eccessivo',
    'Il pet mantiene posizione rilassata durante l''esercizio'
  ]
WHERE id = '8300fa20-a67f-4d3e-afc1-bfe7f0b0c3ed';