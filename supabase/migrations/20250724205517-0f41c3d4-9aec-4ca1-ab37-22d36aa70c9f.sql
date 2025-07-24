-- Aggiorna gli ultimi esercizi di "Calmare l'Agitazione"

-- Desensibilizzazione Progressiva
UPDATE public.ai_training_exercises 
SET 
  tips = ARRAY[
    'Procedi sempre molto lentamente, rispettando i tempi del pet',
    'Mantieni l''intensità degli stimoli ben sotto la soglia di stress',
    'Usa rinforzi positivi ad ogni piccolo progresso',
    'Torna indietro se il pet mostra segni di sovraccarico'
  ],
  success_criteria = ARRAY[
    'Il pet tollera progressivamente stimoli più intensi senza stress',
    'Riduzione graduale delle reazioni di evitamento o paura',
    'Il pet mantiene uno stato rilassato durante l''esposizione controllata',
    'Miglioramento duraturo della soglia di tolleranza'
  ],
  objectives = ARRAY[
    'Ridurre gradualmente la sensibilità a stimoli scatenanti',
    'Aumentare la resilienza emotiva attraverso esposizione controllata',
    'Sostituire reazioni di stress con risposte calme e controllate',
    'Prevenire generalizzazione della paura a nuovi stimoli'
  ]
WHERE title = 'Desensibilizzazione Progressiva' AND protocol_id IN (
  SELECT id FROM public.ai_training_protocols 
  WHERE title ILIKE '%calmare%agitazione%'
);

-- Training di Rilassamento
UPDATE public.ai_training_exercises 
SET 
  tips = ARRAY[
    'Crea associazioni positive tra i comandi di rilassamento e sensazioni piacevoli',
    'Pratica in momenti in cui il pet è già naturalmente calmo',
    'Usa la tua voce e presenza per guidare il rilassamento',
    'Mantieni sessioni brevi e frequenti piuttosto che lunghe e rare'
  ],
  success_criteria = ARRAY[
    'Il pet risponde rapidamente ai segnali di rilassamento',
    'Capacità di autoindurre stati di calma quando necessario',
    'Riduzione del tempo necessario per calmarsi dopo stress',
    'Il pet generalizza le tecniche di rilassamento a nuove situazioni'
  ],
  objectives = ARRAY[
    'Insegnare tecniche specifiche di autoregolazione e rilassamento',
    'Creare risposte condizionate positive ai comandi di calma',
    'Sviluppare strategie di coping per situazioni stressanti',
    'Aumentare la capacità di recupero dopo episodi di agitazione'
  ]
WHERE title = 'Training di Rilassamento' AND protocol_id IN (
  SELECT id FROM public.ai_training_protocols 
  WHERE title ILIKE '%calmare%agitazione%'
);

-- Focus e Concentrazione (se presente in questo protocollo)
UPDATE public.ai_training_exercises 
SET 
  tips = ARRAY[
    'Inizia con esercizi di contatto visivo molto brevi',
    'Premia immediatamente ogni momento di attenzione focalizzata',
    'Elimina tutte le distrazioni dall''ambiente di allenamento',
    'Aumenta gradualmente la durata richiesta del focus'
  ],
  success_criteria = ARRAY[
    'Il pet mantiene il contatto visivo per periodi crescenti di tempo',
    'Riduzione della distraibilità e dell''irrequietezza',
    'Capacità di focalizzare l''attenzione su comando',
    'Miglioramento della concentrazione anche in presenza di distrazioni lievi'
  ],
  objectives = ARRAY[
    'Sviluppare capacità di attenzione focalizzata e sostenuta',
    'Ridurre l''iperattivazione mentale attraverso esercizi di concentrazione',
    'Insegnare a ignorare distrazioni e mantenere il focus',
    'Creare una base per ulteriori addestramenti comportamentali'
  ]
WHERE title = 'Focus e Concentrazione' AND protocol_id IN (
  SELECT id FROM public.ai_training_protocols 
  WHERE title ILIKE '%calmare%agitazione%'
);