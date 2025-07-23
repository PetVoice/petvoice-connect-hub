-- ============ ESERCIZI PER "Chiarezza Mentale" (5 giorni x 3 = 15 esercizi) ============
INSERT INTO public.ai_training_exercises (protocol_id, day_number, title, description, duration_minutes, instructions, materials)
SELECT 
  p.id,
  exercises.day_number,
  exercises.title,
  exercises.description,
  exercises.duration_minutes,
  exercises.instructions,
  exercises.materials
FROM (SELECT id FROM public.ai_training_protocols WHERE target_behavior = 'confuso' LIMIT 1) p
CROSS JOIN (VALUES
  -- Giorno 1
  (1, 'Orientamento Spaziale', 'Rafforzamento della consapevolezza dello spazio', 20, ARRAY['Cammina sempre negli stessi percorsi', 'Usa punti di riferimento visivi chiari', 'Ripeti la stessa routine di movimento', 'Premia quando si orienta correttamente'], ARRAY['Percorsi marcati', 'Segnali visivi', 'Routine fissa']),
  (1, 'Routine Semplificata', 'Creazione di pattern prevedibili e chiari', 15, ARRAY['Stabilisci orari fissi per tutto', 'Usa sempre gli stessi oggetti', 'Mantieni sequenze identiche', 'Elimina variazioni confondenti'], ARRAY['Orologio', 'Oggetti sempre uguali', 'Schema routine']),
  (1, 'Rinforzo Positivo Immediato', 'Associazioni chiare tra azione e conseguenza', 25, ARRAY['Premia immediatamente comportamenti corretti', 'Usa sempre lo stesso premio', 'Mantieni timing costante', 'Evita rinforzi confusi o ritardati'], ARRAY['Premi identici', 'Timer per tempismo', 'Coerenza assoluta']),
  
  -- Giorno 2
  (2, 'Esercizi di Concentrazione', 'Attività per migliorare focus e attenzione', 25, ARRAY['Attività molto semplici e ripetitive', 'Durata breve ma frequente', 'Elimina tutte le distrazioni', 'Premia attenzione sostenuta'], ARRAY['Ambiente silenzioso', 'Compiti semplici', 'Focus unico']),
  (2, 'Training di Riconoscimento', 'Rafforzamento identificazione oggetti familiari', 20, ARRAY['Mostra sempre gli stessi oggetti', 'Associa nome a oggetto chiaramente', 'Ripeti identificazioni molte volte', 'Premia riconoscimento corretto'], ARRAY['Oggetti familiari', 'Etichette chiare', 'Ripetizione costante']),
  (2, 'Stabilizzazione Emotiva', 'Creazione di stato emotivo calmo e sereno', 15, ARRAY['Mantieni ambiente molto tranquillo', 'Usa voce sempre calma e bassa', 'Evita stimoli emotivi intensi', 'Costruisci sicurezza attraverso prevedibilità'], ARRAY['Ambiente calmo', 'Voce stabile', 'Prevedibilità totale']),
  
  -- Giorno 3
  (3, 'Sequenze Logiche Semplici', 'Training di pensiero sequenziale base', 30, ARRAY['Insegna sequenze di 2-3 passi massimo', 'Ripeti identica sequenza molte volte', 'Guida fisicamente se necessario', 'Celebra completamento sequenza'], ARRAY['Sequenze scritte', 'Guida fisica', 'Celebrazione successi']),
  (3, 'Memoria a Breve Termine', 'Esercizi per rafforzare memoria immediata', 20, ARRAY['Nascondi oggetto e fallo cercare subito', 'Inizia con tempi brevissimi', 'Aumenta tempo molto gradualmente', 'Usa sempre stesso tipo di esercizio'], ARRAY['Oggetti da nascondere', 'Timer brevi', 'Progressione lenta']),
  (3, 'Comunicazione Semplificata', 'Uso di segnali chiari e diretti', 25, ARRAY['Usa solo comandi di una parola', 'Mantieni tono e volume costanti', 'Accompagna con gesti chiari', 'Ripeti fino a comprensione'], ARRAY['Comandi singoli', 'Gesti chiari', 'Pazienza infinita']),
  
  -- Giorno 4
  (4, 'Problem Solving Guidato', 'Risoluzione problemi molto semplici con supporto', 35, ARRAY['Presenta un solo problema per volta', 'Guida passo-passo verso soluzione', 'Non lasciare mai da solo con problema', 'Celebra ogni piccolo progresso'], ARRAY['Problemi elementari', 'Guida costante', 'Supporto totale']),
  (4, 'Rafforzamento Identità', 'Riconoscimento di sé e del proprio ruolo', 25, ARRAY['Usa sempre il suo nome frequentemente', 'Associa nome a cose positive', 'Rinforza relazione con te', 'Crea senso di appartenenza'], ARRAY['Nome ripetuto', 'Associazioni positive', 'Legame affettivo']),
  (4, 'Navigazione Assistita', 'Movimento nello spazio con supporto', 20, ARRAY['Accompagna in tutti i movimenti', 'Usa sempre stessi percorsi', 'Indica direzione fisica se necessario', 'Premia orientamento corretto'], ARRAY['Accompagnamento fisico', 'Percorsi fissi', 'Indicazioni chiare']),
  
  -- Giorno 5
  (5, 'Test di Autonomia Graduale', 'Valutazione capacità senza supporto costante', 30, ARRAY['Riduci supporto molto gradualmente', 'Osserva da distanza senza intervenire', 'Intervieni solo se necessario', 'Documenta livello autonomia raggiunto'], ARRAY['Osservazione discreta', 'Distanza di sicurezza', 'Documentazione progressi']),
  (5, 'Consolidamento Routine', 'Rinforzo di tutte le abitudini acquisite', 25, ARRAY['Ripassa tutte le routine apprese', 'Mantieni coerenza in tutto', 'Celebra padronanza routine', 'Prepara per mantenimento'], ARRAY['Routine complete', 'Coerenza totale', 'Preparazione futuro']),
  (5, 'Pianificazione Mantenimento', 'Strategia per conservare chiarezza ottenuta', 15, ARRAY['Stabilisci routine giornaliera permanente', 'Identifica segnali di confusione', 'Prepara interventi rapidi', 'Mantieni ambiente stabile'], ARRAY['Piano permanente', 'Sistema monitoraggio', 'Ambiente stabile'])
) AS exercises(day_number, title, description, duration_minutes, instructions, materials);