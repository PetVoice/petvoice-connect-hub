-- Inserimento dei protocolli di allenamento per le emozioni negative
-- Ogni protocollo ha 3 esercizi al giorno per gestire specifiche emozioni negative

-- Protocollo per ANSIA
INSERT INTO public.ai_training_protocols (
  id,
  title,
  description,
  category,
  difficulty,
  duration_days,
  target_behavior,
  is_public,
  ai_generated,
  veterinary_approved,
  status,
  required_materials
) VALUES (
  gen_random_uuid(),
  'Gestione dell''Ansia',
  'Protocollo specializzato per ridurre i livelli di ansia nel pet attraverso tecniche di rilassamento e desensibilizzazione graduale.',
  'behavioral',
  'facile',
  7,
  'ansioso',
  true,
  true,
  true,
  'active',
  '["Giocattolo da masticare", "Coperta morbida", "Snack rilassanti"]'::jsonb
);

-- Protocollo per AGGRESSIVITÀ  
INSERT INTO public.ai_training_protocols (
  id,
  title,
  description,
  category,
  difficulty,
  duration_days,
  target_behavior,
  is_public,
  ai_generated,
  veterinary_approved,
  status,
  required_materials
) VALUES (
  gen_random_uuid(),
  'Controllo dell''Aggressività',
  'Protocollo per ridurre comportamenti aggressivi attraverso tecniche di autocontrollo e redirezione positiva.',
  'behavioral',
  'intermedio',
  10,
  'aggressivo',
  true,
  true,
  true,
  'active',
  '["Giocattoli da Kong", "Barriera di sicurezza", "Premi ad alto valore"]'::jsonb
);

-- Protocollo per TRISTEZZA
INSERT INTO public.ai_training_protocols (
  id,
  title,
  description,
  category,
  difficulty,
  duration_days,
  target_behavior,
  is_public,
  ai_generated,
  veterinary_approved,
  status,
  required_materials
) VALUES (
  gen_random_uuid(),
  'Superare la Tristezza',
  'Protocollo per stimolare l''umore e aumentare l''energia del pet attraverso attività coinvolgenti e socializzazione.',
  'emotional',
  'facile',
  5,
  'triste',
  true,
  true,
  true,
  'active',
  '["Giocattoli interattivi", "Palla da tennis", "Snack motivazionali"]'::jsonb
);

-- Protocollo per STRESS
INSERT INTO public.ai_training_protocols (
  id,
  title,
  description,
  category,
  difficulty,
  duration_days,
  target_behavior,
  is_public,
  ai_generated,
  veterinary_approved,
  status,
  required_materials
) VALUES (
  gen_random_uuid(),
  'Riduzione dello Stress',
  'Protocollo per creare un ambiente calmo e routines rilassanti che riducano i fattori di stress.',
  'environmental',
  'facile',
  7,
  'stressato',
  true,
  true,
  true,
  'active',
  '["Musica rilassante", "Feromoni calmanti", "Zona comfort dedicata"]'::jsonb
);

-- Protocollo per IPERATTIVITÀ
INSERT INTO public.ai_training_protocols (
  id,
  title,
  description,
  category,
  difficulty,
  duration_days,
  target_behavior,
  is_public,
  ai_generated,
  veterinary_approved,
  status,
  required_materials
) VALUES (
  gen_random_uuid(),
  'Controllo dell''Iperattività',
  'Protocollo per canalizzare l''energia eccessiva attraverso esercizi mirati e tecniche di autocontrollo.',
  'physical',
  'intermedio',
  8,
  'iperattivo',
  true,
  true,
  true,
  'active',
  '["Ostacoli per agility", "Corda da trainare", "Puzzle alimentari"]'::jsonb
);