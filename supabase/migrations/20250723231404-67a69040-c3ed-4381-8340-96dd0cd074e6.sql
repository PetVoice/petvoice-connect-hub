-- Completa TUTTI i protocolli rimanenti con esercizi

-- CONTROLLO DELL'AGGRESSIVITÀ - Giorni 6-10 (15 esercizi rimanenti)
INSERT INTO public.ai_training_exercises (protocol_id, day_number, title, description, duration_minutes, exercise_type, instructions, materials, completed)
SELECT 
  (SELECT id FROM public.ai_training_protocols WHERE target_behavior = 'aggressivo' LIMIT 1),
  day_number, title, description, duration_minutes, 'behavioral', instructions, materials, false
FROM (VALUES
  (6, 'Gestione Frustrazione', 'Tecniche per prevenire escalation emotiva', 30, ARRAY['Riconosci primi segnali', 'Intervieni immediatamente', 'Redirezione positiva', 'Premi autocontrollo'], ARRAY['Giochi distrazione', 'Snack calmanti']),
  (6, 'Training Avanzato Impulsi', 'Controllo avanzato reazioni istintive', 35, ARRAY['Situazioni più complesse', 'Tempi attesa maggiori', 'Resistenza tentazioni forti'], ARRAY['Trigger multipli', 'Timer']),
  (6, 'Valutazione Intermedia', 'Controllo progressi raggiunti', 25, ARRAY['Test situazioni precedenti', 'Misura miglioramenti', 'Documenta progressi'], ARRAY['Checklist progressi', 'Video recording']),
  (7, 'Integrazione Sociale Sicura', 'Interazioni controllate con altri', 40, ARRAY['Introduzione graduale altri cani', 'Supervisione costante', 'Premi interazioni positive'], ARRAY['Partner sicuri', 'Ambiente neutro']),
  (7, 'Gestione Territorio', 'Riduzione aggressività territoriale', 30, ARRAY['Definisci confini chiari', 'Gestisci accessi', 'Premi comportamento condiviso'], ARRAY['Barriere visive', 'Zona neutra']),
  (7, 'Comando Emergenza', 'Controllo assoluto in crisi', 20, ARRAY['Comando stop definitivo', 'Richiamo immediato', 'Pratica emergenze simulate'], ARRAY['Comando univoco', 'Premi altissimi']),
  (8, 'Test Stress Controllato', 'Valutazione sotto pressione', 45, ARRAY['Simula situazioni difficili', 'Mantieni controllo', 'Intervieni se necessario'], ARRAY['Situazioni test', 'Piano sicurezza']),
  (8, 'Consolidamento Gains', 'Rafforzamento progressi ottenuti', 30, ARRAY['Ripeti esercizi migliori', 'Rinforza comportamenti positivi', 'Elimina supporti graduali'], ARRAY['Routine consolidate', 'Rinforzi intermittenti']),
  (8, 'Pianificazione Mantenimento', 'Strategia lungo termine', 25, ARRAY['Identifica trigger residui', 'Piano esercizi quotidiani', 'Controlli periodici'], ARRAY['Calendario mantenimento', 'Checklist quotidiana']),
  (9, 'Simulazione Vita Reale', 'Test in condizioni naturali', 50, ARRAY['Passeggiate in zone trafficate', 'Incontri casuali', 'Gestione imprevisti'], ARRAY['Guinzaglio sicuro', 'Kit emergenza']),
  (9, 'Autonomia Guidata', 'Riduzione supervisione diretta', 35, ARRAY['Aumenta distanza controllo', 'Fidati delle competenze acquisite', 'Intervieni solo se necessario'], ARRAY['Controllo remoto', 'Rinforzi occasionali']),
  (9, 'Valutazione Pre-Conclusione', 'Assessment finale preparatorio', 30, ARRAY['Test completo competenze', 'Identifica aree residue', 'Prepara fase finale'], ARRAY['Test standardizzati', 'Griglia valutazione']),
  (10, 'Certificazione Progressi', 'Validazione risultati ottenuti', 40, ARRAY['Documenta tutti miglioramenti', 'Celebra successi', 'Crea certificato simbolico'], ARRAY['Documentazione completa', 'Diploma simbolico']),
  (10, 'Piano Post-Training', 'Mantenimento a lungo termine', 35, ARRAY['Routine settimanali minime', 'Controlli mensili', 'Piani contingenza'], ARRAY['Calendario long-term', 'Contatti emergenza']),
  (10, 'Celebrazione Finale', 'Riconoscimento traguardi raggiunti', 30, ARRAY['Attività speciale gradita', 'Premi simbolici importanti', 'Foto ricordo'], ARRAY['Attività preferita', 'Premi speciali', 'Camera'])
) AS exercises(day_number, title, description, duration_minutes, instructions, materials);

