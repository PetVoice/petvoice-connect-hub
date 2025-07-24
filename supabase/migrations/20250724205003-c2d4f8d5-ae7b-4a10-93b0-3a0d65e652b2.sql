UPDATE public.ai_training_exercises 
SET instructions = ARRAY[
  '1. IDENTIFICAZIONE STRESSOR: Ispeziona attentamente l''ambiente per identificare tutti i possibili elementi di stress (rumori forti, luci intense, odori sgradevoli, oggetti che potrebbero spaventare)',
  '2. CONTROLLO ILLUMINAZIONE: Regola le luci per creare un''illuminazione soffusa e costante, evita luci lampeggianti o troppo intense che potrebbero aumentare l''ansia',
  '3. GESTIONE AUDIO: Elimina rumori forti o improvvisi, introduce musica rilassante o suoni della natura a volume basso per creare un''atmosfera calmante',
  '4. REGOLAZIONE TEMPERATURA: Assicurati che la temperatura sia confortevole (18-22°C), evita correnti d''aria o calore eccessivo che potrebbero causare disagio',
  '5. POSIZIONAMENTO COMFORT ITEMS: Disponi oggetti familiari e rassicuranti (coperte morbide, giocattoli preferiti, cuscini) in posizioni facilmente accessibili',
  '6. CREAZIONE ZONA RIFUGIO: Stabilisci un''area specifica dove il pet può ritirarsi quando si sente ansioso, rendila accogliente e sempre disponibile',
  '7. TEST AMBIENTE: Osserva il comportamento del pet nell''ambiente modificato, registra i suoi livelli di rilassamento e aggiusta l''ambiente se necessario'
],
tips = ARRAY[
  'Mantieni la routine dell''ambiente sicuro per creare prevedibilità',
  'Usa diffusori di feromoni calmanti se appropriato per la specie',
  'Evita cambiamenti improvvisi nell''ambiente una volta stabilito',
  'Monitora il linguaggio del corpo per segni di riduzione dell''ansia'
],
objectives = ARRAY[
  'Ridurre i fattori ambientali che contribuiscono all''ansia',
  'Creare associazioni positive con l''ambiente domestico',
  'Stabilire uno spazio sicuro di riferimento per il pet',
  'Migliorare il senso di sicurezza e controllo del pet'
],
success_criteria = ARRAY[
  'Il pet mostra segni visibili di rilassamento nell''ambiente modificato',
  'Riduzione di comportamenti ansiosi come tremori, ansimare eccessivo o nascondersi',
  'Il pet utilizza spontaneamente la zona rifugio quando disponibile',
  'Miglioramento generale del comportamento e dell''umore in casa'
]
WHERE protocol_id IN (
  SELECT id FROM public.ai_training_protocols 
  WHERE title ILIKE '%gestione%ansia%' OR title ILIKE '%ansia%'
) 
AND title = 'Creazione Ambiente Sicuro';