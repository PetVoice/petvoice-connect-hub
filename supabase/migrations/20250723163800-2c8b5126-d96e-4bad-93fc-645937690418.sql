-- PULIZIA COMPLETA E RICREAZIONE PROTOCOLLI AI TRAINING
-- Elimina tutti i protocolli e esercizi esistenti e li ricrea puliti

-- 1. Elimina tutti gli esercizi esistenti
DELETE FROM ai_training_exercises;

-- 2. Elimina tutti i protocolli esistenti
DELETE FROM ai_training_protocols;

-- 3. Ricrea i protocolli puliti (solo versioni pubbliche master)
INSERT INTO ai_training_protocols (
  title, description, category, difficulty, duration_days, target_behavior, 
  triggers, required_materials, status, ai_generated, is_public
) VALUES 
-- Controllo Aggressività Reattiva
(
  'Controllo Aggressività Reattiva',
  'Protocollo avanzato per la gestione sicura dell''aggressività reattiva. Priorità assoluta sulla sicurezza, controllo impulsi e sviluppo comportamenti alternativi. Richiede supervisione professionale.',
  'comportamento',
  'difficile',
  7,
  'Ridurre reattività aggressiva, sviluppare autocontrollo, implementare comportamenti alternativi sicuri',
  ARRAY['trigger specifici', 'over-arousal', 'frustrazioni', 'resource guarding', 'territorial response', 'fear-based aggression'],
  ARRAY['guinzaglio sicurezza rinforzato', 'barriere fisiche', 'snack altissimo valore', 'spazi controllati', 'timer', 'misuratore distanza'],
  'available',
  true,
  true
),

-- Gestione Ansia da Separazione
(
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
  true
),

-- Gestione Gelosia e Possessività
(
  'Gestione Gelosia e Possessività',
  'Protocollo specializzato per ridurre comportamenti possessivi e gelosia negli animali domestici. Include tecniche avanzate di desensibilizzazione, training di condivisione e gestione delle risorse.',
  'comportamento',
  'difficile',
  10,
  'Riduzione resource guarding, gelosia e possessività',
  ARRAY['Resource guarding', 'Gelosia verso altri pet', 'Possessività con il proprietario', 'Aggressività durante i pasti', 'Protezione territoriale'],
  ARRAY['Ciotole multiple', 'Snack alto valore', 'Giocattoli vari', 'Barriere di sicurezza', 'Guinzagli di controllo', 'Tappetini separatori'],
  'available',
  true,
  true
),

-- Gestione Iperattività e Deficit Attenzione
(
  'Gestione Iperattività e Deficit Attenzione',
  'Protocollo completo per ridurre iperattività e migliorare concentrazione attraverso un approccio progressivo: dalla scarica di energia costruttiva al controllo degli impulsi, fino al rilassamento e autocontrollo.',
  'comportamento',
  'medio',
  10,
  'Riduzione iperattività, miglioramento concentrazione e autocontrollo',
  ARRAY['energia_eccessiva', 'difficolta_concentrazione', 'irrequietezza', 'impulsi_incontrollati', 'ansia_da_separazione'],
  ARRAY['giocattoli_puzzle', 'snack_training', 'ostacoli_casalinghi', 'tappetino_rilassamento', 'clicker', 'guinzaglio_lungo'],
  'available',
  true,
  true
),

-- Ottimizzazione Ciclo Sonno-Veglia
(
  'Ottimizzazione Ciclo Sonno-Veglia',
  'Protocollo specializzato per stabilire pattern di sonno salutari, ridurre insonnia e risvegli notturni. Attraverso routine pre-sonno, ottimizzazione ambientale e regolazione circadiana, aiuta gli animali a sviluppare abitudini di riposo naturali e ristoratori.',
  'comportamento',
  'facile',
  7,
  'Stabilire cicli sonno-veglia regolari e ridurre disturbi del sonno',
  ARRAY['Irrequietezza notturna', 'Risvegli frequenti', 'Difficoltà addormentamento', 'Attività notturna eccessiva', 'Stress da cambi orari'],
  ARRAY['Cuccia comoda', 'Luci soffuse/dimmerabili', 'Musica rilassante pet-safe', 'Aromatherapy pet-safe', 'Coperte morbide', 'Timer per routine'],
  'available',
  true,
  true
),