-- CONTROLLO DELL'IPERATTIVITÀ - Giorni 3-8 (18 esercizi rimanenti)  
INSERT INTO public.ai_training_exercises (protocol_id, day_number, title, description, duration_minutes, exercise_type, instructions, materials, completed)
SELECT 
  (SELECT id FROM public.ai_training_protocols WHERE target_behavior = 'iperattivo' LIMIT 1),
  day_number, title, description, duration_minutes, 'physical', instructions, materials, false
FROM (VALUES
  (3, 'Mental Stimulation Intensiva', 'Esercizi mentali per stancare la mente', 30, ARRAY['Puzzle food complessi', 'Giochi problem-solving', 'Nascondere snack casa'], ARRAY['Puzzle feeder', 'Giochi intelligenza', 'Snack nascosti']),
  (3, 'Impulse Control Avanzato', 'Autocontrollo in situazioni eccitanti', 25, ARRAY['Aspettare prima giochi preferiti', 'Calma prima uscite', 'Controllo durante pasti'], ARRAY['Giochi preferiti', 'Guinzaglio', 'Ciotole']),
  (3, 'Rilassamento Forzato', 'Periodi obbligatori di calma', 20, ARRAY['Comando "posto" prolungato', 'Resta su tappetino', 'Ignorare stimoli esterni'], ARRAY['Tappetino specifico', 'Timer', 'Ambiente controllato']),
  (4, 'Esercizio Estremo Controllato', 'Massimo dispendio energetico sicuro', 60, ARRAY['Corsa lunga supervisionata', 'Giochi intensi ripetuti', 'Monitoraggio costante'], ARRAY['Percorso sicuro', 'Acqua abbondante', 'Monitoraggio cardiaco']),
  (4, 'Focus Training Intensivo', 'Concentrazione massima possibile', 35, ARRAY['Esercizi attenzione prolungati', 'Resistenza distrazioni forti', 'Premi solo performance perfette'], ARRAY['Distrazioni controllate', 'Premi altissimi', 'Ambiente sfidante']),
  (4, 'Pausa Obbligatoria', 'Rest forzato per recupero', 45, ARRAY['Riposo completo supervisionato', 'Nessuna stimolazione', 'Recupero energie'], ARRAY['Zona riposo isolata', 'Comfort massimo', 'Silenzio totale']),
  (5, 'Routine Energetica Strutturata', 'Programma giornaliero fisso', 40, ARRAY['Orari fissi attività', 'Sequenze prevedibili', 'Alternanza lavoro-riposo'], ARRAY['Calendario dettagliato', 'Timer multipli', 'Checklist attività']),
  (5, 'Autoregolazione Guidata', 'Imparare a gestirsi autonomamente', 30, ARRAY['Riconoscere propri limiti', 'Autoselezionare attività', 'Richiedere pause'], ARRAY['Opzioni multiple', 'Segnali comunicazione', 'Zona riposo disponibile']),
  (5, 'Test Controllo Impulsi', 'Valutazione progressi autocontrollo', 25, ARRAY['Situazioni tentazione multiple', 'Valutare resistenza', 'Misurare miglioramenti'], ARRAY['Test standardizzati', 'Tentazioni varie', 'Griglia valutazione']),
  (6, 'Integrazione Sociale Energetica', 'Interazioni con pari energia', 45, ARRAY['Giochi con altri attivi', 'Gestione eccitazione gruppo', 'Controllo in contesti sociali'], ARRAY['Partner compatibili', 'Spazio ampio sicuro', 'Supervisione multipla']),
  (6, 'Canalizzazione Energia Produttiva', 'Usare energia per scopi utili', 35, ARRAY['Attività lavorative semplici', 'Compiti con scopo', 'Soddisfazione produttiva'], ARRAY['Compiti appropriati', 'Obiettivi chiari', 'Rinforzi significativi']),
  (6, 'Valutazione Intermedia Energia', 'Controllo gestione energia', 30, ARRAY['Misura livelli energetici', 'Valuta strategie efficaci', 'Aggiusta programma'], ARRAY['Scala valutazione', 'Dati precedenti', 'Piano aggiustamenti']),
  (7, 'Sfide Mentali Complesse', 'Problem solving avanzato', 40, ARRAY['Puzzle multi-step', 'Problemi creativi', 'Soluzioni innovative'], ARRAY['Puzzle avanzati', 'Materiali creativi', 'Tempo illimitato']),
  (7, 'Controllo Finale Impulsi', 'Test definitivo autocontrollo', 35, ARRAY['Situazioni massima tentazione', 'Test resistenza limiti', 'Valutazione maturità'], ARRAY['Test estremi', 'Sicurezza massima', 'Documentazione completa']),
  (7, 'Pianificazione Energia Futura', 'Strategia mantenimento lungo termine', 25, ARRAY['Routine ottimali identificate', 'Piano settimanale sostenibile', 'Strategie contingenza'], ARRAY['Piano dettagliato', 'Calendario lungo termine', 'Opzioni backup']),
  (8, 'Autonomia Energetica', 'Gestione indipendente energia', 50, ARRAY['Autogestione completa', 'Decisioni energetiche proprie', 'Supervisione minima'], ARRAY['Opzioni multiple', 'Feedback system', 'Controllo remoto']),
  (8, 'Celebrazione Successi Energetici', 'Riconoscimento progressi', 30, ARRAY['Documentare miglioramenti', 'Celebrare controllo acquisito', 'Preparare transizione'], ARRAY['Documentazione progressi', 'Celebrazione speciale', 'Piani futuri']),
  (8, 'Transizione Vita Normale', 'Integrazione nella routine familiare', 45, ARRAY['Riduzione programma intensivo', 'Integrazione routine normali', 'Mantenimento senza stress'], ARRAY['Routine familiari', 'Piano riduzione graduale', 'Supporto continuo'])
) AS exercises(day_number, title, description, duration_minutes, instructions, materials);

