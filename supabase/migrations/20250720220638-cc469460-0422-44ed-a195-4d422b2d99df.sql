-- Crea protocollo "Gestione Ansia da Separazione"
-- Durata: 7 giorni, Livello: medio, 21 esercizi totali

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
  'Gestione Ansia da Separazione',
  'Protocollo scientifico per ridurre l''ansia da separazione attraverso desensibilizzazione graduale. Sviluppa indipendenza e tranquillità durante le assenze del proprietario con approccio ultra-graduale.',
  'comportamento',
  'medio',
  7,
  'Ridurre ansia da separazione, sviluppare indipendenza serena, eliminare comportamenti distruttivi durante assenze',
  ARRAY['ansia quando solo', 'comportamenti distruttivi', 'vocalizzazioni eccessive', 'seguire ovunque', 'panico da partenza'],
  ARRAY['comfort objects', 'puzzle toys', 'registrazioni voce', 'camera sicura', 'timer', 'chiavi/cappotto per desensibilizzazione'],
  'available',
  true,
  true,
  false,
  88.0,
  4.5,
  now(),
  now()
);

-- Ottieni l'ID del protocollo appena creato
WITH new_protocol AS (
  SELECT id FROM public.ai_training_protocols 
  WHERE title = 'Gestione Ansia da Separazione' 
  ORDER BY created_at DESC LIMIT 1
)

