-- Continua aggiornamento esercizi "Riduzione dello Stress" - PARTE 2

-- Introduzione Stimoli Positivi
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. PLAYLIST TERAPEUTICA: SELEZIONE di musica classica a 60-70 BPM che sincronizza il battito cardiaco',
  '2. AROMI SPECIFICI: USA diffusori con lavanda, camomilla o feromoni specifici per la specie del pet',
  '3. TESSUTI COMFORT: INTRODUCI materiali morbidi come pile, lana merino o cotone organico',
  '4. ILLUMINAZIONE GRADUATA: INSTALLA luci dimmerabili con temperatura colore 2700K-3000K',
  '5. SUPERFICI TATTILI: AGGIUNGI tappeti sensoriali con diverse texture per stimolazione positiva',
  '6. ROUTINE ASSOCIATIVA: COMBINA sempre gli stessi stimoli nello stesso ordine per creare memoria positiva',
  '7. INTENSITÀ CONTROLLATA: INIZIA con stimoli a bassa intensità e AUMENTA gradualmente',
  '8. MONITORAGGIO REAZIONI: OSSERVA se il pet cerca attivamente questi stimoli positivi'
],
updated_at = NOW()
WHERE title = 'Introduzione Stimoli Positivi' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Riduzione dello Stress'
);

-- Routine Prevedibile  
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. ORARI FISSI PASTI: SERVIR sempre alle 8:00, 13:00 e 18:00 con margine di errore MAX 10 minuti',
  '2. PERCORSI IDENTICI: USA sempre gli STESSI percorsi per le passeggiate, stesse fermate, stesso ritmo',
  '3. ATTIVITÀ CICLICHE: INTRODUCI giochi ripetitivi come puzzle alimentari sempre alla stessa ora',
  '4. PREPARAZIONE CAMBIAMENTI: Se devi modificare routine, PREPARA il pet 3 giorni prima con segnali visivi',
  '5. RINFORZI TEMPORALI: USA timer sonori che annunciano sempre la stessa attività',
  '6. SEQUENZE FISSE: STABILISCI ordine invariabile: colazione→passeggiata→gioco→riposo',
  '7. CONTROLLO VARIABILI: MANTIENI costanti temperatura, luci, rumori durante le routine',
  '8. ADATTAMENTO GRADUALE: Se necessari cambiamenti, introducili al 5% ogni 3 giorni'
],
updated_at = NOW()
WHERE title = 'Routine Prevedibile' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Riduzione dello Stress'
);

-- Massaggio Terapeutico
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. PREPARAZIONE MANI: RISCALDA le mani per 2 minuti, usa olio di cocco o mandorle dolci',
  '2. APPROCCIO GRADUALE: INIZIA con tocchi leggerissimi sulla testa, aumenta pressione gradualmente',
  '3. MOVIMENTI CIRCOLARI: USA movimenti lenti e circolari, 1 cerchio ogni 3 secondi',
  '4. ZONE SPECIFICHE: CONCENTRATI su tempie, base orecchie, collo, spalle e schiena',
  '5. PRESSIONE CALIBRATA: APPLICA pressione come se stessi accarezzando un neonato',
  '6. RESPIRAZIONE SINCRONA: MANTIENI il tuo respiro lento e profondo durante il massaggio',
  '7. AMBIENTE CONTROLLATO: TEMPERATURA 22°C, luci soffuse, musica a 40 decibel massimo',
  '8. DURATA PROGRESSIVA: INIZIA con 10 minuti, aumenta 2 minuti ogni sessione fino a 25'
],
updated_at = NOW()
WHERE title = 'Massaggio Terapeutico' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Riduzione dello Stress'
);

-- Tecniche Rilassamento Muscolare
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. POSIZIONAMENTO OTTIMALE: DISTENDI il pet su superficie morbida ma ferma',
  '2. RILASSAMENTO PROGRESSIVO: INIZIA dalle zampe anteriori, rilassa ogni gruppo muscolare',
  '3. STRETCHING DELICATO: MUOVI articolazioni con movimenti LENTI e controllati',
  '4. CONTROLLO POSTURA: CORREGGI posizioni scorrette che causano tensione muscolare',
  '5. RESPIRAZIONE GUIDATA: SINCRONIZZA i movimenti con il ritmo respiratorio del pet',
  '6. PRESSIONE TERAPEUTICA: USA pressione delle dita sui punti di tensione per 30 secondi',
  '7. SEQUENZA SISTEMATICA: SEGUI sempre ordine testa→collo→schiena→zampe→coda',
  '8. VALUTAZIONE TENSIONE: TESTA ogni muscolo prima e dopo per verificare rilassamento'
],
updated_at = NOW()
WHERE title = 'Tecniche Rilassamento Muscolare' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Riduzione dello Stress'
);

-- Costruzione Resilienza
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. SFIDE GRADUATE: INIZIA con stress minimi come nuovo oggetto a distanza di 2 metri',
  '2. SISTEMA SUPPORTO: RIMANI SEMPRE vicino al pet durante l''esposizione controllata',
  '3. RINFORZI IMMEDIATI: PREMIA ogni piccolo progresso entro 3 secondi dall''evento',
  '4. TEMPO RECUPERO: CONCEDI 10 minuti di pausa tra ogni micro-sfida',
  '5. INTENSITÀ CRESCENTE: AUMENTA difficoltà solo del 10% ogni sessione riuscita',
  '6. SICUREZZA ASSOLUTA: FERMA immediatamente se vedi segni di stress eccessivo',
  '7. AMBIENTE CONTROLLATO: CONDUCI esercizi sempre nello stesso luogo sicuro',
  '8. DOCUMENTAZIONE PROGRESSI: REGISTRA ogni successo per motivazione futura'
],
updated_at = NOW()
WHERE title = 'Costruzione Resilienza' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Riduzione dello Stress'
);