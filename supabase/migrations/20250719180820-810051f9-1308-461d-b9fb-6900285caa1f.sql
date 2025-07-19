-- Creo protocolli aggiuntivi per coprire tutte le emozioni negative

-- 1. Gestione Iperattività e ADHD
INSERT INTO ai_training_protocols (
  title, description, category, difficulty, duration_days, 
  target_behavior, triggers, required_materials, status, is_public, 
  success_rate, community_rating, ai_generated, veterinary_approved
) VALUES (
  'Gestione Iperattività e Deficit Attenzione',
  'Protocollo specializzato per ridurre l''iperattività e migliorare la concentrazione attraverso esercizi di canalizzazione dell''energia e tecniche di rilassamento.',
  'comportamento',
  'medio',
  10,
  'Riduzione iperattività e miglioramento concentrazione',
  ARRAY['iperattivo', 'irrequieto', 'distratto', 'impulsivo', 'energico'],
  ARRAY['Palla Kong', 'Tappetino sniffing', 'Ostacoli bassi', 'Premi di alto valore'],
  'available',
  true,
  82.4,
  4.3,
  true,
  true
);

-- 2. Controllo Comportamenti Distruttivi
INSERT INTO ai_training_protocols (
  title, description, category, difficulty, duration_days,
  target_behavior, triggers, required_materials, status, is_public,
  success_rate, community_rating, ai_generated, veterinary_approved
) VALUES (
  'Stop Comportamenti Distruttivi',
  'Protocollo intensivo per eliminare masticazione distruttiva, scavo eccessivo e distruzione di oggetti domestici.',
  'comportamento',
  'difficile',
  12,
  'Eliminazione comportamenti distruttivi',
  ARRAY['distruttivo', 'distrutto', 'mastica', 'scava', 'rompe'],
  ARRAY['Giochi da masticare', 'Spray amaro', 'Puzzle feeder', 'Giochi interattivi'],
  'available',
  true,
  79.8,
  4.1,
  true,
  true
);

-- 3. Gestione Fobie e Paure Specifiche
INSERT INTO ai_training_protocols (
  title, description, category, difficulty, duration_days,
  target_behavior, triggers, required_materials, status, is_public,
  success_rate, community_rating, ai_generated, veterinary_approved
) VALUES (
  'Superare Fobie e Paure Specifiche',
  'Desensibilizzazione graduale per fobie specifiche come rumori forti, temporali, aspirapolvere e altri trigger ambientali.',
  'sociale',
  'medio',
  14,
  'Riduzione fobie e reazioni di paura',
  ARRAY['fobico', 'terrorizzato', 'tremante', 'nascosto', 'paralizzato'],
  ARRAY['Cuffie anti-rumore', 'Coperta comfort', 'Diffusore feromoni', 'Registrazioni audio'],
  'available',
  true,
  88.2,
  4.7,
  true,
  true
);

-- 4. Recupero da Depressione e Apatia
INSERT INTO ai_training_protocols (
  title, description, category, difficulty, duration_days,
  target_behavior, triggers, required_materials, status, is_public,
  success_rate, community_rating, ai_generated, veterinary_approved
) VALUES (
  'Riattivazione Energia e Motivazione',
  'Programma di stimolazione mentale e fisica per combattere depressione, apatia e perdita di interesse nelle attività.',
  'fisico',
  'facile',
  8,
  'Recupero energia e interesse',
  ARRAY['depresso', 'apatico', 'letargico', 'disinteressato', 'spento'],
  ARRAY['Giochi motivanti', 'Premi speciali', 'Tappetino puzzle', 'Corde per giocare'],
  'available',
  true,
  86.5,
  4.5,
  true,
  true
);

-- 5. Controllo Gelosia e Possessività
INSERT INTO ai_training_protocols (
  title, description, category, difficulty, duration_days,
  target_behavior, triggers, required_materials, status, is_public,
  success_rate, community_rating, ai_generated, veterinary_approved
) VALUES (
  'Gestione Gelosia e Possessività',
  'Tecniche per ridurre comportamenti possessivi verso oggetti, cibo, persone e gestire la gelosia verso altri animali.',
  'sociale',
  'difficile',
  11,
  'Riduzione gelosia e possessività',
  ARRAY['geloso', 'possessivo', 'territoriale', 'protettivo', 'competitivo'],
  ARRAY['Ciotole multiple', 'Giochi personali', 'Guinzaglio lungo', 'Barriere visive'],
  'available',
  true,
  77.3,
  4.0,
  true,
  true
);

-- 6. Miglioramento Disturbi del Sonno
INSERT INTO ai_training_protocols (
  title, description, category, difficulty, duration_days,
  target_behavior, triggers, required_materials, status, is_public,
  success_rate, community_rating, ai_generated, veterinary_approved
) VALUES (
  'Ottimizzazione Ciclo Sonno-Veglia',
  'Routine specifiche per stabilire pattern di sonno salutari e ridurre insonnia, risvegli notturni e irrequietezza.',
  'fisico',
  'facile',
  7,
  'Miglioramento qualità del sonno',
  ARRAY['insonne', 'irrequieto', 'agitato', 'sveglio', 'disturbato'],
  ARRAY['Cuccia comfort', 'Coperta pesata', 'Musica rilassante', 'Routine serale'],
  'available',
  true,
  91.2,
  4.8,
  true,
  false
);

-- 7. Gestione Problemi Alimentari
INSERT INTO ai_training_protocols (
  title, description, category, difficulty, duration_days,
  target_behavior, triggers, required_materials, status, is_public,
  success_rate, community_rating, ai_generated, veterinary_approved
) VALUES (
  'Rieducazione Alimentare Comportamentale',
  'Protocollo per risolvere problemi di alimentazione compulsiva, rifiuto del cibo, guarding alimentare e disturbi del comportamento alimentare.',
  'comportamento',
  'medio',
  9,
  'Normalizzazione comportamento alimentare',
  ARRAY['vorace', 'inappetente', 'schizzinoso', 'protettivo', 'compulsivo'],
  ARRAY['Ciotole puzzle', 'Distributore automatico', 'Tappetino lento', 'Premi graduali'],
  'available',
  true,
  84.7,
  4.4,
  true,
  true
);