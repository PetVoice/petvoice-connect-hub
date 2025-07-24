-- Aggiorna esercizi del protocollo "Recupero dall'Apatia" - PARTE 3

-- Sfida Mentale Progressiva
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. INCREMENTO DIFFICOLTÀ: AUMENTA complessità puzzle del 20% rispetto alla sessione precedente',
  '2. TRICK NUOVO SEMPLICE: INSEGNA comando FACILE che può imparare in 2-3 tentativi per successo immediato',
  '3. CLICKER TRAINING: USA clicker SOLO se il pet risponde positivamente, altrimenti sostituisci con voce',
  '4. PREMI PROBLEM-SOLVING: RINFORZA il PROCESSO di pensiero, non solo il risultato finale',
  '5. SESSIONI BREVI: MAX 15 minuti per mantenere concentrazione senza affaticamento mentale',
  '6. VARIETÀ COGNITIVA: ALTERNA puzzle spaziali, logici e di memoria per stimolare diverse aree',
  '7. SUPPORTO GRADUALE: RIDUCI aiuto progressivamente man mano che il pet diventa più sicuro',
  '8. CELEBRAZIONE PROGRESSI: FESTEGGIA ogni piccolo miglioramento con entusiasmo genuino'
],
updated_at = NOW()
WHERE title = 'Sfida Mentale Progressiva' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Recupero dall''Apatia'
);

-- Interazione Intensa  
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. ATTENZIONE ESCLUSIVA: DEDICA tempo SOLO al pet, elimina tutte le distrazioni esterne',
  '2. COMUNICAZIONE VISIVA: PRATICA giochi di sguardi prolungati per rinforzare connessione',
  '3. TRAINING PERSONALIZZATO: CONCENTRATI sui suoi PUNTI FORTI naturali per costruire fiducia',
  '4. CELEBRAZIONE CONNESSIONE: FESTEGGIA ogni momento di connessione profonda raggiunto insieme',
  '5. LINGUAGGIO CORPOREO: USA posture aperte e movimenti che invitano all''interazione',
  '6. SINTONIZZAZIONE EMOTIVA: ADATTA il tuo stato emotivo a quello del pet per creare armonia',
  '7. QUALITÀ TEMPO: PRIVILEGIA qualità dell''interazione sulla quantità di tempo speso',
  '8. RISPETTO SPAZI: RISPETTA quando il pet ha bisogno di spazio, non forzare l''intimità'
],
updated_at = NOW()
WHERE title = 'Interazione Intensa' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Recupero dall''Apatia'
);

-- Stimolazione Multisensoriale
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. COMBINAZIONE SINERGICA: COMBINA 2-3 sensi contemporaneamente: suono+odore, texture+sapore',
  '2. PERCORSO SENSORIALE: CREA stazioni con diverse esperienze sensoriali da esplorare in sequenza',
  '3. ESPLORAZIONE ATTIVA: PREMIA ogni TENTATIVO di esplorazione sensoriale con rinforzi immediati',
  '4. AMBIENTE SICURO: ASSICURATI che TUTTI gli stimoli siano sicuri e adatti alla specie',
  '5. ROTAZIONE ESPERIENZE: CAMBIA combinazioni sensoriali ogni 5 minuti per mantenere novità',
  '6. INTENSITÀ GRADUALE: INIZIA con stimoli LIEVI e aumenta intensità solo se ben tollerati',
  '7. SCELTA AUTONOMA: PERMETTI al pet di SCEGLIERE quali stimoli esplorare e per quanto tempo',
  '8. INTEGRAZIONE PROGRESSIVA: COMBINA esperienze sensoriali gradualmente, non tutte insieme'
],
updated_at = NOW()
WHERE title = 'Stimolazione Multisensoriale' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Recupero dall''Apatia'
);

-- Avventura Controllata
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. DESTINAZIONE NUOVA: VISITA luogo completamente NUOVO ma non eccessivamente stimolante',
  '2. KIT COMFORT: PORTA oggetti familiari: copertina preferita, giocattolo del cuore, snack speciali',
  '3. DOCUMENTAZIONE REAZIONI: FOTOGRAFA o annota reazioni positive per future referenze',
  '4. DURATA LIMITATA: TORNA PRIMA che il pet mostri segni di stanchezza o stress',
  '5. RITMO PERSONALE: LASCIA che il pet esplori al SUO ritmo senza pressioni temporali',
  '6. SICUREZZA PRIORITARIA: MANTIENI controllo ambiente per garantire esperienza solo positiva',
  '7. RINFORZI CORAGGIO: PREMIA ogni comportamento coraggioso o curioso verso il nuovo ambiente',
  '8. FINALE MEMORABILE: CONCLUDI avventura con esperienza particolarmente piacevole o gustosa'
],
updated_at = NOW()
WHERE title = 'Avventura Controllata' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Recupero dall''Apatia'
);

-- Gioco Sociale Attivo
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. PARTNER IDEALE: SCEGLI pet energico ma GENTILE che possa motivare senza intimidire',
  '2. SUPERVISIONE DISCRETA: OSSERVA senza interferire troppo, intervieni solo se necessario',
  '3. PREMI COMPORTAMENTI SOCIALI: RINFORZA ogni iniziativa di gioco o interazione positiva',
  '4. GESTIONE ENERGIA: MONITORA livelli energetici per evitare sovraeccitazione o esaurimento',
  '5. SPAZIO ADEGUATO: USA area ampia che permetta movimento libero e zone di ritiro',
  '6. PAUSE STRATEGICHE: CONCEDI pause quando l''energia diventa troppo intensa',
  '7. TERMINE POSITIVO: CHIUDI sessione mentre entrambi i pet sono ancora felici e attivi',
  '8. PROGRESSIONE SOCIALE: AUMENTA gradualmente durata e intensità delle interazioni sociali'
],
updated_at = NOW()
WHERE title = 'Gioco Sociale Attivo' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Recupero dall''Apatia'
);