-- Aggiorna tutti gli esercizi del protocollo "Riduzione dello Stress" con istruzioni dettagliate punto per punto in MAIUSCOLO

-- Valutazione Stress Baseline
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. PREPARAZIONE AMBIENTE: Trova uno spazio TRANQUILLO e SILENZIOSO dove non sarai interrotto',
  '2. POSIZIONAMENTO: Siediti COMODAMENTE accanto al pet, mantenendo una distanza di circa 1 metro',  
  '3. OSSERVAZIONE FISICA: REGISTRA tutti i segnali di stress visibili: respiro accelerato, tremori, postura tesa',
  '4. DOCUMENTAZIONE COMPORTAMENTALE: ANNOTA tutti i comportamenti anomali: irrequietezza, vocalizzazioni eccessive, nascondersi',
  '5. SCALA INTENSITÀ: VALUTA il livello di stress da 1 a 10 basandoti sui segnali osservati',
  '6. IDENTIFICAZIONE TRIGGER: ELENCA tutti i fattori scatenanti che hai notato nell''ambiente o nelle routine',
  '7. TEMPO OSSERVAZIONE: MANTIENI l''osservazione per almeno 30 minuti per ottenere dati completi',
  '8. FOTOGRAFIA BASELINE: SCATTA foto dello stato attuale per confronti futuri'
],
updated_at = NOW()
WHERE title = 'Valutazione Stress Baseline' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Riduzione dello Stress'
);

-- Tecniche di Respirazione Condivisa  
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. PREPARAZIONE POSTURA: Siediti COMODAMENTE con la schiena DRITTA accanto al pet',
  '2. CONTATTO FISICO: Appoggia DELICATAMENTE la mano sul fianco del pet per sentire il suo respiro',
  '3. SINCRONIZZAZIONE INIZIALE: RESPIRA profondamente e LENTAMENTE, facendo sentire il tuo respiro al pet',
  '4. RITMO GUIDATO: INSPIRA per 4 secondi, TRATTIENI per 2 secondi, ESPIRA per 6 secondi',
  '5. VOCE CALMANTE: Parla con voce MORBIDA e RASSICURANTE durante gli esercizi',
  '6. MANTENIMENTO FOCUS: CONCENTRATI completamente sul ritmo respiratorio condiviso',
  '7. DURATA SESSIONE: CONTINUA per esattamente 15 minuti senza interruzioni',
  '8. CONCLUSIONE GRADUALE: RALLENTA gradualmente il ritmo fino a tornare normale'
],
updated_at = NOW()
WHERE title = 'Tecniche di Respirazione Condivisa' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Riduzione dello Stress'
);

-- Routine di Calma
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. ORARI FISSI PASTI: STABILISCI orari IDENTICI ogni giorno: colazione ore 8:00, cena ore 18:00',
  '2. MOMENTI COCCOLE: DEDICA 10 minuti alle 16:00 ogni giorno per coccole tranquille',
  '3. RITUALI PRE-SONNO: INTRODUCI sequenza FISSA: spegnere luci, musica soft, preparare cuccia',
  '4. COSTANZA ASSOLUTA: NON cambiare MAI gli orari senza gradualità di almeno 3 giorni',
  '5. AMBIENTE PREVEDIBILE: MANTIENI sempre gli stessi oggetti nelle stesse posizioni',
  '6. DOCUMENTAZIONE PROGRESSI: REGISTRA ogni giorno i miglioramenti nella routine',
  '7. RINFORZI POSITIVI: PREMIA il pet quando anticipa correttamente le routine',
  '8. GESTIONE IMPREVISTI: Se devi cambiare, AVVISA il pet con segnali 30 minuti prima'
],
updated_at = NOW()
WHERE title = 'Routine di Calma' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Riduzione dello Stress'
);

-- Ambiente di Rilassamento
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. SELEZIONE STANZA: SCEGLI la stanza più SILENZIOSA della casa, lontana da traffico e rumori',
  '2. CONTROLLO ILLUMINAZIONE: RIDUCI luci intense, usa solo illuminazione SOFFUSA e CALDA',
  '3. MUSICA TERAPEUTICA: AGGIUNGI playlist di musica rilassante a volume BASSO (max 40 decibel)',
  '4. DIFFUSORI FEROMONI: POSIZIONA diffusori calmanti specifici per la specie del pet',
  '5. COMFORT FISICO: CREA angoli morbidi con cuscini PULITI e coperte PROFUMATE di casa',
  '6. TEMPERATURA OTTIMALE: MANTIENI temperatura costante tra 20-22°C senza sbalzi',
  '7. ELIMINAZIONE DISTURBI: RIMUOVI tutti i rumori improvvisi: telefoni, TV, elettrodomestici',
  '8. ZONA RIFUGIO: CREA uno spazio dove il pet può NASCONDERSI quando si sente sopraffatto'
],
updated_at = NOW()
WHERE title = 'Ambiente di Rilassamento' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Riduzione dello Stress'
);

-- Eliminazione Stressor Primari
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. ANALISI COMPLETA: IDENTIFICA tutti i fattori di stress: rumori, odori, persone, situazioni',
  '2. CLASSIFICAZIONE PRIORITÀ: DIVIDI gli stressor in MODIFICABILI e NON-MODIFICABILI', 
  '3. RIMOZIONE IMMEDIATA: ELIMINA subito tutti gli stressor facilmente rimovibili',
  '4. RIDUZIONE GRADUALE: Per stressor non eliminabili, RIDUCI intensità del 50% ogni settimana',
  '5. ALTERNATIVE POSITIVE: SOSTITUISCI ogni stressor rimosso con qualcosa di PIACEVOLE',
  '6. MONITORAGGIO REAZIONI: OSSERVA attentamente le reazioni del pet a ogni modifica',
  '7. DOCUMENTAZIONE CAMBIAMENTI: REGISTRA ogni modifica e i risultati ottenuti',
  '8. VALIDAZIONE EFFICACIA: MISURA i livelli di stress prima e dopo ogni intervento'
],
updated_at = NOW()
WHERE title = 'Eliminazione Stressor Primari' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Riduzione dello Stress'
);