-- Crea protocollo "Rieducazione Alimentare Comportamentale"
-- Durata: 9 giorni, Livello: Intermedio, 27 esercizi totali

INSERT INTO public.ai_training_protocols (
  id,
  title,
  description,
  category,
  difficulty,
  duration_days,
  target_behavior,
  triggers,
  required_materials,
  status,
  is_public,
  ai_generated,
  veterinary_approved,
  success_rate,
  community_rating,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Rieducazione Alimentare Comportamentale',
  'Protocollo intermedio per risolvere disturbi comportamentali legati all''alimentazione. Affronta alimentazione compulsiva, rifiuto del cibo, food guarding e ansia alimentare attraverso un approccio graduale e non punitivo.',
  'alimentazione',
  'intermedio',
  9,
  'Sviluppare una relazione sana con il cibo, eliminare comportamenti compulsivi e ansia durante i pasti',
  ARRAY['alimentazione compulsiva', 'rifiuto cibo', 'food guarding', 'ansia durante pasti', 'voracità', 'competizione alimentare'],
  ARRAY['ciotole anti-ingozzamento', 'puzzle feeder', 'timer', 'snack per training', 'ciotole multiple', 'separatori'],
  'available',
  true,
  true,
  false,
  85.0,
  4.3,
  now(),
  now()
);

-- Ottieni l'ID del protocollo appena creato
WITH new_protocol AS (
  SELECT id FROM public.ai_training_protocols 
  WHERE title = 'Rieducazione Alimentare Comportamentale' 
  ORDER BY created_at DESC LIMIT 1
)

