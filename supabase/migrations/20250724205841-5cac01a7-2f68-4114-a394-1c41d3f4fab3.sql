-- Continua aggiornamento esercizi "Gestione dell'Ansia"

-- Respirazione 4-7-8 Avanzata
UPDATE public.ai_training_exercises 
SET instructions = ARRAY[
  '1. PREPARAZIONE AMBIENTE: Trova un luogo completamente tranquillo e silenzioso, elimina tutte le distrazioni e siediti comodamente accanto al pet',
  '2. SINCRONIZZAZIONE INIZIALE: Stabilisci un contatto visivo dolce con il pet e inizia a respirare normalmente per creare connessione',
  '3. FASE INSPIRAZIONE: Inspira lentamente e profondamente per 4 secondi mantenendo il contatto visivo, rendendo la respirazione visibile e udibile',
  '4. FASE RITENZIONE: Trattieni il respiro per 7 secondi continuando a mantenere contatto visivo sereno e rassicurante con il pet',
  '5. FASE ESPIRAZIONE: Espira molto lentamente per 8 secondi, possibilmente emettendo un leggero suono rilassante che il pet possa percepire',
  '6. RIPETIZIONE CICLICA: Ripeti questo ciclo completo per 5-7 volte, osservando come il pet gradualmente si sincronizza con il tuo ritmo',
  '7. CONSOLIDAMENTO: Termina con alcuni minuti di respirazione naturale condivisa, rinforzando la sensazione di calma raggiunta insieme'
],
tips = ARRAY[
  'Mantieni sempre un''espressione serena e rilassata durante tutto l''esercizio',
  'Se il pet si agita, torna a respirazione normale e riprova più tardi',
  'Usa questa tecnica come routine quotidiana per massimizzare i benefici',
  'Adatta i tempi se necessario - l''importante è la regolarità, non la precisione'
],
success_criteria = ARRAY[
  'Il pet si sincronizza visibilmente con il tuo ritmo respiratorio',
  'Riduzione dell''ansimare eccessivo e normalizzazione del respiro',
  'Il pet rimane calmo e presente durante tutto l''esercizio',
  'Effetto calmante duraturo anche dopo la fine della sessione'
],
objectives = ARRAY[
  'Insegnare una tecnica specifica di autoregolazione respiratoria',
  'Attivare il sistema nervoso parasimpatico per indurre calma',
  'Creare un ritual di connessione e sincronizzazione con il pet',
  'Fornire uno strumento immediato per gestire episodi ansiosi acuti'
]
WHERE title = 'Respirazione 4-7-8 Avanzata' AND protocol_id IN (
  SELECT id FROM public.ai_training_protocols 
  WHERE title ILIKE '%gestione%ansia%'
);

-- Massaggio Anti-Stress
UPDATE public.ai_training_exercises 
SET instructions = ARRAY[
  '1. PREPARAZIONE AMBIENTE: Riscalda l''ambiente e prepara tutto il necessario, assicurati che l''olio sia a temperatura ambiente e il pet sia rilassato',
  '2. APPROCCIO INIZIALE: Inizia con carezze leggere sulla testa usando solo le dita, permettendo al pet di abituarsi al tocco prolungato',
  '3. ZONA ORECCHIE: Massaggia molto delicatamente dietro le orecchie con movimenti circolari piccoli, questa zona è particolarmente efficace per il rilassamento',
  '4. AREA COLLO: Procedi con movimenti circolari lenti e costanti sul collo, prestando attenzione alla tensione muscolare e sciogliendola gradualmente',
  '5. SPALLE E MUSCOLI: Massaggia dolcemente le spalle con pressione leggera ma ferma, concentrandoti sui punti dove senti tensione muscolare',
  '6. SCHIENA LONGITUDINALE: Termina con carezze lunghe e fluide lungo tutta la schiena, dal collo alla coda, per integrare tutto il lavoro svolto',
  '7. INTEGRAZIONE FINALE: Concludi con alcuni minuti di carezze normali per permettere al pet di integrare le sensazioni di rilassamento'
],
tips = ARRAY[
  'Fermati immediatamente se il pet mostra segni di disagio o tensione',
  'Usa sempre movimenti lenti e prevedibili per non startlare il pet',
  'L''olio deve essere specificamente formulato per animali - mai prodotti umani',
  'Osserva il linguaggio del corpo per identificare le zone preferite'
],
success_criteria = ARRAY[
  'Il pet si rilassa progressivamente durante il massaggio',
  'Riduzione visibile della tensione muscolare nelle aree trattate',
  'Il pet cerca attivamente il contatto e il massaggio',
  'Stato di rilassamento prolungato anche dopo la fine del trattamento'
],
objectives = ARRAY[
  'Rilasciare la tensione fisica accumulata a causa dell''ansia',
  'Aumentare la produzione di endorfine e ossitocina naturali',
  'Rafforzare il legame di fiducia attraverso il tocco terapeutico',
  'Insegnare al pet ad associare il tocco umano con sensazioni positive'
]
WHERE title = 'Massaggio Anti-Stress' AND protocol_id IN (
  SELECT id FROM public.ai_training_protocols 
  WHERE title ILIKE '%gestione%ansia%'
);