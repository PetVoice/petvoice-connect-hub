-- Completa gli ultimi esercizi del protocollo "Recupero dall'Apatia"

-- Futuro Energetico
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. OBIETTIVI ENERGETICI: STABILISCI traguardi specifici per mantenere vitalità a lungo termine',
  '2. SFIDE PROGRESSIVE: PIANIFICA nuove sfide di difficoltà crescente per i prossimi mesi',
  '3. RETE SUPPORTO SOCIALE: CREA gruppo di amici pet e persone che sostengono il benessere',
  '4. CRESCITA CONTINUA: PROGRAMMA attività che stimolano sviluppo e apprendimento costante',
  '5. MONITORAGGIO ENERGIA: STABILISCI sistema per tracciare livelli energetici nel tempo',
  '6. PREVENZIONE RICADUTE: IDENTIFICA segnali precoci di possibile ritorno apatia',
  '7. RISORSE DISPONIBILI: CREA lista di attività energizzanti da usare quando necessario',
  '8. VISIONE POSITIVA: MANTIENI focus su futuro brillante e pieno di possibilità'
],
updated_at = NOW()
WHERE title = 'Futuro Energetico' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Recupero dall''Apatia'
);

-- Mantentimento Energia (corretta la dicitura)
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. ATTIVITÀ TOP: IDENTIFICA le 5 attività che hanno dato maggiore motivazione al pet',
  '2. PIANO SETTIMANALE: CREA calendario varietà con rotazione di attività motivanti',
  '3. SEGNALI CALO: STABILISCI indicatori precoci di diminuzione energia o motivazione',
  '4. INTERVENTI PREVENTIVI: PREPARA azioni immediate da fare quando energia scende',
  '5. SUPPORTO NETWORK: MANTIENI contatti con persone/pet che energizzano il tuo pet',
  '6. ROUTINE FLESSIBILE: CREA struttura stabile ma adattabile alle esigenze giornaliere',
  '7. RINFORZI NATURALI: INTEGRA elementi motivanti nella vita quotidiana normale',
  '8. CHECK REGOLARI: SCHEDULA valutazioni mensili dei livelli energetici e benessere'
],
updated_at = NOW()
WHERE title = 'Mantentimento Energia' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Recupero dall''Apatia'
);

-- Valutazione Progressi
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. CONFRONTO BASELINE: DOCUMENTA differenze EVIDENTI tra energia del giorno 1 e oggi',
  '2. COMPORTAMENTI ATTIVI: ELENCA tutti i nuovi comportamenti energici sviluppati',
  '3. TRIGGER MOTIVAZIONE: IDENTIFICA stimoli specifici che ora scatenano interesse/energia',
  '4. TRASFORMAZIONE CELEBRATA: RICONOSCI e festeggia la metamorfosi completa avvenuta',
  '5. FOTOGRAFIE PRIMA/DOPO: CONFRONTA immagini visive per vedere cambiamenti fisici',
  '6. ENERGIA SOSTENUTA: MISURA capacità di mantenere energia per periodi prolungati',
  '7. INIZIATIVA AUTONOMA: DOCUMENTA momenti dove il pet propone attività spontaneamente',
  '8. IMPATTO RELAZIONE: VALUTA come il cambiamento ha migliorato legame con famiglia'
],
updated_at = NOW()
WHERE title = 'Valutazione Progressi' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Recupero dall''Apatia'
);