-- GIORNO 1: MICRO-SEPARAZIONI E COMFORT OBJECTS
INSERT INTO public.ai_training_exercises (
  protocol_id, day_number, title, description, duration_minutes, 
  exercise_type, instructions, materials, created_at, updated_at
)
SELECT 
  new_protocol.id, 1, 'Micro-Uscite di 30 Secondi',
  'Iniziare con brevissime separazioni per costruire fiducia che il proprietario tornerà sempre.',
  5,
  'behavioral',
  ARRAY[
    'Uscire dalla porta per esattamente 30 secondi',
    'Rientrare con calma assoluta, senza saluti eccessivi',
    'Ignorare l''animale per 2 minuti dopo il rientro',
    'Ripetere 3-4 volte con pause di 10 minuti tra le uscite'
  ],
  ARRAY['timer', 'porta di casa', 'spazio sicuro interno'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 1, 'Introduzione Comfort Object',
  'Creare associazione positiva tra oggetto comfort e sicurezza emotiva.',
  10,
  'behavioral',
  ARRAY[
    'Scegliere un oggetto morbido che abbia il vostro odore',
    'Presentare l''oggetto durante momenti di calma e rilassamento',
    'Permettere esplorazione libera senza forzare contatto',
    'Lasciare l''oggetto sempre accessibile nello spazio sicuro'
  ],
  ARRAY['peluche o coperta con odore proprietario', 'spazio tranquillo'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 1, 'Creazione Safe Space',
  'Designare e preparare uno spazio sicuro dove l''animale possa sentirsi protetto durante le separazioni.',
  15,
  'behavioral',
  ARRAY[
    'Scegliere angolo tranquillo della casa lontano da rumori',
    'Posizionare cuccia comoda, acqua, comfort object',
    'Evitare che lo spazio sia troppo isolato o claustrofobico',
    'Rendere lo spazio accessibile ma non obbligatorio'
  ],
  ARRAY['cuccia comoda', 'coperte', 'ciotola acqua', 'comfort object'],
  now(), now()
FROM new_protocol

-- GIORNO 2: RAFFORZAMENTO MICRO-SEPARAZIONI
UNION ALL
SELECT 
  new_protocol.id, 2, 'Estensione a 2 Minuti',
  'Aumentare gradualmente la durata delle separazioni mantenendo la prevedibilità del ritorno.',
  8,
  'behavioral',
  ARRAY[
    'Uscire per esattamente 2 minuti cronometrati',
    'Mantenere routine di uscita neutra e silenziosa',
    'Rientrare senza drammatizzazioni o saluti eccessivi',
    'Osservare segnali di stress e interrompere se necessario'
  ],
  ARRAY['timer', 'porta', 'spazio con comfort object'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 2, 'Training con Puzzle Toy',
  'Associare l''assenza del proprietario con attività gratificanti e stimolanti.',
  12,
  'mental',
  ARRAY[
    'Presentare puzzle toy riempito solo durante le micro-uscite',
    'Rimuovere il gioco immediatamente al rientro',
    'Utilizzare snack ad alto valore per motivazione massima',
    'Aumentare gradualmente difficoltà del puzzle'
  ],
  ARRAY['puzzle toy', 'snack appetitosi', 'timer'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 2, 'Routine Neutra di Partenza',
  'Desensibilizzare l''animale ai segnali che precedono le partenze per ridurre anticipazione ansiosa.',
  10,
  'behavioral',
  ARRAY[
    'Raccogliere chiavi e cappotto senza uscire realmente',
    'Ripetere gesti di partenza in momenti casuali della giornata',
    'Non reagire a comportamenti di ansia durante simulazioni',
    'Rendere questi gesti così comuni da perdere significato'
  ],
  ARRAY['chiavi', 'cappotto o giacca', 'borsa'],
  now(), now()
FROM new_protocol

-- GIORNO 3: DESENSIBILIZZAZIONE ROUTINE PARTENZA
UNION ALL
SELECT 
  new_protocol.id, 3, 'Desensibilizzazione Avanzata Cue',
  'Neutralizzare completamente i segnali che scatenano ansia da partenza.',
  15,
  'behavioral',
  ARRAY[
    'Eseguire routine completa di partenza senza uscire',
    'Includere: chiavi, cappotto, scarpe, borsa, controllo porta',
    'Sedersi tranquillamente per 5 minuti dopo la routine',
    'Ripetere fino a quando l''animale ignora completamente i segnali'
  ],
  ARRAY['chiavi', 'cappotto', 'scarpe', 'borsa', 'timer'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 3, 'Separazione con Barriera Visiva',
  'Abituare alla separazione fisica mantenendo percezione di presenza.',
  8,
  'behavioral',
  ARRAY[
    'Posizionarsi dietro porta interna chiusa per 3-5 minuti',
    'Rimanere silenziosi ma occasionalmente fare piccoli rumori',
    'Non rispondere a vocalizzazioni o graffi alla porta',
    'Aprire porta solo quando l''animale è calmo'
  ],
  ARRAY['porta interna', 'timer', 'comfort object per animale'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 3, 'Introduzione Registrazione Voce',
  'Fornire comfort uditivo attraverso registrazione della voce familiare.',
  12,
  'behavioral',
  ARRAY[
    'Registrare 10 minuti di voce che parla tranquillamente',
    'Riprodurre registrazione durante micro-separazioni',
    'Mantenere volume basso e naturale',
    'Utilizzare solo se riduce visibilmente l''ansia'
  ],
  ARRAY['dispositivo audio', 'registrazione voce', 'timer'],
  now(), now()
FROM new_protocol

-- GIORNO 4: CONSOLIDAMENTO ROUTINE
UNION ALL
SELECT 
  new_protocol.id, 4, 'Separazioni di 5 Minuti',
  'Aumentare significativamente la durata mantenendo successo e tranquillità.',
  15,
  'behavioral',
  ARRAY[
    'Uscire realmente di casa per 5 minuti esatti',
    'Combinare con puzzle toy e comfort object',
    'Osservare attraverso finestra se possibile per monitorare',
    'Rientrare solo se l''animale è tranquillo'
  ],
  ARRAY['timer', 'puzzle toy', 'comfort object', 'chiavi'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 4, 'Training Indipendenza in Casa',
  'Promuovere indipendenza fisica anche in presenza del proprietario.',
  20,
  'behavioral',
  ARRAY[
    'Incoraggiare l''animale a stare in stanza diversa per brevi periodi',
    'Premiare comportamenti indipendenti e auto-intrattenimento',
    'Non chiamare o attirare attenzione quando è lontano',
    'Creare valore nel tempo trascorso da solo'
  ],
  ARRAY['premi', 'giochi indipendenti', 'spazi separati'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 4, 'Neutralizzazione Rientro',
  'Insegnare che i rientri sono eventi normali e non drammatici.',
  10,
  'behavioral',
  ARRAY[
    'Rientrare in casa con calma assoluta',
    'Ignorare l''animale per i primi 3-5 minuti',
    'Non rispondere a salti, vocalizzazioni o ricerca attenzione',
    'Iniziare interazione solo quando è completamente calmo'
  ],
  ARRAY['timer', 'autocontrollo proprietario'],
  now(), now()
FROM new_protocol

-- GIORNO 5: ESTENSIONE GRADUALE TEMPI
UNION ALL
SELECT 
  new_protocol.id, 5, 'Separazioni di 10 Minuti',
  'Raddoppiare il tempo di separazione mantenendo sicurezza emotiva.',
  20,
  'behavioral',
  ARRAY[
    'Uscire per 10 minuti utilizzando tutti gli strumenti appresi',
    'Preparare puzzle toy più complesso per durata maggiore',
    'Monitorare segni di stress al rientro',
    'Ridurre tempo se necessario senza considerarlo fallimento'
  ],
  ARRAY['timer', 'puzzle toy complesso', 'comfort object', 'registrazione voce'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 5, 'Training Autoregolazione',
  'Insegnare tecniche di autoconsolazione e gestione dello stress.',
  15,
  'behavioral',
  ARRAY[
    'Incoraggiare uso spontaneo del comfort object',
    'Premiare comportamenti calmi durante stress lieve',
    'Non intervenire immediatamente in caso di agitazione minore',
    'Permettere sviluppo di strategie personali di coping'
  ],
  ARRAY['comfort object', 'premi', 'pazienza proprietario'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 5, 'Test Resilienza Ambientale',
  'Testare stabilità in condizioni leggermente diverse per generalizzazione.',
  12,
  'behavioral',
  ARRAY[
    'Variare leggermente orario delle separazioni',
    'Utilizzare porte diverse per uscire',
    'Cambiare ordine della routine di partenza',
    'Mantenere durata costante ma modificare variabili minori'
  ],
  ARRAY['timer', 'diverse uscite', 'routine flessibile'],
  now(), now()
FROM new_protocol

-- GIORNO 6: CONSOLIDAMENTO AVANZATO
UNION ALL
SELECT 
  new_protocol.id, 6, 'Separazioni di 15-20 Minuti',
  'Raggiungere durate significative di solitudine serena.',
  25,
  'behavioral',
  ARRAY[
    'Uscire per 15-20 minuti usando tutto il protocollo',
    'Variare destinazione per rendere assenze più realistiche',
    'Osservare comportamento attraverso telecamera se disponibile',
    'Documentare progressi e comportamenti positivi'
  ],
  ARRAY['timer', 'puzzle toy', 'comfort object', 'eventuale telecamera'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 6, 'Training Anticipazione Positiva',
  'Trasformare l''anticipazione della partenza in aspettativa positiva.',
  10,
  'behavioral',
  ARRAY[
    'Associare segnali di partenza con eventi piacevoli',
    'Dare puzzle toy speciale solo prima delle uscite',
    'Creare routine che l''animale possa anticipare positivamente',
    'Celebrare tranquillità durante preparazioni partenza'
  ],
  ARRAY['puzzle toy speciale', 'snack premium', 'routine partenza'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 6, 'Simulazione Assenza Prolungata',
  'Preparare per assenze future più lunghe attraverso simulazione.',
  18,
  'behavioral',
  ARRAY[
    'Creare simulazione di assenza lunga senza uscire realmente',
    'Rimanere silenziosi in casa per 20-30 minuti',
    'Osservare capacità di auto-intrattenimento',
    'Valutare necessità di supporti aggiuntivi per futuro'
  ],
  ARRAY['timer', 'spazio silenzioso', 'osservazione discreta'],
  now(), now()
FROM new_protocol

-- GIORNO 7: CONSOLIDAMENTO INDIPENDENZA SERENA
UNION ALL
SELECT 
  new_protocol.id, 7, 'Test Indipendenza Completa',
  'Valutare l''autonomia raggiunta con separazione completa.',
  30,
  'behavioral',
  ARRAY[
    'Uscire per 25-30 minuti con routine completamente normale',
    'Non utilizzare supporti extra se l''animale è pronto',
    'Osservare comportamento al rientro per valutare stress',
    'Documentare successo e aree che necessitano rinforzo'
  ],
  ARRAY['timer', 'routine normale', 'osservazione'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 7, 'Consolidamento Strategie Apprese',
  'Rafforzare tutte le strategie di coping sviluppate durante il protocollo.',
  15,
  'behavioral',
  ARRAY[
    'Ripassare uso comfort object in modo spontaneo',
    'Verificare autoregolazione emotiva',
    'Confermare indipendenza fisica in casa',
    'Celebrare progressi raggiunti con rinforzi positivi'
  ],
  ARRAY['comfort object', 'premi speciali', 'spazio sicuro'],
  now(), now()
FROM new_protocol
UNION ALL
SELECT 
  new_protocol.id, 7, 'Pianificazione Mantenimento',
  'Creare piano per mantenere progressi e prevenire regressioni future.',
  12,
  'behavioral',
  ARRAY[
    'Continuare micro-separazioni quotidiane anche dopo successo',
    'Mantenere routine neutre di partenza sempre',
    'Utilizzare puzzle toy regolarmente per stimolazione',
    'Monitorare segnali precoci di regressione ansiosa'
  ],
  ARRAY['piano scritto', 'routine mantenimento', 'strumenti consolidati'],
  now(), now()
FROM new_protocol;