-- RIDUZIONE DELLO STRESS - Giorni 5-7 (9 esercizi rimanenti)
INSERT INTO public.ai_training_exercises (protocol_id, day_number, title, description, duration_minutes, exercise_type, instructions, materials, completed)
SELECT 
  (SELECT id FROM public.ai_training_protocols WHERE target_behavior = 'stressato' LIMIT 1),
  day_number, title, description, duration_minutes, 'behavioral', instructions, materials, false
FROM (VALUES
  (5, 'Tecniche Respirazione Avanzate', 'Controllo respiratorio per calma profonda', 25, ARRAY['Respirazione 4-7-8 sincronizzata', 'Controllo ritmo cardiaco', 'Stato meditativo insieme'], ARRAY['Ambiente silenzioso', 'Comfortable seating', 'Timer']),
  (5, 'Desensibilizzazione Trigger', 'Riduzione reattività a stress comuni', 35, ARRAY['Esposizione graduale controllata', 'Associazione con positivo', 'Costruzione tolleranza'], ARRAY['Trigger graduali', 'Premi eccellenti', 'Ambiente sicuro']),
  (5, 'Costruzione Resilienza', 'Rafforzamento capacità adattamento', 30, ARRAY['Sfide progressive gestibili', 'Supporto costante', 'Celebrazione successi'], ARRAY['Sfide graduate', 'Sistema supporto', 'Rinforzi positivi']),
  (6, 'Gestione Ansia Anticipatoria', 'Controllo stress da aspettativa', 40, ARRAY['Riconoscimento segnali precoci', 'Intervento preventivo', 'Tecniche distrazione'], ARRAY['Lista segnali', 'Strategie intervento', 'Attività distrazione']),
  (6, 'Rilassamento Profondo Guidato', 'Stati profondi di calma', 45, ARRAY['Rilassamento muscolare progressivo', 'Visualizzazione guidata', 'Stato alpha insieme'], ARRAY['Musica specifica', 'Guida vocale', 'Ambiente ottimale']),
  (6, 'Test Resilienza Stress', 'Valutazione capacità gestione', 30, ARRAY['Esposizione stress controllato', 'Misurazione reazioni', 'Valutazione recovery'], ARRAY['Test standardizzati', 'Misurazione stress', 'Recovery tracking']),
  (7, 'Integrazione Strategie Apprese', 'Consolidamento tecniche efficaci', 35, ARRAY['Review strategie migliori', 'Pratica integrata', 'Personalizzazione approccio'], ARRAY['Toolkit personale', 'Strategie favorite', 'Piano personalizzato']),
  (7, 'Pianificazione Mantenimento', 'Strategia prevenzione lungo termine', 25, ARRAY['Routine anti-stress quotidiane', 'Piano emergenze', 'Controlli periodici'], ARRAY['Calendario routine', 'Piano crisi', 'Schedule controlli']),
  (7, 'Celebrazione Trasformazione', 'Riconoscimento cambiamento ottenuto', 40, ARRAY['Documentazione before/after', 'Celebrazione speciale', 'Commitment futuro'], ARRAY['Documentazione completa', 'Celebrazione significativa', 'Contratto mantenimento'])
) AS exercises(day_number, title, description, duration_minutes, instructions, materials);