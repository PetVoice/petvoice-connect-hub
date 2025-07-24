-- Aggiorna esercizi del protocollo "Recupero dall'Apatia" - PARTE 2

-- Socializzazione Leggera
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. SELEZIONE PARTNER: SCEGLI un pet TRANQUILLO e ben equilibrato che conosci bene',
  '2. TERRITORIO NEUTRO: ORGANIZZA incontro in spazio che NON appartiene a nessuno dei due pet',
  '3. DISTANZA INIZIALE: INIZIA con pet a 5 metri di distanza, avvicinali gradualmente',
  '4. SUPERVISIONE ATTIVA: OSSERVA costantemente linguaggio corporeo di entrambi i pet',
  '5. INTERAZIONE LIBERA: NON forzare contatto, lascia che decidano loro il livello di interazione',
  '6. PREMI INTERESSE: RINFORZA ogni SGUARDO o movimento verso l''altro pet con treat speciali',
  '7. SESSIONI BREVI: MAX 15 minuti per la prima sessione, aumenta gradualmente',
  '8. TERMINE POSITIVO: CONCLUDI sempre quando entrambi sono CALMI e rilassati'
],
updated_at = NOW()
WHERE title = 'Socializzazione Leggera' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Recupero dall''Apatia'
);

-- Esplorazione Territoriale
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. SCELTA LOCATION: TROVA posto NUOVO ma non troppo stimolante, come un parco tranquillo',
  '2. ORARIO STRATEGICO: SCEGLI momenti con POCHI altri animali o persone in giro',
  '3. ESPLORAZIONE LIBERA: LASCIA che il pet scelga la DIREZIONE e il RITMO di esplorazione',
  '4. INCORAGGIAMENTO DISCRETO: SOSTIENI l''esplorazione senza dirigere o forzare',
  '5. PREMI CURIOSITÀ: RINFORZA ogni comportamento esplorativo: annusare, guardare, camminare',
  '6. PAUSE FREQUENTI: CONCEDI soste quando il pet si ferma per elaborare nuovi stimoli',
  '7. SICUREZZA COSTANTE: MANTIENI controllo della situazione per garantire sicurezza',
  '8. DOCUMENTAZIONE: NOTA quali elementi dell''ambiente catturano maggiormente l''interesse'
],
updated_at = NOW()
WHERE title = 'Esplorazione Territoriale' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Recupero dall''Apatia'
);

-- Routine Energizzante
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. PIANIFICAZIONE ORARI: STABILISCI orari FISSI per attività che potrebbero motivare',
  '2. ASSOCIAZIONE PREMI: COLLEGA OGNI attività di routine a rinforzi positivi immediati',
  '3. COSTANZA TEMPORALE: MANTIENI gli stessi orari per creare aspettative positive',
  '4. RITUALI MOTIVANTI: CREA sequenze prevedibili che culminano in esperienze piacevoli',
  '5. CELEBRAZIONE ROUTINE: FESTEGGIA il completamento di ogni routine con entusiasmo',
  '6. PROGRESSIONE GRADUALE: AUMENTA complessità routine solo quando la precedente è consolidata',
  '7. FLESSIBILITÀ NECESSARIA: ADATTA routine se il pet mostra segni di stress o rifiuto',
  '8. MONITORAGGIO ENERGIA: OSSERVA se le routine aumentano effettivamente i livelli energetici'
],
updated_at = NOW()
WHERE title = 'Routine Energizzante' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Recupero dall''Apatia'
);

-- Attività Creativa
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. SETUP PUZZLE: NASCONDI snack in giocattoli puzzle di livello FACILE per garantire successo',
  '2. PERCORSI SEMPLICI: CREA tracce di cibo che portano a scoperte piacevoli',
  '3. PROBLEM-SOLVING ASSISTITO: GUIDA dolcemente il pet verso soluzioni senza sostituirsi',
  '4. PREMI TENTATIVI: RINFORZA ogni TENTATIVO di risolvere, non solo i successi',
  '5. CREATIVITÀ LIBERA: PERMETTI approcci non convenzionali ai puzzle o problemi',
  '6. VARIETÀ STIMOLI: CAMBIA tipo di attività creativa ogni 2-3 sessioni',
  '7. LIVELLO APPROPRIATO: MANTIENI difficoltà BASSA per costruire fiducia nelle capacità',
  '8. TEMPO ILLIMITATO: NON mettere pressione temporale, lascia esplorare liberamente'
],
updated_at = NOW()
WHERE title = 'Attività Creativa' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Recupero dall''Apatia'
);

-- Attività Fisica Moderata  
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. ESTENSIONE GRADUALE: AUMENTA durata passeggiata di solo 5 minuti rispetto al normale',
  '2. ELEMENTI LUDICI: INTRODUCI piccoli giochi durante il cammino: seguire odori, fermarsi a guardare',
  '3. VARIAZIONE PERCORSO: CAMBIA strada abituale per stimolare curiosità senza sovraccaricare',
  '4. RITMO PERSONALIZZATO: ADATTA velocità al pet, NON forzare ritmi che lo stancherebbero',
  '5. RINFORZI MOVIMENTO: PREMIA resistenza e energia con treat ogni 100 metri percorsi',
  '6. GIOCATTOLI PORTATILI: PORTA giochi leggeri per pause attive durante la passeggiata',
  '7. MONITORAGGIO SFORZO: OSSERVA respiro e postura per evitare sovraccarico fisico',
  '8. FINALE POSITIVO: TERMINA passeggiata in posto piacevole con esperienza gratificante'
],
updated_at = NOW()
WHERE title = 'Attività Fisica Moderata' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Recupero dall''Apatia'
);