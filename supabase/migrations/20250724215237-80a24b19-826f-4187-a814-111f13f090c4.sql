-- Aggiorna TUTTI gli esercizi del protocollo "Recupero dall'Apatia" con istruzioni dettagliate - PARTE 1

-- Movimento Dolce 
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. APPROCCIO GENTILE: AVVICINATI al pet con movimenti LENTI e voce dolce per non spaventarlo',
  '2. INCORAGGIAMENTO POSITIVO: USA premi alimentari IRRESISTIBILI posizionati a 1 metro di distanza',
  '3. RINFORZO IMMEDIATO: PREMIA ogni piccolo movimento, anche solo alzare la testa o girare le orecchie',
  '4. PROGRESSIONE GRADUALE: INIZIA con movimenti di 30 secondi, aumenta solo se risponde positivamente',
  '5. RISPETTO RITMI: NON forzare MAI, se si ferma ASPETTA che sia pronto per continuare',
  '6. AMBIENTE SICURO: SCEGLI spazio FAMILIARE dove il pet si sente al sicuro e protetto',
  '7. SESSIONI BREVI: MAX 10 minuti per evitare sovraccarico emotivo o fisico',
  '8. OSSERVAZIONE CONTINUA: MONITORA segnali di stress o affaticamento e ferma immediatamente'
],
updated_at = NOW()
WHERE title = 'Movimento Dolce' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Recupero dall''Apatia'
);

-- Risveglio dell'Interesse
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. PRESENTAZIONE GRADUALE: MOSTRA nuovi giocattoli UNO alla volta, lasciando tempo per elaborare',
  '2. STIMOLAZIONE VISIVA: MUOVI giocattoli LENTAMENTE nel campo visivo senza forzare interazione',
  '3. ROTAZIONE CIOTOLE: CAMBIA posizione delle ciotole del 50cm ogni giorno per creare curiosità',
  '4. AROMI ACCATTIVANTI: INTRODUCI odori di cibo appetitoso come pollo arrosto o formaggio',
  '5. PREMI OGNI SEGNALE: RINFORZA anche solo guardare verso il nuovo stimolo con treat speciali',
  '6. VARIETÀ CONTROLLATA: NON sovraccaricare con troppi stimoli contemporaneamente',
  '7. ASSOCIAZIONI POSITIVE: COLLEGA sempre nuovi oggetti a esperienze piacevoli',
  '8. TEMPO LIBERO: LASCIA oggetti disponibili senza pressioni per esplorazione autonoma'
],
updated_at = NOW()
WHERE title = 'Risveglio dell''Interesse' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Recupero dall''Apatia'
);

-- Presenza Energizzante
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. POSIZIONAMENTO STRATEGICO: SIEDITI a 1,5 metri dal pet, abbastanza vicino ma non invadente',
  '2. ENERGIA CALIBRATA: MANTIENI energia POSITIVA ma CALMA, evita iperattivazione',
  '3. TONO VOCALE: PARLA con voce INCORAGGIANTE e MELODIOSA, evita toni acuti o agitati',
  '4. LINGUAGGIO CORPOREO: POSTURA aperta, spalle rilassate, movimenti FLUIDI e non bruschi',
  '5. SORRISO GENUINO: MANTIENI espressione facciale SERENA e ACCOGLIENTE',
  '6. ATTIVITÀ CONDIVISE: CONDIVIDI attività semplici come guardare insieme fuori dalla finestra',
  '7. RESPIRAZIONE CONSAPEVOLE: RESPIRA profondamente per trasmettere calma e sicurezza',
  '8. DURATA PROGRESSIVA: INIZIA con 10 minuti, aumenta 2 minuti ogni sessione riuscita'
],
updated_at = NOW()
WHERE title = 'Presenza Energizzante' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Recupero dall''Apatia'
);

-- Stimolazione Sensoriale
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. TEXTURE GRADUATE: INTRODUCI materiali diversi: morbido peluche, ruvido tappeto, liscio metallo',
  '2. ODORI NATURALI: PORTA essenze come lavanda fresca, menta, o erba del giardino',
  '3. SUONI DOLCI: RIPRODUCI suoni della natura: cinguettii, acqua che scorre, vento tra le foglie',
  '4. SAPORI NUOVI: OFFRI piccole quantità di cibi appetitosi ma non abituali',
  '5. ESPLORAZIONE LIBERA: LASCIA che il pet scelga quale senso esplorare senza dirigere',
  '6. RINFORZO SENSORIALE: PREMIA ogni reazione positiva ai nuovi stimoli sensoriali',
  '7. ROTAZIONE STIMOLI: CAMBIA tipo di stimolazione ogni 3-4 minuti per mantenere interesse',
  '8. SICUREZZA ASSOLUTA: USA solo materiali SICURI e NON tossici per la specie'
],
updated_at = NOW()
WHERE title = 'Stimolazione Sensoriale' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Recupero dall''Apatia'
);

-- Gioco Motivazionale
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. RICERCA STORICA: IDENTIFICA il giocattolo o attività che in passato lo rendeva più felice',
  '2. REINTRODUZIONE GRADUALE: PRESENTA il gioco preferito LENTAMENTE, senza forzare partecipazione',
  '3. MOVIMENTI INIZIALI: INIZIA con movimenti molto LENTI del giocattolo per catturare attenzione',
  '4. PREMI OSSERVAZIONE: RINFORZA anche solo GUARDARE il giocattolo con treat di alto valore',
  '5. ESCALATION CONTROLLATA: AUMENTA intensità gioco solo se mostra interesse spontaneo',
  '6. SESSIONI BREVI: MAX 5 minuti iniziali per evitare affaticamento o frustrazione',
  '7. SUCCESSO GARANTITO: TERMINA sempre con una "vittoria" del pet per costruire fiducia',
  '8. ASSOCIAZIONE POSITIVA: COMBINA gioco con cose che ama: cibo, coccole, lodi'
],
updated_at = NOW()
WHERE title = 'Gioco Motivazionale' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Recupero dall''Apatia'
);