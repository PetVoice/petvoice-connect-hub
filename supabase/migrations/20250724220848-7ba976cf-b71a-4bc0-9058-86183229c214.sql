-- Completa gli esercizi rimanenti del protocollo "Superare la Tristezza"

-- Attività Fisiche Energizzanti
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. INTENSITÀ CRESCENTE: AUMENTA gradualmente livello attività fisica per ricostruire energia',
  '2. GIOCHI DINAMICI: INTRODUCE attività che richiedono movimento più attivo e coinvolgente',
  '3. CORSA TERAPEUTICA: PRATICA corsa leggera se appropriato per liberare endorfine naturali',
  '4. ENERGIA PREMIATA: CELEBRA specificamente ogni manifestazione di vitalità e vigore',
  '5. VARIETÀ MOVIMENTO: ALTERNA diversi tipi di esercizio per mantenere interesse alto',
  '6. RITMO NATURALE: LASCIA pet trovare suo ritmo energetico ottimale senza forzature',
  '7. SFIDA PROGRESSIVA: AUMENTA difficoltà solo dopo consolidamento livello precedente',
  '8. GIOIA MOVIMENTO: ASSOCIA attività fisica a piacere e divertimento non dovere'
],
updated_at = NOW()
WHERE title = 'Attività Fisiche Energizzanti' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Superare la Tristezza'
);

-- Stimolazione Multi-sensoriale
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. SINFONIA SENSORIALE: COMBINA odori, suoni, texture e sapori in esperienza immersiva',
  '2. ESPERIENZA RICCA: CREA ambiente che stimola tutti i sensi contemporaneamente',
  '3. ESPLORAZIONE ATTIVA: INCORAGGIA pet a investigare attivamente stimoli sensoriali',
  '4. VARIAZIONE COSTANTE: CAMBIA combinazioni sensoriali per mantenere novità e interesse',
  '5. INTENSITÀ MODULATA: REGOLA stimoli per evitare sovraccarico ma mantenere coinvolgimento',
  '6. ASSOCIAZIONI POSITIVE: ABBINA esperienze sensoriali a momenti piacevoli e ricompense',
  '7. CURIOSITÀ PREMIATA: RICOMPENSA ogni manifestazione di interesse ed esplorazione',
  '8. MEMORIA FELICE: CREA associazioni sensoriali che pet potrà richiamare per benessere futuro'
],
updated_at = NOW()
WHERE title = 'Stimolazione Multi-sensoriale' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Superare la Tristezza'
);

-- Sfida Motivazionale Progressiva
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. OBIETTIVO ISPIRANTE: STABILISCI meta ambiziosa ma assolutamente raggiungibile per il pet',
  '2. MICRO-PASSI: SUDDIVIDI grande obiettivo in piccolissimi step facilmente conquistabili',
  '3. MILESTONE CELEBRATION: FESTEGGIA ogni traguardo intermedio come grande vittoria',
  '4. SENSO REALIZZAZIONE: COSTRUISCI feeling di competenza e capacità nel pet',
  '5. PROGRESSO VISIBILE: RENDI tangibili i miglioramenti ottenuti per motivare ulteriormente',
  '6. FIDUCIA CRESCENTE: USA successi per alimentare autostima e coraggio del pet',
  '7. SFIDA PERSONALE: ADATTA difficoltà alle capacità specifiche e uniche del pet',
  '8. MOMENTUM POSITIVO: MANTIENI slancio di successi per creare spirale ascendente'
],
updated_at = NOW()
WHERE title = 'Sfida Motivazionale Progressiva' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Superare la Tristezza'
);

-- Celebrazione dei Progressi
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. FESTA SPECIALE: ORGANIZZA evento dedicato esclusivamente a celebrare il pet',
  '2. OSPITI D ONORE: INVITA persone e animali che pet ama di più per condividere gioia',
  '3. ATTIVITÀ PREFERITE: CONCENTRA festa su tutto ciò che pet trova più piacevole',
  '4. DOCUMENTAZIONE GIOIA: FOTOGRAFA e registra momenti di felicità autentica del pet',
  '5. RICONOSCIMENTO PUBBLICO: CONDIVIDI con tutti quanto pet è speciale e importante',
  '6. REGALI SIMBOLICI: OFFRI doni che rappresentano amore e apprezzamento per il pet',
  '7. MEMORIA POSITIVA: CREA ricordo duraturo di questo momento di pura felicità',
  '8. ENERGIA COLLETTIVA: COINVOLGI tutti nel celebrare trasformazione del pet'
],
updated_at = NOW()
WHERE title = 'Celebrazione dei Progressi' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Superare la Tristezza'
);

-- Consolidamento Energie Positive
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. BEST PRACTICES: IDENTIFICA attività che hanno dato maggiore energia e motivazione al pet',
  '2. COMBINAZIONE VINCENTE: UNISCI elementi più efficaci in routine super-energizzante',
  '3. ROUTINE QUOTIDIANA: STABILISCI programma giornaliero che mantiene alti livelli di vitalità',
  '4. PIANIFICAZIONE MANTENIMENTO: CREA strategia per preservare energia conquistata nel tempo',
  '5. PERSONALIZZAZIONE COMPLETA: ADATTA routine alle preferenze specifiche scoperte del pet',
  '6. VARIAZIONE STRATEGICA: INTRODUCE cambi per evitare abitudine senza perdere efficacia',
  '7. MONITORAGGIO CONTINUO: OSSERVA costantemente livelli energetici per aggiustamenti',
  '8. RESILIENZA COSTRUITA: SVILUPPA capacità pet di auto-energizzarsi quando necessario'
],
updated_at = NOW()
WHERE title = 'Consolidamento Energie Positive' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Superare la Tristezza'
);

-- Proiezione Futura Positiva
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  '1. ATTIVITÀ ANTI-TRISTEZZA: STABILISCI routine settimanali specifiche per prevenire ricadute',
  '2. SISTEMA EARLY WARNING: IDENTIFICA segnali precoci di possibile calo umore',
  '3. INTERVENTI RAPIDI: PREPARA strategie immediate da applicare ai primi segnali negativi',
  '4. MOMENTUM PRESERVATO: MANTIENI slancio positivo attraverso attività energizzanti regolari',
  '5. SUPPORTO NETWORK: CREA rete di persone che sanno come aiutare pet a rimanere positivo',
  '6. RESILIENZA POTENZIATA: SVILUPPA capacità pet di superare autonomamente momenti difficili',
  '7. FUTURO BRILLANTE: PIANIFICA esperienze future che pet può anticipare con eccitazione',
  '8. TRASFORMAZIONE PERMANENTE: CONSOLIDA cambiamenti per rendere positività nuova normalità'
],
updated_at = NOW()
WHERE title = 'Proiezione Futura Positiva' AND protocol_id IN (
  SELECT id FROM ai_training_protocols WHERE title = 'Superare la Tristezza'
);