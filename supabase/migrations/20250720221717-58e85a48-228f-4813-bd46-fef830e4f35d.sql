-- Crea protocollo "Socializzazione Progressiva" con 5 giorni e 15 esercizi
-- CORREZIONE: usa tipi di esercizio validi (behavioral, physical, social, mental)

-- Inserisci il protocollo principale
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
  is_public,
  ai_generated,
  veterinary_approved,
  community_rating,
  success_rate,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Socializzazione Progressiva',
  'Protocollo di 5 giorni per migliorare le competenze sociali dell''animale con altri animali e persone. Approccio graduale e positivo per animali timidi o poco socializzati, con focus su confidence building e interazioni controllate.',
  'socializzazione',
  'facile',
  5,
  'Migliorare competenze sociali, ridurre timidezza, aumentare fiducia nelle interazioni',
  ARRAY['presenza di estranei', 'altri animali', 'ambienti sociali', 'situazioni di gruppo', 'spazi pubblici'],
  ARRAY['snack premio altissimo valore', 'giocattoli sociali', 'guinzaglio lungo', 'tappetino comfort', 'barriere visive mobili', 'spazi neutri sicuri'],
  true,
  true,
  true,
  8.5,
  85,
  now(),
  now()
);

-- Ottieni l'ID del protocollo appena creato
DO $$
DECLARE
  protocol_uuid UUID;
