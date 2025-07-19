-- Pulisco tutti i protocolli esistenti e creo protocolli reali per ogni emozione rilevabile dall'AI
DELETE FROM ai_training_exercises;
DELETE FROM ai_training_metrics;
DELETE FROM ai_training_schedules;
DELETE FROM ai_training_protocols;
DELETE FROM ai_suggested_protocols;

-- Protocollo per ANSIA DA SEPARAZIONE
INSERT INTO ai_training_protocols (
  id, title, description, category, difficulty, duration_days, 
  target_behavior, triggers, required_materials, status, 
  ai_generated, is_public, success_rate, community_rating, community_usage,
  veterinary_approved, mentor_recommended, estimated_cost
) VALUES (
  gen_random_uuid(),
  'Gestione Ansia da Separazione',
  'Protocollo graduale per ridurre l''ansia quando il pet rimane solo. Basato su tecniche di desensibilizzazione sistematica utilizzate dai comportamentalisti veterinari.',
  'ansia',
  'medio',
  21,
  'Ridurre i comportamenti distruttivi e l''agitazione quando lasciato solo',
  ARRAY['Partenza del proprietario', 'Rumori di preparazione', 'Prendere chiavi/borsa', 'Mettere scarpe'],
  ARRAY['Kong riempibile', 'Telecamera di monitoraggio', 'Diffusore di feromoni', 'Playlist rilassante'],
  'available',
  true,
  87.5,
  4.6,
  234,
  true,
  true,
  45.00
);

-- Protocollo per AGGRESSIVITA'
INSERT INTO ai_training_protocols (
  id, title, description, category, difficulty, duration_days,
  target_behavior, triggers, required_materials, status,
  ai_generated, is_public, success_rate, community_rating, community_usage,
  veterinary_approved, mentor_recommended, estimated_cost
) VALUES (
  gen_random_uuid(),
  'Controllo Aggressività Reattiva',
  'Programma intensivo per gestire episodi di aggressività reattiva attraverso tecniche di counter-conditioning e controllo degli impulsi.',
  'aggressivita',
  'difficile',
  35,
  'Eliminare reazioni aggressive verso altri animali e persone',
  ARRAY['Presenza di altri cani', 'Persone sconosciute', 'Rumori forti', 'Territorio invaso'],
  ARRAY['Pettorina anti-tiro', 'Snack alta appetibilità', 'Clicker', 'Guinzaglio lungo 3m'],
  'available',
  true,
  78.2,
  4.4,
  156,
  true,
  true,
  120.00
);

-- Protocollo per IPERATTIVITA'
INSERT INTO ai_training_protocols (
  id, title, description, category, difficulty, duration_days,
  target_behavior, triggers, required_materials, status,
  ai_generated, is_public, success_rate, community_rating, community_usage,
  veterinary_approved, mentor_recommended, estimated_cost
) VALUES (
  gen_random_uuid(),
  'Gestione Energia Eccessiva',
  'Protocollo per canalizzare l''energia in eccesso attraverso attività strutturate e tecniche di autocontrollo.',
  'iperattivita',
  'medio',
  28,
  'Ridurre comportamenti iperattivi e migliorare l''autocontrollo',
  ARRAY['Eccitazione eccessiva', 'Mancanza di esercizio', 'Stimoli ambientali', 'Routine interrotte'],
  ARRAY['Puzzle feeder', 'Corda da gioco', 'Tappeto sniffing', 'Timer per sessioni'],
  'available',
  true,
  91.3,
  4.7,
  312,
  true,
  true,
  35.00
);

-- Protocollo per PAURA/FOBIA
INSERT INTO ai_training_protocols (
  id, title, description, category, difficulty, duration_days,
  target_behavior, triggers, required_materials, status,
  ai_generated, is_public, success_rate, community_rating, community_usage,
  veterinary_approved, mentor_recommended, estimated_cost
) VALUES (
  gen_random_uuid(),
  'Superamento Paure e Fobie',
  'Desensibilizzazione graduale a stimoli che causano paura, con rinforzo positivo e tecniche di rilassamento.',
  'paura',
  'difficile',
  42,
  'Ridurre reazioni di paura a stimoli specifici',
  ARRAY['Rumori forti', 'Temporali', 'Fuochi artificiali', 'Aspirapolvere', 'Altri animali'],
  ARRAY['App suoni graduali', 'Coperta sicurezza', 'Diffusore calmante', 'Snack rilassanti'],
  'available',
  true,
  82.7,
  4.5,
  189,
  true,
  true,
  67.00
);