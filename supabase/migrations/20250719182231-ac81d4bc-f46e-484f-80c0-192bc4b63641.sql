-- Esercizi per "Controllo Aggressività Reattiva" (7 giorni)
WITH protocol_id AS (
  SELECT id FROM ai_training_protocols WHERE title = 'Controllo Aggressività Reattiva'
)
INSERT INTO ai_training_exercises (protocol_id, day_number, title, description, instructions, duration_minutes, materials)
SELECT 
  protocol_id.id,
  day_number,
  title,
  description,
  instructions,
  duration_minutes,
  materials
FROM protocol_id,
(VALUES
  (1, 'Identificazione Trigger di Aggressività', 'Mappare le situazioni specifiche che scatenano reazioni aggressive', ARRAY['Osserva il pet per tutto il giorno e annota ogni episodio di ringhio, tensione o aggressività', 'Nota il contesto: presenza di altri animali, rumori forti, persone sconosciute, cibo', 'Registra l''intensità su scala 1-10', 'Identifica i primi segnali di allerta: orecchie dritte, corpo rigido, fissare intensamente', 'Non intervenire oggi, solo osserva e documenta'], 30, ARRAY['Diario comportamentale', 'Penna', 'Telefono per video']),
  
  (2, 'Comando "GUARDA" di Base', 'Insegnare al pet a focalizzare l''attenzione su di te invece che sul trigger', ARRAY['In ambiente calmo, tieni un premio vicino al tuo viso', 'Quando il pet ti guarda negli occhi, di "GUARDA" e premia immediatamente', 'Ripeti 10 volte con pause', 'Aumenta gradualmente la distanza del premio dal viso', 'L''obiettivo è che risponda al comando "GUARDA" senza premio visibile', 'Sessioni da 5 minuti, 3 volte al giorno'], 25, ARRAY['Piccoli premi molto appetitosi', 'Ambiente silenzioso', 'Pazienza']),
  
  (3, 'Desensibilizzazione a Distanza', 'Esporre il pet ai trigger a distanza sicura per ridurre reattività', ARRAY['Identifica il trigger principale dal giorno 1', 'Posizionati a distanza dove il pet nota il trigger ma NON reagisce aggressivamente', 'Usa il comando "GUARDA" e premia quando risponde', 'Se reagisce aggressivamente, sei troppo vicino - aumenta distanza', 'Sessioni di 10 minuti, avvicinati di 1 metro solo se rimane calmo', 'Mai forzare, rispetta i suoi tempi'], 35, ARRAY['Guinzaglio lungo', 'Premi di alto valore', 'Assistente per gestire il trigger']),
  
  (4, 'Comando "LASCIA" per Ridirizzionamento', 'Insegnare a disimpegnarsi dai trigger su comando', ARRAY['Mostra un giocattolo interessante al pet', 'Quando lo afferra, di "LASCIA" con voce calma', 'Non tirare, aspetta che lo molli spontaneamente', 'Appena lascia, premia immediatamente e restituisci il gioco', 'Ripeti fino a che risponde subito al comando', 'Poi prova con situazioni più stimolanti'], 30, ARRAY['Giocattoli di valore medio', 'Premi speciali', 'Pazienza infinita']),
  
  (5, 'Gestione dell''Arousal Emotivo', 'Tecniche per calmare il pet quando è sovraeccitato', ARRAY['Quando il pet è agitato ma non aggressivo, pratica respiri profondi tu stesso', 'Usa voce molto bassa e lenta, evita comandi energici', 'Chiedi movimenti lenti: "seduto" con gesto, "terra" dolcemente', 'Massaggia delicatamente il petto se il pet lo permette', 'Se è troppo agitato, allontanalo dal trigger senza drammi', 'Premia ogni momento di calma, anche brevissimo'], 40, ARRAY['Voce calma', 'Spazio tranquillo per ritirarsi', 'Premi calmanti (non eccitanti)']),
  
  (6, 'Rienforzo Positivo Avanzato', 'Premiare comportamenti alternativi desiderabili in presenza di trigger', ARRAY['Esponi il pet al trigger a distanza sicura', 'Quando guarda il trigger ma rimane calmo, premia subito', 'Se fa il comando "GUARDA" spontaneamente, doppio premio', 'Se si orienta verso di te invece del trigger, premio jackpot', 'Gradualmente diminuisci distanza dal trigger premendo calma', 'Una sessione da 20 minuti, riposo, poi altra sessione'], 45, ARRAY['Premi jackpot (qualcosa di speciale)', 'Trigger controllato', 'Assistente umano']),
  
  (7, 'Test di Valutazione Finale', 'Verificare i progressi fatti e consolidare gli apprendimenti', ARRAY['Riesponi il pet al trigger principale identificato il giorno 1', 'Usa tutti i comandi appresi: "GUARDA", "LASCIA"', 'Osserva se riesce a rimanere sotto soglia di reattività', 'Premia ogni comportamento positivo', 'Documenta i miglioramenti rispetto al giorno 1', 'Pianifica training continuo per mantenere progressi'], 50, ARRAY['Diario per confronto', 'Trigger del giorno 1', 'Premi di celebrazione'])
) AS exercises(day_number, title, description, instructions, duration_minutes, materials);