-- Riattivazione Energia e Motivazione
(
  'Riattivazione Energia e Motivazione',
  'Protocollo graduale per combattere depressione, apatia e perdita di interesse negli animali. Approccio dolce e progressivo per risvegliare la motivazione attraverso stimoli sensoriali, attivazione fisica e ripristino dell''interesse sociale.',
  'comportamento',
  'facile',
  8,
  'Riattivazione motivazione, energia e interesse',
  ARRAY['depressione', 'apatia', 'letargia', 'perdita interesse', 'scarsa motivazione', 'isolamento sociale'],
  ARRAY['snack speciali ad alto valore', 'giocattoli nuovi e stimolanti', 'tessuti con texture diverse', 'profumi/essenze naturali', 'puzzle alimentari', 'tappetini antiscivolo', 'guinzaglio morbido', 'spazzola delicata'],
  'available',
  true,
  true
),

-- Rieducazione Alimentare Comportamentale
(
  'Rieducazione Alimentare Comportamentale',
  'Protocollo intermedio per risolvere disturbi comportamentali legati all''alimentazione. Affronta alimentazione compulsiva, rifiuto del cibo, food guarding e ansia alimentare attraverso un approccio graduale e non punitivo.',
  'alimentazione',
  'medio',
  9,
  'Sviluppare una relazione sana con il cibo, eliminare comportamenti compulsivi e ansia durante i pasti',
  ARRAY['alimentazione compulsiva', 'rifiuto cibo', 'food guarding', 'ansia durante pasti', 'voracità', 'competizione alimentare'],
  ARRAY['ciotole anti-ingozzamento', 'puzzle feeder', 'timer', 'snack per training', 'ciotole multiple', 'separatori'],
  'available',
  true,
  true
),

-- Socializzazione Progressiva
(
  'Socializzazione Progressiva',
  'Protocollo di 5 giorni per migliorare le competenze sociali dell''animale con altri animali e persone. Approccio graduale e positivo per animali timidi o poco socializzati, con focus su confidence building e interazioni controllate.',
  'socializzazione',
  'facile',
  5,
  'Migliorare competenze sociali, ridurre timidezza, aumentare fiducia nelle interazioni',
  ARRAY['presenza di estranei', 'altri animali', 'ambienti sociali', 'situazioni di gruppo', 'spazi pubblici'],
  ARRAY['snack premio altissimo valore', 'giocattoli sociali', 'guinzaglio lungo', 'tappetino comfort', 'barriere visive mobili', 'spazi neutri sicuri'],
  'available',
  true,
  true
),

-- Stop Comportamenti Distruttivi
(
  'Stop Comportamenti Distruttivi',
  'Protocollo intensivo per eliminare masticazione distruttiva, scavo eccessivo e distruzione di oggetti domestici.',
  'comportamento',
  'difficile',
  8,
  'Eliminazione comportamenti distruttivi',
  ARRAY['distruttivo', 'distrutto', 'mastica', 'scava', 'rompe'],
  ARRAY['Giochi da masticare', 'Spray amaro', 'Puzzle feeder', 'Giochi interattivi'],
  'available',
  true,
  true
),

-- Superare Fobie e Paure Specifiche
(
  'Superare Fobie e Paure Specifiche',
  'Programma avanzato di desensibilizzazione sistematica per superare fobie intense di rumori, oggetti e situazioni specifiche attraverso tecniche scientifiche graduali',
  'comportamento',
  'difficile',
  10,
  'Desensibilizzazione a fobie specifiche',
  ARRAY['aspirapolvere', 'temporali', 'rumori forti', 'oggetti specifici', 'situazioni scatenanti'],
  ARRAY['registrazioni audio', 'oggetti trigger', 'snack alto valore', 'safe space', 'clicker'],
  'available',
  true,
  true
);

-- Messaggio di conferma
DO $$
BEGIN
  RAISE NOTICE 'PULIZIA COMPLETATA: Eliminati tutti i duplicati e ricreati % protocolli puliti', 
    (SELECT COUNT(*) FROM ai_training_protocols);
END $$;