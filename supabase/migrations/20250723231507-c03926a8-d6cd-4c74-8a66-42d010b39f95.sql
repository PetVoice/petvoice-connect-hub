-- COMPLETAMENTO FINALE DI TUTTI I PROTOCOLLI

-- CONTROLLO DELL'AGGRESSIVITÀ - Ultimi 5 esercizi mancanti
INSERT INTO public.ai_training_exercises (protocol_id, day_number, title, description, duration_minutes, exercise_type, instructions, materials, completed)
SELECT 
  (SELECT id FROM public.ai_training_protocols WHERE target_behavior = 'aggressivo' LIMIT 1),
  day_number, title, description, duration_minutes, 'behavioral', instructions, materials, false
FROM (VALUES
  (1, 'Assessment Iniziale Aggressività', 'Valutazione livello e trigger iniziali', 30, ARRAY['Identifica tutti trigger attuali', 'Valuta intensità reazioni', 'Documenta comportamenti specifici', 'Stabilisci baseline sicurezza'], ARRAY['Questionario assessment', 'Video registrazione', 'Scala intensità']),
  (1, 'Stabilimento Controllo Ambiente', 'Creazione zona sicura per training', 25, ARRAY['Elimina tutti trigger dalla zona training', 'Stabilisci regole chiare spazio', 'Crea protocolli sicurezza', 'Test ambiente controllato'], ARRAY['Barriere fisiche', 'Zona neutra', 'Kit sicurezza']),
  (3, 'Desensibilizzazione Sistematica', 'Riduzione graduale reattività', 40, ARRAY['Esposizione micro-dosata trigger', 'Monitoraggio costante stress', 'Incrementi minimali intensità', 'Stop immediato se escalation'], ARRAY['Trigger graduabili', 'Monitor stress', 'Piano sicurezza']),
  (4, 'Rinforzo Positivo Intensivo', 'Costruzione associazioni positive', 35, ARRAY['Associa trigger con premi massimi', 'Timing perfetto rinforzi', 'Varietà premi altissimi', 'Sessioni brevi frequenti'], ARRAY['Premi eccezionali', 'Timing preciso', 'Varietà motivatori']),
  (5, 'Generalizzazione Contesti', 'Estensione controllo a situazioni nuove', 45, ARRAY['Test controllo ambienti diversi', 'Graduale aumento complessità', 'Mantenimento controllo', 'Adattamento strategie'], ARRAY['Ambienti multipli', 'Test progressivi', 'Kit portatile'])
) AS exercises(day_number, title, description, duration_minutes, instructions, materials);

-- GESTIONE DELL'ANSIA - Ultimi 6 esercizi mancanti
INSERT INTO public.ai_training_exercises (protocol_id, day_number, title, description, duration_minutes, exercise_type, instructions, materials, completed)
SELECT 
  (SELECT id FROM public.ai_training_protocols WHERE target_behavior = 'ansioso' LIMIT 1),
  day_number, title, description, duration_minutes, 'behavioral', instructions, materials, false
FROM (VALUES
  (1, 'Assessment Livelli Ansia', 'Valutazione iniziale stati ansiosi', 25, ARRAY['Identifica trigger ansia specifici', 'Misura intensità reazioni', 'Documenta sintomi fisici', 'Stabilisci baseline'], ARRAY['Scala ansia', 'Checklist sintomi', 'Diario osservazioni']),
  (1, 'Creazione Ambiente Sicuro', 'Setup spazio anti-ansia', 20, ARRAY['Elimina tutti stressor ambientali', 'Luci soffuse costanti', 'Suoni calmanti', 'Temperatura ideale'], ARRAY['Controllo luci', 'Musica rilassante', 'Comfort items']),
  (6, 'Tecniche Grounding Avanzate', 'Ancoraggio al presente durante ansia', 30, ARRAY['Esercizi 5-4-3-2-1 sensoriali', 'Focus su sensazioni fisiche positive', 'Respirazione con conta', 'Mantra calmanti'], ARRAY['Lista sensoriale', 'Oggetti tattili', 'Mantra personalizzati']),
  (6, 'Gestione Attacchi Ansia', 'Protocollo per episodi acuti', 35, ARRAY['Riconoscimento precoce escalation', 'Intervento immediato', 'Tecniche de-escalation', 'Recovery guidato'], ARRAY['Piano emergenza', 'Kit intervento rapido', 'Protocollo step-by-step']),
  (7, 'Costruzione Resilienza', 'Rafforzamento capacità adattive', 40, ARRAY['Esposizione graduale controllata', 'Costruzione fiducia', 'Celebrazione piccoli successi', 'Rinforzo competenze'], ARRAY['Sfide graduate', 'Sistema tracking', 'Premi significativi']),
  (7, 'Piano Prevenzione Ricadute', 'Strategia mantenimento lungo termine', 30, ARRAY['Identificazione trigger residui', 'Piano intervento precoce', 'Routine mantenimento', 'Network supporto'], ARRAY['Piano emergenza', 'Calendario routine', 'Contatti supporto'])
) AS exercises(day_number, title, description, duration_minutes, instructions, materials);

-- RIDUZIONE DELLO STRESS - Ultimi 6 esercizi mancanti  
INSERT INTO public.ai_training_exercises (protocol_id, day_number, title, description, duration_minutes, exercise_type, instructions, materials, completed)
SELECT 
  (SELECT id FROM public.ai_training_protocols WHERE target_behavior = 'stressato' LIMIT 1),
  day_number, title, description, duration_minutes, 'behavioral', instructions, materials, false
FROM (VALUES
  (1, 'Valutazione Stress Baseline', 'Assessment iniziale livelli stress', 30, ARRAY['Identifica tutti stressor attuali', 'Misura intensità stress', 'Documenta sintomi fisici', 'Crea mappa stress'], ARRAY['Scala stress', 'Questionario completo', 'Monitor fisici']),
  (2, 'Eliminazione Stressor Primari', 'Rimozione cause principali stress', 35, ARRAY['Identifica stressor modificabili', 'Elimina o riduci esposizione', 'Crea alternative positive', 'Monitor miglioramenti'], ARRAY['Lista stressor', 'Piano modifiche', 'Alternative positive']),
  (3, 'Introduzione Stimoli Positivi', 'Aggiunta elementi anti-stress', 25, ARRAY['Musica terapeutica specifica', 'Aromi rilassanti sicuri', 'Tessuti comfort', 'Illuminazione ottimale'], ARRAY['Playlist terapeutica', 'Diffusori sicuri', 'Materiali comfort']),
  (4, 'Tecniche Rilassamento Muscolare', 'Riduzione tensione fisica', 40, ARRAY['Rilassamento progressivo guidato', 'Massaggio terapeutico dolce', 'Stretching assistito', 'Controllo postura'], ARRAY['Guida rilassamento', 'Tecniche massaggio', 'Supporti posturali']),
  (5, 'Mindfulness Applicata', 'Presenza consapevole anti-stress', 30, ARRAY['Esercizi attenzione presente', 'Focus su sensazioni positive', 'Interruzione pensieri stressanti', 'Pratica costante'], ARRAY['Guida mindfulness', 'Timer sessioni', 'Oggetti focus']),
  (6, 'Costruzione Tolleranza Stress', 'Aumento capacità gestione', 35, ARRAY['Esposizione micro-stress controllata', 'Tecniche coping immediate', 'Rafforzamento resilienza', 'Recovery rapido'], ARRAY['Micro-stressor', 'Kit coping', 'Plan recovery'])
) AS exercises(day_number, title, description, duration_minutes, instructions, materials);