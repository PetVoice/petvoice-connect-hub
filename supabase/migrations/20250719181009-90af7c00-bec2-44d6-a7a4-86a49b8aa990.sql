-- Continuo con gli esercizi per i nuovi protocolli (correzione ambiguità)

-- PROTOCOLLO 1: Gestione Iperattività e Deficit Attenzione (10 giorni)
INSERT INTO ai_training_exercises (protocol_id, day_number, title, description, exercise_type, duration_minutes, instructions, materials)
SELECT p.id, exercises.day_num, exercises.title, exercises.description, 'behavioral', exercises.duration, exercises.instructions::text[], exercises.materials::text[]
FROM ai_training_protocols p,
(VALUES
  (1, 'Focus e Attenzione Base', 'Esercizi di base per migliorare concentrazione e controllo degli impulsi', 20, 
   ARRAY['Chiedi al cane di sedersi', 'Mantieni il contatto visivo per 3 secondi', 'Premia immediatamente', 'Ripeti 10 volte'], 
   ARRAY['Premi di alto valore', 'Guinzaglio corto']),
  (2, 'Canalizzazione Energia Positiva', 'Attività strutturate per sfogare energia in modo costruttivo', 25,
   ARRAY['Percorso ad ostacoli semplice', 'Alternare salti e sosta', 'Premiare la calma tra esercizi', 'Sessioni da 5 minuti x 3'],
   ARRAY['Ostacoli bassi', 'Coni', 'Premi']),
  (3, 'Controllo Impulsi - Cibo', 'Esercizi di autocontrollo usando il cibo come motivatore', 15,
   ARRAY['Mostra il premio senza darlo', 'Aspetta che il cane si calmi', 'Premia solo quando è rilassato', 'Aumenta gradualmente il tempo'],
   ARRAY['Premi appetitosi', 'Ciotola']),
  (4, 'Rilassamento Guidato', 'Tecniche per insegnare il comando "relax" e favorire la calma', 30,
   ARRAY['Posizione down sul tappetino', 'Comando "relax" con voce calma', 'Massaggio leggero', 'Musica rilassante di sottofondo'],
   ARRAY['Tappetino comfort', 'Musica rilassante']),
  (5, 'Focus Avanzato con Distrazioni', 'Mantenere attenzione nonostante stimoli esterni', 20,
   ARRAY['Esercizi di base con rumori leggeri', 'Incrementare gradualmente le distrazioni', 'Premiare solo successi completi', 'Max 3 tentativi per sessione'],
   ARRAY['Fonte di rumore controllata', 'Premi speciali']),
  (6, 'Giochi di Problem Solving', 'Stimolazione mentale per incanalare energia mentale', 25,
   ARRAY['Nascondere premi nel tappetino sniffing', 'Tempo limite 10 minuti', 'Supervisionare e guidare se necessario', 'Celebrare ogni successo'],
   ARRAY['Tappetino sniffing', 'Premi piccoli']),
  (7, 'Controllo Movimento', 'Esercizi per gestire movimenti impulsivi', 15,
   ARRAY['Seduto-in piedi lentamente', 'Stop su comando durante cammino', 'Premiare movimenti controllati', '5 ripetizioni per comando'],
   ARRAY['Guinzaglio', 'Premi']),
  (8, 'Calma in Situazioni Eccitanti', 'Mantenere controllo in momenti di alta stimolazione', 20,
   ARRAY['Simulare situazioni eccitanti (campanello, ospiti)', 'Richiedere calma prima di procedere', 'Ignorare comportamenti iperattivi', 'Premiare solo stati calmi'],
   ARRAY['Campanello', 'Premi di alto valore']),
  (9, 'Sequenze di Comandi', 'Eseguire serie di comandi per migliorare concentrazione', 25,
   ARRAY['Seduto-terra-resta-vieni', 'Eseguire senza interruzioni', 'Tempo di pausa tra comandi', 'Premiare sequenza completa'],
   ARRAY['Premi', 'Spazio aperto']),
  (10, 'Autocontrollo Avanzato', 'Test finale di controllo comportamentale', 30,
   ARRAY['Combinare tutti gli esercizi precedenti', 'Aumentare durata e difficoltà', 'Valutare progressi', 'Sessione di consolidamento'],
   ARRAY['Tutti i materiali precedenti'])
) AS exercises(day_num, title, description, duration, instructions, materials)
WHERE p.title = 'Gestione Iperattività e Deficit Attenzione';