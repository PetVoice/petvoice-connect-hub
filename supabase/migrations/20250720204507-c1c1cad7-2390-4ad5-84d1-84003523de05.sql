-- Creo il protocollo "Stop Comportamenti Distruttivi"
INSERT INTO public.ai_training_protocols (
  title,
  description,
  category,
  difficulty,
  duration_days,
  target_behavior,
  triggers,
  required_materials,
  status,
  success_rate,
  ai_generated,
  is_public,
  veterinary_approved,
  community_rating,
  community_usage,
  mentor_recommended,
  notifications_enabled,
  estimated_cost
) VALUES (
  'Stop Comportamenti Distruttivi',
  'Protocollo intensivo per eliminare comportamenti distruttivi come masticazione inappropriata, scavo e distruzione di oggetti. Focus su redirezione positiva e autocontrollo.',
  'comportamento',
  'medio',
  8,
  'Eliminare masticazione distruttiva, scavo, distruzione oggetti domestici',
  ARRAY['noia', 'ansia da separazione', 'eccesso energia', 'dentizione', 'stress'],
  ARRAY['Kong riempibile', 'Puzzle feeder', 'Giocattoli masticabili', 'Spray deterrente naturale', 'Tappetino snuffle', 'Corda resistente', 'Osso di pelle'],
  'available',
  85,
  true,
  true,
  false,
  4.3,
  127,
  true,
  true,
  25.50
);

-- Recupero l''ID del protocollo appena creato
WITH protocol_id AS (
  SELECT id FROM ai_training_protocols 
  WHERE title = 'Stop Comportamenti Distruttivi' 
  ORDER BY created_at DESC 
  LIMIT 1
)

-- GIORNO 1: Identificazione Trigger e Prevenzione Base
INSERT INTO public.ai_training_exercises (
  protocol_id,
  day_number,
  title,
  description,
  duration_minutes,
  exercise_type,
  instructions,
  materials,
  completed,
  effectiveness_score
) 
SELECT 
  p.id,
  1,
  'Audit Casa e Identificazione Zone Rischio',
  'Mappatura completa degli oggetti a rischio e identificazione dei trigger ambientali che scatenano comportamenti distruttivi.',
  12,
  'behavioral',
  ARRAY[
    'Cammina per casa identificando tutti gli oggetti morsi/danneggiati',
    'Fotografa le zone più colpite per documentare il pattern',
    'Annota orari e situazioni quando avvengono i danni',
    'Rimuovi temporaneamente oggetti di valore dalle zone accessibili',
    'Identifica 3 fattori scatenanti principali (noia, ansia, energia)',
    'Crea una mappa visiva delle "zone proibite" vs "zone permesse"'
  ],
  ARRAY['Quaderno/app per annotazioni', 'Fotocamera smartphone', 'Nastro segna-pavimento'],
  false,
  0
FROM protocol_id p

UNION ALL

SELECT 
  p.id,
  1,
  'Setup Ambiente Anti-Distruttivo',
  'Preparazione strategica dell''ambiente per ridurre opportunità di comportamenti inappropriati e creare alternative positive.',
  15,
  'behavioral',
  ARRAY[
    'Applica spray deterrente naturale su mobili e oggetti a rischio',
    'Posiziona giocattoli masticabili appropriati in ogni stanza',
    'Crea una "stazione masticazione" con 3-4 opzioni diverse',
    'Installa barriere fisiche dove necessario (baby gates)',
    'Prepara Kong riempiti con cibo e congelali per utilizzo futuro',
    'Verifica che non ci siano oggetti piccoli pericolosi a portata'
  ],
  ARRAY['Spray deterrente', '4-5 giocattoli masticabili diversi', 'Kong', 'Cibo umido/pasta', 'Baby gates se necessario'],
  false,
  0
FROM protocol_id p

UNION ALL

SELECT 
  p.id,
  1,
  'Primo Training "NO" e Redirezione',
  'Introduzione del comando "NO" seguito da immediata redirezione su oggetto appropriato per stabilire associazioni positive.',
  10,
  'behavioral',
  ARRAY[
    'Quando vedi il tuo animale avvicinarsi a oggetto proibito, di "NO" fermo',
    'Immediatamente offri un giocattolo masticabile appropriato',
    'Loda entusiasticamente quando accetta l''alternativa ("Bravo! Questo sì!")',
    'Ripeti 5-8 volte durante la sessione con oggetti diversi',
    'Non urlare o punire fisicamente - solo redirezione positiva',
    'Termina sempre con successo: gioco con oggetto appropriato'
  ],
  ARRAY['Giocattoli masticabili', 'Premi piccoli', 'Pazienza e consistenza'],
  false,
  0
FROM protocol_id p;