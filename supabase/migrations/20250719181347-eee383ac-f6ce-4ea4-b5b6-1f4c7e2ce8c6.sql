-- Ultimi due protocolli con esercizi

-- PROTOCOLLO 6: Ottimizzazione Ciclo Sonno-Veglia (7 giorni)
INSERT INTO ai_training_exercises (protocol_id, day_number, title, description, exercise_type, duration_minutes, instructions, materials)
SELECT p.id, exercises.day_num, exercises.title, exercises.description, 'physical', exercises.duration, exercises.instructions::text[], exercises.materials::text[]
FROM ai_training_protocols p,
(VALUES
  (1, 'Analisi Pattern Sonno Attuale', 'Documentare abitudini di sonno esistenti', 15,
   ARRAY['Osservare orari di sonno naturali', 'Annotare disturbi e risvegli', 'Identificare fattori disturbanti', 'Non modificare routine esistente'],
   ARRAY['Diario sonno', 'Cronometro']),
  (2, 'Creazione Ambiente Sonno Ottimale', 'Allestire spazio dedicato al riposo', 20,
   ARRAY['Zona tranquilla e buia', 'Temperatura confortevole', 'Rimuovere distrazioni', 'Aggiungere comfort (coperte, cuscini)'],
   ARRAY['Cuccia comfort', 'Coperte', 'Controllo illuminazione']),
  (3, 'Routine Serale Rilassante', 'Stabilire rituali pre-sonno', 30,
   ARRAY['Attività calmanti 1 ora prima', 'Ridurre stimolazione gradualmente', 'Musica rilassante o suoni della natura', 'Evitare giochi eccitanti'],
   ARRAY['Musica rilassante', 'Routine scritta']),
  (4, 'Controllo Attività Diurna', 'Ottimizzare energia durante il giorno', 25,
   ARRAY['Esercizio fisico al mattino', 'Stimolazione mentale pomeridiana', 'Evitare attività intense sera', 'Bilanciare attività e riposo'],
   ARRAY['Programma attività', 'Giochi vari']),
  (5, 'Gestione Risvegli Notturni', 'Strategie per minimizzare interruzioni', 20,
   ARRAY['Non dare attenzione per risvegli', 'Mantenere ambiente calmo e buio', 'Evitare stimolazione se si sveglia', 'Incoraggiare ritorno autonomo al sonno'],
   ARRAY['Piano gestione notturna']),
  (6, 'Consolidamento Routine', 'Stabilizzare pattern di sonno migliorato', 25,
   ARRAY['Mantenere orari fissi', 'Ripetere routine serale identica', 'Monitorare miglioramenti', 'Adattare se necessario'],
   ARRAY['Programma fisso', 'Monitoraggio progressi']),
  (7, 'Valutazione e Mantenimento', 'Consolidare abitudini di sonno salutari', 15,
   ARRAY['Confrontare con analisi iniziale', 'Identificare strategie più efficaci', 'Creare piano mantenimento', 'Celebrare miglioramenti'],
   ARRAY['Confronto dati', 'Piano lungo termine'])
) AS exercises(day_num, title, description, duration, instructions, materials)
WHERE p.title = 'Ottimizzazione Ciclo Sonno-Veglia';

-- PROTOCOLLO 7: Rieducazione Alimentare Comportamentale (9 giorni)
INSERT INTO ai_training_exercises (protocol_id, day_number, title, description, exercise_type, duration_minutes, instructions, materials)
SELECT p.id, exercises.day_num, exercises.title, exercises.description, 'behavioral', exercises.duration, exercises.instructions::text[], exercises.materials::text[]
FROM ai_training_protocols p,
(VALUES
  (1, 'Valutazione Comportamento Alimentare', 'Analizzare abitudini e problemi attuali', 30,
   ARRAY['Osservare velocità di consumo', 'Testare reazioni a diversi cibi', 'Identificare comportamenti problematici', 'Misurare quantità consumate'],
   ARRAY['Cronometro', 'Bilancia cibo', 'Quaderno osservazioni']),
  (2, 'Introduzione Ciotole Puzzle', 'Rallentare velocità di consumo', 20,
   ARRAY['Sostituire ciotola normale con puzzle feeder', 'Iniziare con puzzle semplici', 'Supervisionare primi utilizzi', 'Premiare pazienza'],
   ARRAY['Puzzle feeder', 'Ciotole speciali']),
  (3, 'Controllo Porzioni e Orari', 'Stabilire routine alimentare strutturata', 25,
   ARRAY['Pasti a orari fissi', 'Porzioni misurate precise', 'Rimuovere cibo non consumato dopo 20 min', 'Non lasciare cibo sempre disponibile'],
   ARRAY['Dosatore porzioni', 'Timer', 'Programma pasti']),
  (4, 'Desensibilizzazione Protezione Cibo', 'Ridurre aggressività alimentare', 35,
   ARRAY['Avvicinarsi gradualmente durante pasto', 'Aggiungere premi mentre mangia', 'Non togliere mai cibo durante esercizio', 'Associare presenza umana a cose positive'],
   ARRAY['Premi speciali', 'Approccio graduale']),
  (5, 'Stimolazione Appetito Selettivo', 'Aumentare interesse per cibi rifiutati', 20,
   ARRAY['Mescolare cibi graditi con meno graditi', 'Iniziare con proporzioni minime', 'Non forzare consumo', 'Premiare ogni assaggio'],
   ARRAY['Varietà cibi', 'Miscelazione graduata']),
  (6, 'Controllo Impulsi Alimentari', 'Insegnare autocontrollo con cibo', 25,
   ARRAY['Comando "aspetta" prima di mangiare', 'Aumentare gradualmente tempo attesa', 'Premiare pazienza', 'Non cedere a insistenza'],
   ARRAY['Comandi di controllo', 'Premi per pazienza']),
  (7, 'Socializzazione Durante Pasti', 'Gestire comportamento alimentare in gruppo', 30,
   ARRAY['Pasti separati inizialmente', 'Avvicinare gradualmente', 'Supervisionare sempre', 'Prevenire competizione'],
   ARRAY['Ciotole multiple', 'Spazi separati']),
  (8, 'Gestione Snack e Premi', 'Integrare premi nella dieta bilanciata', 15,
   ARRAY['Calcolare premi nel totale calorico', 'Usare parte della razione normale come premio', 'Evitare overfeeding', 'Mantenere valore nutrizionale'],
   ARRAY['Calcolatore calorie', 'Premi salutari']),
  (9, 'Consolidamento Abitudini Salutari', 'Stabilizzare comportamenti alimentari corretti', 20,
   ARRAY['Mantenere routine stabilita', 'Monitorare peso corporeo', 'Adattare se necessario', 'Celebrare miglioramenti comportamentali'],
   ARRAY['Bilancia', 'Routine consolidata', 'Piano mantenimento'])
) AS exercises(day_num, title, description, duration, instructions, materials)
WHERE p.title = 'Rieducazione Alimentare Comportamentale';