BEGIN
  SELECT id INTO protocol_uuid FROM public.ai_training_protocols WHERE title = 'Socializzazione Progressiva' ORDER BY created_at DESC LIMIT 1;

  -- GIORNO 1: Foundation Confidence e Comfort Zone
  
  -- Esercizio 1.1: Creazione Safe Space Personale
  INSERT INTO public.ai_training_exercises (
    protocol_id, day_number, title, description, duration_minutes, exercise_type,
    instructions, materials
  ) VALUES (
    protocol_uuid, 1, 'Creazione Safe Space Personale',
    'Stabilire un ambiente sicuro e confortevole dove l''animale può rilassarsi e costruire fiducia. Questo esercizio crea le fondamenta per tutti gli altri allenamenti sociali.',
    15, 'behavioral',
    ARRAY[
      'Scegli uno spazio tranquillo e familiare per l''animale',
      'Posiziona il tappetino comfort in un angolo sicuro', 
      'Offri snack premio quando l''animale si avvicina spontaneamente',
      'Mantieni distanza e lascia che l''animale esplori liberamente',
      'Rinforza positivamente ogni comportamento calmo e rilassato',
      'BODY LANGUAGE: Osserva postura rilassata, coda in posizione neutrale',
      'BODY LANGUAGE: Cerca respiro regolare e orecchie rilassate',
      'BODY LANGUAGE: Evita segnali stress come ansimare o tremare'
    ],
    ARRAY['tappetino comfort', 'snack premio', 'spazio tranquillo']
  );

  -- Esercizio 1.2: Confidence Building con Handler
  INSERT INTO public.ai_training_exercises (
    protocol_id, day_number, title, description, duration_minutes, exercise_type,
    instructions, materials
  ) VALUES (
    protocol_uuid, 1, 'Confidence Building con Handler',
    'Rafforzare il legame con il proprietario attraverso attività positive che aumentano la fiducia. Base essenziale per estendere la socializzazione ad altri.',
    12, 'behavioral',
    ARRAY[
      'Inizia con semplici comandi che l''animale conosce bene',
      'Ricompensa immediatamente ogni successo con snack e lodi',
      'Gradualmente introduci piccole novità positive (nuovo giocattolo)',
      'Mantieni sempre un tono di voce calmo e incoraggiante',
      'Termina sempre con un successo e rinforzo positivo',
      'BODY LANGUAGE: Cerca eye contact volontario e avvicinamento spontaneo',
      'BODY LANGUAGE: Osserva coda che scodinzola in modo rilassato',
      'BODY LANGUAGE: Nota postura aperta e disponibile all''interazione'
    ],
    ARRAY['snack premio', 'giocattolo nuovo', 'voce calma']
  );

  -- Esercizio 1.3: Osservazione Passiva Ambiente
  INSERT INTO public.ai_training_exercises (
    protocol_id, day_number, title, description, duration_minutes, exercise_type,
    instructions, materials
  ) VALUES (
    protocol_uuid, 1, 'Osservazione Passiva Ambiente',
    'Abituare l''animale a osservare l''ambiente esterno da una posizione sicura, sviluppando curiosità invece di paura verso ciò che è sconosciuto.',
    10, 'mental',
    ARRAY[
      'Posizionati vicino a una finestra o porta a vetri',
      'Lascia che l''animale osservi l''esterno dal suo safe space',
      'Ricompensa la curiosità calma verso stimoli esterni',
      'Non forzare l''avvicinamento, rispetta i tempi dell''animale',
      'Offri distrazioni positive se mostra stress',
      'BODY LANGUAGE: Osserva orecchie in avanti che indicano interesse',
      'BODY LANGUAGE: Cerca postura bilanciata, non tesa o rigida',
      'BODY LANGUAGE: Valuta se l''animale si avvicina volontariamente'
    ],
    ARRAY['finestra sicura', 'snack premio', 'tappetino comfort']
  );

  -- GIORNO 2: Interazioni Controllate - Fase 1
  
  -- Esercizio 2.1: Introduzione Presenza Umana a Distanza
  INSERT INTO public.ai_training_exercises (
    protocol_id, day_number, title, description, duration_minutes, exercise_type,
    instructions, materials
  ) VALUES (
    protocol_uuid, 2, 'Introduzione Presenza Umana a Distanza',
    'Primo step per abituare l''animale alla presenza di persone sconosciute, mantenendo distanze sicure e associazioni positive.',
    15, 'social',
    ARRAY[
      'Chiedi a un familiare di rimanere a distanza visibile ma non minacciosa',
      'La persona deve ignorare completamente l''animale inizialmente',
      'Offri snack premio quando l''animale nota la presenza senza stress',
      'Mantieni la distanza finché l''animale non mostra curiosità',
      'La persona può gradualmente fare movimenti lenti e prevedibili',
      'BODY LANGUAGE: Cerca curiosità invece di paura o aggressività',
      'BODY LANGUAGE: Osserva se l''animale si orienta verso la persona',
      'BODY LANGUAGE: Valuta tensione muscolare - dovrebbe diminuire'
    ],
    ARRAY['snack premio', 'spazio ampio', 'persona collaborativa']
  );

  -- Esercizio 2.2: Parallel Walking Introduttivo
  INSERT INTO public.ai_training_exercises (
    protocol_id, day_number, title, description, duration_minutes, exercise_type,
    instructions, materials
  ) VALUES (
    protocol_uuid, 2, 'Parallel Walking Introduttivo',
    'Introduzione al concetto di condivisione dello spazio attraverso camminate parallele a distanza sicura, tecnica fondamentale per la socializzazione.',
    12, 'physical',
    ARRAY[
      'Inizia con un familiare che cammina parallelamente a 3-4 metri',
      'Mantieni il passo dell''animale, non accelerare se mostra stress',
      'Ricompensa ogni momento di calma durante la camminata parallela',
      'Gradualmente riduci la distanza solo se l''animale è rilassato',
      'Termina con successo prima che l''animale mostri stanchezza',
      'BODY LANGUAGE: Osserva andatura rilassata, non tesa o rigida',
      'BODY LANGUAGE: Cerca occhiate curiose verso l''altra persona',
      'BODY LANGUAGE: Valuta se l''animale mantiene interesse nell''ambiente'
    ],
    ARRAY['guinzaglio lungo', 'snack premio', 'percorso sicuro']
  );

  -- Esercizio 2.3: Positive Association con Estranei
  INSERT INTO public.ai_training_exercises (
    protocol_id, day_number, title, description, duration_minutes, exercise_type,
    instructions, materials
  ) VALUES (
    protocol_uuid, 2, 'Positive Association con Estranei',
    'Creare associazioni positive con la presenza di persone sconosciute attraverso il timing perfetto di ricompense e esperienze piacevoli.',
    10, 'behavioral',
    ARRAY[
      'Posiziona l''animale nel suo safe space con vista su estranei lontani',
      'Ogni volta che appare una persona, offri immediatamente snack speciali',
      'Quando la persona scompare, interrompi i premi',
      'Ripeti questo pattern per creare associazione positiva',
      'Mantieni sempre controllo sulla situazione e distanze sicure',
      'BODY LANGUAGE: Cerca anticipazione positiva alla vista di persone',
      'BODY LANGUAGE: Osserva riduzione dei segnali di stress nel tempo',
      'BODY LANGUAGE: Valuta se l''animale cerca il proprietario per rassicurazione'
    ],
    ARRAY['snack altissimo valore', 'spazio controllato', 'vista su estranei']
  );

  -- GIORNO 3: Interazioni Controllate - Fase 2
  
  -- Esercizio 3.1: Meet-and-Greet Controllato
  INSERT INTO public.ai_training_exercises (
    protocol_id, day_number, title, description, duration_minutes, exercise_type,
    instructions, materials
  ) VALUES (
    protocol_uuid, 3, 'Meet-and-Greet Controllato',
    'Primo incontro diretto con persona sconosciuta seguendo protocolli precisi per garantire esperienza positiva e costruire fiducia sociale.',
    15, 'social',
    ARRAY[
      'La persona sconosciuta deve ignorare l''animale e parlare solo con te',
      'Lascia che l''animale decida se e quando avvicinarsi',
      'Ricompensa ogni movimento volontario verso la persona',
      'La persona non deve toccare o parlare all''animale inizialmente',
      'Mantieni sessione breve e termina con successo positivo',
      'BODY LANGUAGE: Osserva approach e retreat patterns dell''animale',
      'BODY LANGUAGE: Cerca segnali di interesse come sniffing volontario',
      'BODY LANGUAGE: Valuta stress signs e interrompi se necessario'
    ],
    ARRAY['snack premio', 'persona collaborativa', 'spazio neutro']
  );

  -- Esercizio 3.2: Condivisione Spazio con Altri Animali
  INSERT INTO public.ai_training_exercises (
    protocol_id, day_number, title, description, duration_minutes, exercise_type,
    instructions, materials
  ) VALUES (
    protocol_uuid, 3, 'Condivisione Spazio con Altri Animali',
    'Introduzione graduale alla presenza di altri animali in spazio condiviso, mantenendo distanze sicure e promuovendo tolleranza reciproca.',
    12, 'social',
    ARRAY[
      'Scegli un animale calmo e ben socializzato come partner',
      'Inizia con entrambi gli animali ai lati opposti di uno spazio ampio',
      'Entrambi i proprietari devono mantenere atmosfera rilassata',
      'Ricompensa ignorare l''altro animale e comportamenti calmi',
      'Avvicina gradualmente solo se entrambi mostrano comfort',
      'BODY LANGUAGE: Osserva postura rilassata in entrambi gli animali',
      'BODY LANGUAGE: Cerca segnali di gioco o curiosità positiva',
      'BODY LANGUAGE: Valuta tensione e preparati a aumentare distanza'
    ],
    ARRAY['guinzaglio lungo', 'snack premio', 'animale partner calmo']
  );

  -- Esercizio 3.3: Social Skills in Ambiente Controllato
  INSERT INTO public.ai_training_exercises (
    protocol_id, day_number, title, description, duration_minutes, exercise_type,
    instructions, materials
  ) VALUES (
    protocol_uuid, 3, 'Social Skills in Ambiente Controllato',
    'Sviluppo di competenze sociali di base attraverso attività strutturate che insegnano comunicazione appropriata e rispetto degli spazi altrui.',
    10, 'behavioral',
    ARRAY[
      'Pratica comandi di base in presenza di distrazioni sociali lievi',
      'Insegna "guarda me" quando l''animale è tentato di focalizzarsi su altri',
      'Ricompensa il mantenimento dell''attenzione nonostante le distrazioni',
      'Pratica autocontrollo con sit/stay mentre altri si muovono',
      'Rinforza sempre il successo sociale con premi di alto valore',
      'BODY LANGUAGE: Cerca focus sul proprietario invece che distrazioni',
      'BODY LANGUAGE: Osserva capacità di rilassarsi in presenza di stimoli',
      'BODY LANGUAGE: Valuta se l''animale risponde ai comandi sotto distrazione'
    ],
    ARRAY['snack altissimo valore', 'spazio controllato', 'distrazioni lievi']
  );

  -- GIORNO 4: Social Skills Avanzate
  
  -- Esercizio 4.1: Group Activity Supervisionata
  INSERT INTO public.ai_training_exercises (
    protocol_id, day_number, title, description, duration_minutes, exercise_type,
    instructions, materials
  ) VALUES (
    protocol_uuid, 4, 'Group Activity Supervisionata',
    'Partecipazione a attività di gruppo semplici e altamente supervisionate per sviluppare competenze sociali complesse e fiducia in situazioni multi-individuali.',
    15, 'social',
    ARRAY[
      'Organizza piccolo gruppo (2-3 persone/animali) in spazio controllato',
      'Tutti i partecipanti devono essere calmi e ben socializzati',
      'Mantieni attività semplici come camminata di gruppo o sit insieme',
      'Ricompensa comportamenti sociali appropriati e calmi',
      'Monitora costantemente stress levels di tutti i partecipanti',
      'BODY LANGUAGE: Osserva capacità di rilassarsi in gruppo',
      'BODY LANGUAGE: Cerca interazioni positive spontanee',
      'BODY LANGUAGE: Valuta overstimulation e adatta di conseguenza'
    ],
    ARRAY['snack premio', 'gruppo piccolo', 'spazio ampio sicuro']
  );

  -- Esercizio 4.2: Reading Social Cues Training
  INSERT INTO public.ai_training_exercises (
    protocol_id, day_number, title, description, duration_minutes, exercise_type,
    instructions, materials
  ) VALUES (
    protocol_uuid, 4, 'Reading Social Cues Training',
    'Insegnare all''animale a leggere e rispondere appropriatamente ai segnali sociali di altri animali e persone, competenza fondamentale per interazioni sicure.',
    12, 'mental',
    ARRAY[
      'Presenta situazioni con social cues chiari (persona che si avvicina lentamente)',
      'Insegna comandi di redirect quando l''animale legge correttamente i segnali',
      'Ricompensa lettura corretta dei segnali sociali',
      'Pratica "spazio personale" insegnando quando non avvicinarsi',
      'Rinforza ritorno volontario al proprietario quando incerto',
      'BODY LANGUAGE: Osserva se l''animale esita appropriatamente prima di avvicinarsi',
      'BODY LANGUAGE: Cerca segnali di valutazione prima dell''azione',
      'BODY LANGUAGE: Valuta risposta ai segnali di stop o retreat'
    ],
    ARRAY['snack premio', 'persone collaborative', 'segnali chiari']
  );

  -- Esercizio 4.3: Supervised Social Play
  INSERT INTO public.ai_training_exercises (
    protocol_id, day_number, title, description, duration_minutes, exercise_type,
    instructions, materials
  ) VALUES (
    protocol_uuid, 4, 'Supervised Social Play',
    'Introduzione al gioco sociale supervisionato con altri animali compatibili, sviluppando competenze di interazione ludica appropriata e autoregolazione.',
    10, 'social',
    ARRAY[
      'Scegli partner di gioco con energia e stile compatibili',
      'Inizia con giochi paralleli (ognuno con il proprio giocattolo)',
      'Permetti interazione diretta solo se entrambi mostrano invitation signals',
      'Interrompi il gioco ogni 2-3 minuti per check-in con proprietari',
      'Termina sempre mentre il gioco è ancora positivo e rilassato',
      'BODY LANGUAGE: Cerca play signals come play bow e face relaxed',
      'BODY LANGUAGE: Osserva turn-taking e reciprocità nel gioco',
      'BODY LANGUAGE: Valuta escalation e intervieni prima che diventi troppo intenso'
    ],
    ARRAY['giocattoli sociali', 'partner compatibile', 'spazio gioco sicuro']
  );

  -- GIORNO 5: Free Interaction e Consolidamento
  
  -- Esercizio 5.1: Free Choice Social Interaction
  INSERT INTO public.ai_training_exercises (
    protocol_id, day_number, title, description, duration_minutes, exercise_type,
    instructions, materials
  ) VALUES (
    protocol_uuid, 5, 'Free Choice Social Interaction',
    'Permettere all''animale di scegliere liberamente le proprie interazioni sociali in ambiente sicuro, consolidando fiducia e competenze sviluppate nei giorni precedenti.',
    15, 'social',
    ARRAY[
      'Crea ambiente sociale con multiple opzioni di interazione disponibili',
      'Lascia che l''animale scelga quando, come e con chi interagire',
      'Ricompensa scelte sociali positive e appropriate',
      'Non forzare interazioni, rispetta completamente le preferenze',
      'Mantieni supervisione discreta ma costante per sicurezza',
      'BODY LANGUAGE: Osserva confidence nei movimenti e nelle scelte',
      'BODY LANGUAGE: Cerca initiative taking nelle interazioni sociali',
      'BODY LANGUAGE: Valuta overall comfort level in ambiente sociale'
    ],
    ARRAY['ambiente multi-opzione', 'snack premio', 'supervisione discreta']
  );

  -- Esercizio 5.2: Real-World Social Application
  INSERT INTO public.ai_training_exercises (
    protocol_id, day_number, title, description, duration_minutes, exercise_type,
    instructions, materials
  ) VALUES (
    protocol_uuid, 5, 'Real-World Social Application',
    'Applicazione delle competenze sociali acquisite in contesto reale ma controllato, test finale delle abilità sviluppate durante il protocollo.',
    12, 'physical',
    ARRAY[
      'Visita ambiente pubblico ma tranquillo (parco poco frequentato)',
      'Pratica tutti gli skills appresi in contesto reale ma gestibile',
      'Mantieni sessioni brevi e positive, non sovraccaricare',
      'Usa tutte le competenze sviluppate: meet-and-greet, social cues, etc.',
      'Celebra ogni successo sociale con rinforzi di altissimo valore',
      'BODY LANGUAGE: Osserva generalizzazione delle competenze apprese',
      'BODY LANGUAGE: Cerca adaptability a nuovi ambienti sociali',
      'BODY LANGUAGE: Valuta confidence generale nell''affrontare novità sociali'
    ],
    ARRAY['ambiente pubblico tranquillo', 'snack altissimo valore', 'guinzaglio sicuro']
  );

  -- Esercizio 5.3: Celebration e Consolidamento Successi
  INSERT INTO public.ai_training_exercises (
    protocol_id, day_number, title, description, duration_minutes, exercise_type,
    instructions, materials
  ) VALUES (
    protocol_uuid, 5, 'Celebration e Consolidamento Successi',
    'Sessione di consolidamento finale che celebra i progressi raggiunti e rafforza tutte le competenze sociali positive sviluppate durante il protocollo.',
    10, 'behavioral',
    ARRAY[
      'Rivedi e pratica tutti gli esercizi che hanno avuto più successo',
      'Crea "social success story" per l''animale con molte ricompense',
      'Coinvolgi tutti i partner sociali positivi incontrati nel protocollo',
      'Documenta i progressi e i traguardi raggiunti per riferimento futuro',
      'Termina con celebrazione sociale positiva e rilassata',
      'BODY LANGUAGE: Osserva pride e confidence negli achievement raggiunti',
      'BODY LANGUAGE: Cerca enthusiasm spontaneo per interazioni sociali',
      'BODY LANGUAGE: Valuta overall transformation dal giorno 1 ad oggi'
    ],
    ARRAY['tutti i partner sociali', 'snack celebrativi', 'ambiente positivo']
  );

END $$;