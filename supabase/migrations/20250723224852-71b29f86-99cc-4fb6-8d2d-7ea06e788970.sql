-- Aggiungi i protocolli mancanti per completare tutti i target_behavior

-- Protocollo per PAURA
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
  'Superare la Paura',
  'Protocollo per aiutare il pet a superare le paure attraverso esposizione graduale e rinforzo positivo.',
  'behavioral',
  'intermedio',
  6,
  'pauroso',
  true,
  true,
  true,
  'active',
  '["Guinzaglio lungo", "Premi di alto valore", "Giocattoli rassicuranti"]'::jsonb
);

-- Protocollo per DEPRESSIONE
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
  'Recupero dall''Apatia',
  'Protocollo per stimolare l''interesse e l''energia in pet che mostrano segni di depressione o apatia.',
  'emotional',
  'facile',
  8,
  'depresso',
  true,
  true,
  true,
  'active',
  '["Giocattoli stimolanti", "Snack appetitosi", "Attività all''aperto"]'::jsonb
);

-- Protocollo per AGITAZIONE
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
  'Calmare l''Agitazione',
  'Protocollo per gestire comportamenti agitati e nervosi attraverso tecniche di rilassamento.',
  'behavioral',
  'intermedio',
  7,
  'agitato',
  true,
  true,
  true,
  'active',
  '["Musica rilassante", "Tappetino antistress", "Massaggiatori naturali"]'::jsonb
);

-- Protocollo per IRRITABILITÀ
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
  'Gestire l''Irritabilità',
  'Protocollo per ridurre l''irritabilità e migliorare la tolleranza del pet verso stimoli esterni.',
  'behavioral',
  'avanzato',
  9,
  'irritabile',
  true,
  true,
  true,
  'active',
  '["Barriere visive", "Diffusore di feromoni", "Premi calmanti"]'::jsonb
);

-- Protocollo per CONFUSIONE
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
  'Chiarezza Mentale',
  'Protocollo per aiutare pet confusi a ritrovare orientamento e sicurezza attraverso routine strutturate.',
  'cognitive',
  'facile',
  5,
  'confuso',
  true,
  true,
  true,
  'active',
  '["Routine visiva", "Segnali chiari", "Rinforzi costanti"]'::jsonb
);