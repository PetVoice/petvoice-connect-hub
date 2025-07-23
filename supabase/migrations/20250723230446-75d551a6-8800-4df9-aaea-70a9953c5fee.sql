-- Verifico perché alcuni inserimenti non sono andati a buon fine e li completo

-- ============ ESERCIZI PER "Calmare l'Agitazione" (reinserimento) ============
INSERT INTO public.ai_training_exercises (protocol_id, day_number, title, description, duration_minutes, instructions, materials)
SELECT 
  p.id,
  exercises.day_number,
  exercises.title,
  exercises.description,
  exercises.duration_minutes,
  exercises.instructions,
  exercises.materials
FROM (SELECT id FROM public.ai_training_protocols WHERE target_behavior = 'agitato' LIMIT 1) p
CROSS JOIN (VALUES
  -- Giorno 1
  (1, 'Ambiente di Calma', 'Creazione di uno spazio rilassante', 20, ARRAY['Riduci luci intense', 'Elimina rumori improvvisi'], ARRAY['Musica soft', 'Luci soffuse']),
  (1, 'Respirazione Sincronizzata', 'Tecnica di rilassamento attraverso il respiro', 15, ARRAY['Siediti accanto a lui', 'Respira lentamente'], ARRAY['Cuscino comodo']),
  (1, 'Movimenti Lenti', 'Attività fisica dolce per scaricare tensione', 25, ARRAY['Camminate molto lente', 'Evita stimoli eccessivi'], ARRAY['Guinzaglio morbido']),
  
  -- Giorno 2
  (2, 'Massaggio Calmante', 'Tocco terapeutico per rilassare', 20, ARRAY['Inizia da zone non sensibili', 'Movimenti circolari lenti'], ARRAY['Mani calde']),
  (2, 'Esercizi di Grounding', 'Tecniche per riportare attenzione al presente', 15, ARRAY['Fai annusare oggetti familiari', 'Concentrazione su texture'], ARRAY['Oggetti texture varie']),
  (2, 'Gioco Strutturato', 'Attività controllata per canalizzare energia', 30, ARRAY['Giochi con regole chiare', 'Ritmo lento'], ARRAY['Giocattoli calmi']),
  
  -- Giorno 3  
  (3, 'Training di Autocontrollo', 'Esercizi per gestire impulsi nervosi', 25, ARRAY['Comando aspetta prolungato', 'Incremento graduale'], ARRAY['Timer', 'Snack rilassanti']),
  (3, 'Stimoli Graduati', 'Esposizione controllata a trigger', 20, ARRAY['Introduci stimolo lievemente stressante', 'Distanza di sicurezza'], ARRAY['Trigger controllato']),
  (3, 'Routine Prevedibile', 'Stabilire pattern rassicuranti', 15, ARRAY['Crea sequenza sempre uguale', 'Stessi orari'], ARRAY['Programma fisso']),
  
  -- Giorno 4
  (4, 'Mindfulness Guidata', 'Presenza consapevole per ridurre ansia', 30, ARRAY['Siediti in silenzio insieme', 'Concentrati su suoni ambiente'], ARRAY['Spazio silenzioso']),
  (4, 'Esercizio Mentale Calmo', 'Attività cognitive che non eccitano', 20, ARRAY['Puzzle semplici', 'Ricerca odori nascosti'], ARRAY['Puzzle facili']),
  (4, 'Socializzazione Controllata', 'Incontri calmanti con altri', 25, ARRAY['Solo con animali tranquilli', 'Territorio neutro'], ARRAY['Partner calmo']),
  
  -- Giorno 5
  (5, 'Desensibilizzazione Progressiva', 'Riduzione graduale reattività', 35, ARRAY['Esposizione minima a trigger', 'Associazione con cose positive'], ARRAY['Trigger graduato']),
  (5, 'Attività di Grounding Avanzato', 'Ancoraggio più profondo', 25, ARRAY['Concentrazione su 5 sensi', 'Identificare suoni'], ARRAY['Stimoli sensoriali']),
  (5, 'Training di Rilassamento', 'Insegnare posizioni calme', 20, ARRAY['Comando rilassati + posizione', 'Associa parola a stato calmo'], ARRAY['Comando vocale']),
  
  -- Giorno 6
  (6, 'Test di Resistenza', 'Valutare capacità di mantenere calma', 30, ARRAY['Esposizione controllata a stress', 'Misura durata calma'], ARRAY['Scenario test']),
  (6, 'Autonomia nel Relax', 'Sviluppo di autoregolazione', 25, ARRAY['Riduce supporto umano gradualmente', 'Lascia gestire stress da solo'], ARRAY['Spazio autonomo']),
  (6, 'Consolidamento Tecniche', 'Rinforzo strategie apprese', 20, ARRAY['Ripassa esercizi più efficaci', 'Combina tecniche multiple'], ARRAY['Kit completo']),
  
  -- Giorno 7
  (7, 'Valutazione Finale', 'Misurazione miglioramenti ottenuti', 25, ARRAY['Confronta agitazione iniziale vs finale', 'Testa in situazioni problematiche'], ARRAY['Diario progressi']),
  (7, 'Piano di Mantenimento', 'Strategia per conservare calma', 20, ARRAY['Identifica trigger principali', 'Stabilisci routine anti-agitazione'], ARRAY['Piano scritto']),
  (7, 'Proiezione Futura', 'Preparazione per sfide future', 15, ARRAY['Anticipa situazioni stressanti', 'Prepara strategie specifiche'], ARRAY['Strategia preventiva'])
) AS exercises(day_number, title, description, duration_minutes, instructions, materials)
ON CONFLICT DO NOTHING;