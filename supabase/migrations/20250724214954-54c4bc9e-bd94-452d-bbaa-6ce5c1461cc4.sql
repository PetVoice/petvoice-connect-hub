-- Aggiorna gli ultimi esercizi del protocollo "Riduzione dello Stress"

-- Integrazione Strategie Apprese
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. REVISIONE COMPLETA: RIVEDI tutte le tecniche apprese e identifica le più efficaci',
  '2. TOOLKIT PERSONALIZZATO: CREA un set di strumenti su misura per il tuo pet specifico',
  '3. STRATEGIE FAVORITE: CONCENTRATI sulle 3 tecniche che hanno dato migliori risultati',
  '4. PIANO GIORNALIERO: INTEGRA le strategie nella routine quotidiana normale',
  '5. COMBINAZIONI EFFICACI: TROVA le combinazioni di tecniche che funzionano meglio insieme',
  '6. ADATTAMENTO SITUAZIONALE: PERSONALIZZA approcci per diversi tipi di stress',
  '7. PRATICA CONSOLIDATA: RIPETI tecniche vincenti per renderle automatiche',
  '8. VALUTAZIONE CONTINUA: MONITORA efficacia e adatta strategie se necessario'
],
updated_at = NOW()
WHERE title = 'Integrazione Strategie Apprese' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Riduzione dello Stress'
);

-- Pianificazione Mantenimento
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. CALENDARIO SETTIMANALE: PROGRAMMA sessioni di mantenimento 3 volte a settimana',
  '2. ROUTINE PREVENTIVA: STABILISCI rituali quotidiani per prevenire accumulo di stress',
  '3. PIANO CRISI: PREPARA protocollo specifico per situazioni di stress elevato',
  '4. SCHEDULE CONTROLLI: FISSA controlli mensili per valutare progressi mantenuti',
  '5. RINFORZI PERIODICI: RIPETI esercizi di base ogni 15 giorni per non perdere competenze',
  '6. AGGIORNAMENTI STAGIONALI: ADATTA strategie ai cambiamenti stagionali e ambientali',
  '7. RETE SUPPORTO: MANTIENI contatti con veterinario comportamentalista se necessario',
  '8. DOCUMENTAZIONE CONTINUA: TIENI diario dei progressi per identificare pattern'
],
updated_at = NOW()
WHERE title = 'Pianificazione Mantenimento' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Riduzione dello Stress'
);

-- Celebrazione Trasformazione
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. DOCUMENTAZIONE RISULTATI: RACCOGLI foto, video e dati che mostrano i miglioramenti',
  '2. CONFRONTO PRIMA/DOPO: CREA un report visivo dei cambiamenti ottenuti',
  '3. CELEBRAZIONE SIGNIFICATIVA: ORGANIZZA una giornata speciale per festeggiare successi',
  '4. RICONOSCIMENTO PROGRESSI: RICONOSCI ogni piccolo miglioramento ottenuto nel percorso',
  '5. GRATITUDE PRACTICE: ESPRIMI gratitudine per il percorso condiviso con il pet',
  '6. CONDIVISIONE SUCCESSI: RACCONTA la tua esperienza per aiutare altri proprietari',
  '7. CONSOLIDAMENTO IDENTITÀ: RICONOSCI il nuovo livello di benessere raggiunto',
  '8. IMPEGNO FUTURO: PROMETTI di mantenere le conquiste ottenute attraverso il programma'
],
updated_at = NOW()
WHERE title = 'Celebrazione Trasformazione' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Riduzione dello Stress'
);