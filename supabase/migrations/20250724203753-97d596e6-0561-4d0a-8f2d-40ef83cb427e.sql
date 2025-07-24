-- Continua con tutti gli altri esercizi rimanenti del protocollo "Controllo dell'Iperattività"

-- Aggiorno tutti i restanti in una sola query per velocità

-- Canalizzazione Energia Produttiva
UPDATE ai_training_exercises 
SET 
  instructions = ARRAY[
    '1. IDENTIFICAZIONE TALENTI: Osserva quali attività naturali il pet preferisce (scavare, riportare, esplorare).',
    '2. TRASFORMAZIONE POSITIVA: Trasforma i comportamenti "problematici" in attività utili e strutturate.',
    '3. OBIETTIVI SPECIFICI: Dai al pet compiti specifici da completare che richiedono energia ma sono produttivi.',
    '4. STRUMENTI APPROPRIATI: Fornisci gli strumenti giusti (puzzle complessi, percorsi agility, giochi di ricerca).',
    '5. ORARI STRUTTURATI: Programma sessioni di "lavoro" negli orari di picco energetico del pet.',
    '6. VARIETÀ STIMOLANTE: Cambia il tipo di "lavoro" ogni giorno per mantenere interesse e motivazione.',
    '7. RICONOSCIMENTO SUCCESSI: Celebra ogni completamento di compito come un vero successo lavorativo.'
  ],
  description = 'Trasformazione dell''energia eccessiva in attività produttive e mirate che soddisfano il bisogno di movimento.',
  updated_at = NOW()
WHERE title = 'Canalizzazione Energia Produttiva' 
  AND protocol_id IN (SELECT id FROM ai_training_protocols WHERE title = 'Controllo dell''Iperattività');

-- Rilassamento Forzato
UPDATE ai_training_exercises 
SET 
  instructions = ARRAY[
    '1. SPAZIO DEDICATO: Crea una zona specifica solo per il rilassamento con cuscini comodi e luce soffusa.',
    '2. COMANDO SPECIFICO: Insegna comando "RELAX" che significa andare in quella zona e rimanere calmo.',
    '3. DURATA CRESCENTE: Inizia con 5 minuti di permanenza obbligatoria, aumenta gradualmente.',
    '4. NESSUNA STIMOLAZIONE: Durante il periodo, zero interazioni, giochi, cibo o attenzioni.',
    '5. RINFORZO FINALE: Premio e liberazione solo quando è stato completamente calmo per tutto il tempo.',
    '6. ROUTINE QUOTIDIANA: Programma 2-3 sessioni di rilassamento forzato durante i picchi di energia.',
    '7. INCREMENTO PROGRESSIVO: Ogni settimana aumenta la durata di 2-3 minuti fino a raggiungere 20 minuti.'
  ],
  description = 'Tecnica per insegnare autocontrollo attraverso periodi obbligatori di calma e rilassamento.',
  updated_at = NOW()
WHERE title = 'Rilassamento Forzato' 
  AND protocol_id IN (SELECT id FROM ai_training_protocols WHERE title = 'Controllo dell''Iperattività');

-- Routine Energetica Strutturata
UPDATE ai_training_exercises 
SET 
  instructions = ARRAY[
    '1. ORARIO FISSO: Stabilisci orari precisi per sfogo energetico (es. 7:00, 14:00, 19:00).',
    '2. SEQUENZA STANDARD: Crea una sequenza fissa di attività che si ripete sempre uguale.',
    '3. INTENSITÀ GRADUALE: Inizia con intensità media, raggiungi il picco, poi scendi gradualmente.',
    '4. DURATA OTTIMALE: Ogni sessione deve durare 30-45 minuti per essere davvero efficace.',
    '5. VARIETÀ CONTROLLATA: Cambia gli esercizi ma mantieni sempre la stessa struttura temporale.',
    '6. MONITORAGGIO STANCHEZZA: Osserva i segnali di stanchezza per non superare mai i limiti.',
    '7. RECUPERO ATTIVO: Termina sempre con 10 minuti di attività calmante per il recupero.'
  ],
  description = 'Programma strutturato di attività fisica che prevede scarico energetico a orari fissi e con modalità controllate.',
  updated_at = NOW()
WHERE title = 'Routine Energetica Strutturata' 
  AND protocol_id IN (SELECT id FROM ai_training_protocols WHERE title = 'Controllo dell''Iperattività');

-- Sfide Mentali Complesse
UPDATE ai_training_exercises 
SET 
  instructions = ARRAY[
    '1. PUZZLE MULTI-LIVELLO: Usa puzzle che richiedono sequenze di azioni per essere risolti.',
    '2. PROBLEMA SOLVING: Presenta problemi che richiedono "pensare fuori dagli schemi".',
    '3. MEMORIA SEQUENZIALE: Insegna sequenze di comandi sempre più lunghe da ricordare ed eseguire.',
    '4. DISCRIMINAZIONE FINE: Allenalo a distinguere tra oggetti molto simili o suoni sottili.',
    '5. TEMPO LIMITATO: Introduce il fattore tempo per aumentare pressione mentale positiva.',
    '6. DIFFICOLTÀ CRESCENTE: Ogni successo porta automaticamente a livello superiore di difficoltà.',
    '7. FRUSTRAZIONE CONTROLLATA: Permetti piccole frustrazioni che insegnano persistenza.'
  ],
  description = 'Esercizi cognitivi avanzati che richiedono concentrazione intensa e problem-solving per stancare la mente.',
  updated_at = NOW()
WHERE title = 'Sfide Mentali Complesse' 
  AND protocol_id IN (SELECT id FROM ai_training_protocols WHERE title = 'Controllo dell''Iperattività');