-- GIORNO 1: NORMALIZZAZIONE RELAZIONE CON CIBO
INSERT INTO public.ai_training_exercises (
  protocol_id, day_number, title, description, duration_minutes, 
  exercise_type, instructions, materials, created_at, updated_at
)
SELECT 
  new_protocol.id, 1, 'Introduzione Slow Feeding',
  'Iniziare gradualmente l''uso di ciotole anti-ingozzamento per rallentare la velocità di consumo e ridurre l''ansia da cibo.',
  20,
  'alimentazione',
  ARRAY[
    'Sostituire la ciotola normale con una ciotola anti-ingozzamento',
    'Osservare il comportamento iniziale senza intervenire',
    'Premiare la calma con voce tranquilla',
    'Consentire l''esplorazione della nuova ciotola'
  ],
  ARRAY['ciotola anti-ingozzamento', 'cibo abituale', 'timer'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 1, 'Training "Seduto-Aspetta" Pre-Pasto',
  'Stabilire controllo e calma prima di ogni pasto attraverso comandi base di attesa.',
  15,
  'comportamentale',
  ARRAY[
    'Tenere la ciotola preparata in mano',
    'Chiedere "seduto" prima di posare la ciotola',
    'Attendere 5 secondi di calma prima del "via"',
    'Aumentare gradualmente il tempo di attesa'
  ],
  ARRAY['ciotola con cibo', 'timer', 'snack premio'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 1, 'Desensibilizzazione Presenza Umana',
  'Abituare l''animale alla presenza umana durante i pasti senza causare stress o comportamenti protettivi.',
  25,
  'comportamentale',
  ARRAY[
    'Iniziare a distanza di 3 metri durante il pasto',
    'Rimanere immobili e silenziosi',
    'Avvicinarsi di 30cm solo se l''animale rimane calmo',
    'Ritirarsi immediatamente se mostra segni di stress'
  ],
  ARRAY['ciotola', 'cibo', 'metro per misurare distanza'],
  now(), now()
FROM new_protocol

-- GIORNO 2: CONTROLLO IMPULSI ALIMENTARI
UNION ALL
SELECT 
  new_protocol.id, 2, 'Puzzle Feeder Semplice',
  'Introdurre stimolazione mentale durante l''alimentazione per rallentare il consumo e aumentare la soddisfazione.',
  20,
  'mentale',
  ARRAY[
    'Riempire il puzzle feeder con metà della porzione abituale',
    'Dimostrare brevemente come funziona',
    'Lasciare esplorare senza assistenza',
    'Completare il pasto con ciotola normale se necessario'
  ],
  ARRAY['puzzle feeder', 'cibo secco', 'ciotola di riserva'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 2, 'Training Controllo Impulsi',
  'Sviluppare autocontrollo attraverso esercizi di attesa progressiva prima di accedere al cibo.',
  18,
  'comportamentale',
  ARRAY[
    'Posizionare la ciotola a terra ma coprirla con la mano',
    'Attendere contatto visivo prima di scoprire',
    'Aumentare gradualmente il tempo di attesa',
    'Ricompensare solo comportamenti calmi'
  ],
  ARRAY['ciotola', 'cibo', 'timer', 'snack extra'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 2, 'Routine Pre-Pasto Rilassante',
  'Creare associazioni positive e calme attraverso una routine costante prima di ogni pasto.',
  15,
  'rilassamento',
  ARRAY[
    'Eseguire sempre la stessa sequenza di preparazione',
    'Parlare con tono calmo e rassicurante',
    'Includere 2 minuti di carezze rilassanti',
    'Mantenere tempi e modalità sempre uguali'
  ],
  ARRAY['ciotola', 'cibo', 'timer', 'spazio tranquillo'],
  now(), now()
FROM new_protocol

-- GIORNO 3: RAFFORZAMENTO CONTROLLO
UNION ALL
SELECT 
  new_protocol.id, 3, 'Hand Feeding Controllato',
  'Rafforzare la fiducia e il controllo attraverso l''alimentazione diretta dalla mano in piccole porzioni.',
  22,
  'fiducia',
  ARRAY[
    'Offrire piccoli bocconi dalla mano aperta',
    'Attendere che l''animale prenda delicatamente',
    'Interrompere se mostra comportamenti aggressivi o frettolosi',
    'Alternare con alimentazione normale dalla ciotola'
  ],
  ARRAY['snack piccoli', 'cibo umido', 'salviette'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 3, 'Eliminazione Competizione Alimentare',
  'Se presente più di un animale, gestire l''alimentazione per eliminare stress competitivo.',
  20,
  'sociale',
  ARRAY[
    'Separare fisicamente gli animali durante i pasti',
    'Utilizzare ciotole identiche e porzioni uguali',
    'Alimentare simultaneamente ma a distanza sicura',
    'Supervisionare completamente ogni pasto'
  ],
  ARRAY['ciotole multiple', 'separatori', 'cibo misurato'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 3, 'Training "Lascia" con Cibo',
  'Insegnare il comando "lascia" per sviluppare controllo volontario sul cibo.',
  16,
  'comportamentale',
  ARRAY[
    'Tenere snack in mano chiusa davanti all''animale',
    'Dire "lascia" quando cerca di raggiungere il cibo',
    'Aprire la mano solo quando smette di insistere',
    'Premiare immediatamente il comportamento corretto'
  ],
  ARRAY['snack appetitosi', 'timer', 'snack premio diversi'],
  now(), now()
FROM new_protocol

-- GIORNO 4: CONTROLLO VELOCITÀ E PORZIONI
UNION ALL
SELECT 
  new_protocol.id, 4, 'Alimentazione Frazionata Temporizzata',
  'Dividere il pasto in piccole porzioni distribuite nel tempo per migliorare digestione e controllo.',
  25,
  'alimentazione',
  ARRAY[
    'Dividere la porzione giornaliera in 4-5 piccole parti',
    'Servire ogni porzione a intervalli di 5 minuti',
    'Utilizzare timer per mantenere consistenza',
    'Osservare miglioramenti nella calma'
  ],
  ARRAY['ciotole piccole', 'timer', 'cibo misurato'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 4, 'Puzzle Feeder Avanzato',
  'Progredire a puzzle più complessi per aumentare il tempo di alimentazione e la stimolazione mentale.',
  18,
  'mentale',
  ARRAY[
    'Utilizzare puzzle feeder con difficoltà maggiore',
    'Riempire con tutta la porzione del pasto',
    'Supervisionare ma non assistere',
    'Consentire fino a 15 minuti per completare'
  ],
  ARRAY['puzzle feeder complesso', 'cibo secco', 'timer'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 4, 'Training Porzioni Controllate',
  'Insegnare l''accettazione di porzioni misurate senza comportamenti di richiesta eccessiva.',
  12,
  'disciplina',
  ARRAY[
    'Presentare porzione misurata esatta',
    'Ignorare comportamenti di richiesta aggiuntiva',
    'Non cedere a pianti o insistenze',
    'Rimuovere la ciotola quando il pasto è finito'
  ],
  ARRAY['bilancia', 'ciotola', 'cibo misurato'],
  now(), now()
FROM new_protocol

-- GIORNO 5: RAFFORZAMENTO CONTROLLO IMPULSI
UNION ALL
SELECT 
  new_protocol.id, 5, 'Multi-Bowl Challenge',
  'Testare l''autocontrollo con multiple ciotole di cibo disponibili simultaneamente.',
  20,
  'disciplina',
  ARRAY[
    'Posizionare 3 ciotole con piccole quantità',
    'Permettere accesso solo a una ciotola per volta',
    'Utilizzare comando "aspetta" tra le ciotole',
    'Premiare il controllo e la pazienza'
  ],
  ARRAY['3 ciotole piccole', 'cibo vario', 'timer'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 5, 'Training Resistenza alla Tentazione',
  'Sviluppare forte autocontrollo in presenza di cibo molto appetitoso.',
  15,
  'comportamentale',
  ARRAY[
    'Posizionare cibo appetitoso a vista ma fuori portata',
    'Richiedere 30 secondi di calma prima dell''accesso',
    'Aumentare gradualmente il tempo di attesa',
    'Usare snack ad alto valore come ricompensa'
  ],
  ARRAY['snack appetitosi', 'timer', 'superficie elevata'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 5, 'Slow Motion Feeding',
  'Praticare alimentazione estremamente lenta per rafforzare calma e controllo.',
  22,
  'rilassamento',
  ARRAY[
    'Offrire un boccone alla volta dalla ciotola',
    'Attendere deglutizione completa prima del successivo',
    'Mantenere ritmo molto lento e costante',
    'Interrompere se mostra fretta o ansia'
  ],
  ARRAY['ciotola', 'cibo umido', 'cucchiaio', 'timer'],
  now(), now()
FROM new_protocol

-- GIORNO 6: ELIMINAZIONE FOOD GUARDING
UNION ALL
SELECT 
  new_protocol.id, 6, 'Desensibilizzazione Avvicinamento Graduale',
  'Eliminare comportamenti protettivi del cibo attraverso avvicinamento graduale e positivo.',
  25,
  'comportamentale',
  ARRAY[
    'Iniziare a 2 metri di distanza durante il pasto',
    'Avvicinarsi di 20cm ogni 2 giorni solo se rilassato',
    'Lanciare occasionalmente snack extra dalla distanza',
    'Ritirarsi immediatamente se mostra tensione'
  ],
  ARRAY['snack extra', 'metro', 'ciotola', 'cibo'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 6, 'Training "Aggiungi" Positivo',
  'Creare associazioni positive con l''avvicinamento umano durante i pasti.',
  18,
  'fiducia',
  ARRAY[
    'Avvicinarsi lentamente durante il pasto',
    'Aggiungere qualcosa di delizioso nella ciotola',
    'Ritirarsi immediatamente dopo l''aggiunta',
    'Ripetere 2-3 volte per pasto'
  ],
  ARRAY['snack premium', 'ciotola', 'cibo base'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 6, 'Eliminazione Ansia Alimentare',
  'Ridurre stress e ansia generalizzata legata ai momenti di alimentazione.',
  20,
  'rilassamento',
  ARRAY[
    'Creare ambiente molto tranquillo e silenzioso',
    'Utilizzare feromoni calmanti nello spazio pasto',
    'Mantenere routine rigidamente costante',
    'Evitare qualsiasi pressione o fretta'
  ],
  ARRAY['feromoni calmanti', 'spazio isolato', 'ciotola', 'cibo'],
  now(), now()
FROM new_protocol

-- GIORNO 7: CONSOLIDAMENTO ANTI-ANSIA
UNION ALL
SELECT 
  new_protocol.id, 7, 'Touch Training durante Pasti',
  'Abituare l''animale al contatto fisico gentile durante l''alimentazione.',
  22,
  'fiducia',
  ARRAY[
    'Iniziare con tocchi molto brevi sulla schiena',
    'Aumentare gradualmente durata del contatto',
    'Interrompere immediatamente se si irrigidisce',
    'Associare sempre il tocco a qualcosa di positivo'
  ],
  ARRAY['snack extra', 'ciotola', 'cibo'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 7, 'Training Condivisione Spazio',
  'Abituare l''animale alla presenza di persone nello stesso spazio durante i pasti.',
  15,
  'sociale',
  ARRAY[
    'Sedersi tranquillamente a 1 metro durante il pasto',
    'Leggere o utilizzare telefono per sembrare non minacciosi',
    'Ignorare completamente l''animale che mangia',
    'Alzarsi solo quando ha completamente finito'
  ],
  ARRAY['sedia', 'libro o telefono', 'ciotola', 'cibo'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 7, 'Test Gestione Ciotola',
  'Testare la possibilità di gestire la ciotola durante il pasto senza reazioni negative.',
  18,
  'test',
  ARRAY[
    'Toccare brevemente il bordo della ciotola durante il pasto',
    'Sollevare leggermente la ciotola per 1 secondo',
    'Aggiungere cibo prima di riposare la ciotola',
    'Interrompere se mostra qualsiasi segno di stress'
  ],
  ARRAY['ciotola', 'cibo extra', 'snack premio'],
  now(), now()
FROM new_protocol

-- GIORNO 8: AUTOREGOLAZIONE AVANZATA
UNION ALL
SELECT 
  new_protocol.id, 8, 'Free Choice Feeding Controllato',
  'Testare l''autoregolazione con cibo disponibile per periodi prolungati.',
  30,
  'autocontrollo',
  ARRAY[
    'Lasciare cibo secco disponibile per 2 ore',
    'Osservare pattern di consumo senza interferire',
    'Rimuovere cibo non consumato dopo il tempo limite',
    'Monitorare per sovralimentazione o sotto-alimentazione'
  ],
  ARRAY['cibo secco misurato', 'ciotola', 'timer'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 8, 'Training Sazietà Consapevole',
  'Insegnare a riconoscere e rispettare i segnali naturali di sazietà.',
  20,
  'consapevolezza',
  ARRAY[
    'Offrire porzioni leggermente superiori al normale',
    'Osservare quando l''animale rallenta o si ferma',
    'Rimuovere immediatamente cibo quando smette di mangiare',
    'Non forzare mai il completamento della porzione'
  ],
  ARRAY['ciotola', 'cibo misurato extra', 'timer'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 8, 'Integration Test Sociale',
  'Se appropriato, testare l''alimentazione in presenza di altri animali con supervisione.',
  25,
  'sociale',
  ARRAY[
    'Supervisionare attentamente alimentazione multipla',
    'Mantenere distanza di sicurezza tra ciotole',
    'Intervenire immediatamente in caso di tensione',
    'Separare se necessario senza punizioni'
  ],
  ARRAY['ciotole multiple', 'cibo misurato', 'separatori'],
  now(), now()
FROM new_protocol

-- GIORNO 9: ROUTINE SANE AUTONOME
UNION ALL
SELECT 
  new_protocol.id, 9, 'Routine Alimentare Indipendente',
  'Consolidare una routine alimentare sana che possa mantenersi autonomamente.',
  20,
  'autonomia',
  ARRAY[
    'Permettere gestione completa del pasto senza supervisione',
    'Osservare a distanza per verificare comportamenti appresi',
    'Intervenire solo se assolutamente necessario',
    'Documentare progressi e comportamenti consolidati'
  ],
  ARRAY['ciotola', 'cibo porzione normale', 'timer'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 9, 'Test Resilienza Ambientale',
  'Testare la stabilità dei comportamenti appresi in condizioni leggermente diverse.',
  18,
  'test',
  ARRAY[
    'Cambiare location del pasto in spazio diverso',
    'Utilizzare ciotola leggermente diversa',
    'Mantenere tutti gli altri fattori costanti',
    'Osservare adattabilità e mantenimento controllo'
  ],
  ARRAY['ciotola alternativa', 'spazio diverso', 'cibo abituale'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 9, 'Consolidamento Finale e Valutazione',
  'Valutare il successo complessivo del protocollo e pianificare mantenimento.',
  15,
  'valutazione',
  ARRAY[
    'Eseguire pasto normale con tutte le competenze integrate',
    'Documentare miglioramenti rispetto al comportamento iniziale',
    'Identificare aree che potrebbero necessitare rinforzo futuro',
    'Celebrare successi raggiunti con ricompense speciali'
  ],
  ARRAY['ciotola', 'cibo', 'snack celebrativo speciale'],
  now(), now()
FROM new_protocol;