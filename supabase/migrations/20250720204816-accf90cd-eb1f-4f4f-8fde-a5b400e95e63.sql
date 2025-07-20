-- GIORNI 5-6: Training Autocontrollo e "Leave It"
WITH protocol_id AS (
  SELECT id FROM ai_training_protocols 
  WHERE title = 'Stop Comportamenti Distruttivi' 
  ORDER BY created_at DESC 
  LIMIT 1
)

INSERT INTO public.ai_training_exercises (
  protocol_id,
  day_number,
  title,
  description,
  duration_minutes,
  exercise_type,
  instructions,
  materials,
  completed
) 
SELECT 
  p.id,
  5,
  'Comando "LASCIA" Base',
  'Insegnare il comando fondamentale "Lascia" per sviluppare autocontrollo e capacità di resistere alle tentazioni inappropriate.',
  15,
  'behavioral',
  ARRAY[
    'Tieni premio chiuso nel pugno, avvicinalo al muso dell''animale',
    'Quando annusa/lecca il pugno, di "Lascia" con voce calma e ferma',
    'Aspetta che si allontani anche solo di un centimetro dal pugno',
    'Nel momento che si allontana: "Bravo!" e premio dall''altra mano',
    'Ripeti 10-15 volte per sessione, aumentando tempo di attesa',
    'Non aprire mai il pugno durante l''esercizio - solo premio dalla mano libera'
  ],
  ARRAY['Premi piccoli appetitosi', 'Pazienza e consistenza', 'Voce calma'],
  false
FROM protocol_id p

UNION ALL

SELECT 
  p.id,
  5,
  'Impulse Control con Cibo',
  'Esercizio avanzato di controllo impulsi usando il cibo per rafforzare la capacità di aspettare e obbedire ai comandi.',
  12,
  'behavioral',
  ARRAY[
    'Prepara ciotola con cibo appetitoso, tienila in alto',
    'Avvicinala lentamente verso il pavimento dicendo "Aspetta"',
    'Se l''animale si muove verso la ciotola, risollevala immediatamente',
    'Solo quando rimane fermo, posa la ciotola e di "Okay, mangia!"',
    'Inizia con 2-3 secondi di attesa, aumenta gradualmente',
    'Ripeti 5-6 volte per sessione, celebrando ogni successo'
  ],
  ARRAY['Ciotola', 'Cibo o premi appetitosi', 'Timer', 'Autocontrollo personale'],
  false
FROM protocol_id p

UNION ALL

SELECT 
  p.id,
  5,
  'Test "Lascia" con Oggetti Casa',
  'Applicazione pratica del comando "Lascia" con oggetti reali della casa per generalizzare l''apprendimento.',
  10,
  'behavioral',
  ARRAY[
    'Posiziona oggetto domestico attraente (calzino, telecomando) sul pavimento',
    'Cammina con l''animale al guinzaglio verso l''oggetto',
    'A 1 metro di distanza di "Lascia" prima che mostri interesse',
    'Se obbedisce: premio immediato e allontanamento dall''oggetto',
    'Se non obbedisce: tira delicatamente il guinzaglio e ripeti "Lascia"',
    'Testa con 3-4 oggetti diversi, aumentando il livello di tentazione'
  ],
  ARRAY['Guinzaglio', 'Oggetti domestici vari', 'Premi di alto valore', 'Pazienza'],
  false
FROM protocol_id p

UNION ALL

SELECT 
  p.id,
  6,
  'Sfida Autocontrollo Multipla',
  'Test complesso con multiple tentazioni per valutare il livello di autocontrollo raggiunto e identificare aree da rinforzare.',
  14,
  'behavioral',
  ARRAY[
    'Disponi in fila 5 oggetti: 3 inappropriati (scarpe, cuscino, libro) e 2 appropriati (giocattoli)',
    'Cammina con l''animale lungo la fila, fermandoti davanti a ogni oggetto',
    'Per oggetti inappropriati: comando "Lascia" preventivo',
    'Per oggetti appropriati: "Prendi questo!" incoraggiante',
    'Premia ogni risposta corretta con entusiasmo crescente',
    'Ripeti percorso 3 volte cambiando ordine degli oggetti'
  ],
  ARRAY['3 oggetti "proibiti"', '2 giocattoli appetibili', 'Guinzaglio', 'Premi vari', 'Spazio per disporre oggetti'],
  false
FROM protocol_id p

UNION ALL

SELECT 
  p.id,
  6,
  'Mental Stimulation Intensiva',
  'Sessione prolungata di stimolazione mentale per soddisfare bisogni cognitivi e ridurre noia che porta a distruzione.',
  15,
  'mental',
  ARRAY[
    'Combina 3 attività mentali: puzzle feeder + tappetino snuffle + Kong riempito',
    'Presenta le attività in sequenza, 5 minuti ciascuna',
    'Non aiutare - lascia che risolva problemi autonomamente',
    'Osserva quali attività preferisce e quanto si concentra',
    'Premia verbalmente quando mostra persistenza e concentrazione',
    'Termina lasciando disponibile l''attività che ha gradito di più'
  ],
  ARRAY['Puzzle feeder', 'Tappetino snuffle', 'Kong riempito', 'Timer', 'Premi per riempimenti'],
  false
FROM protocol_id p

UNION ALL

SELECT 
  p.id,
  6,
  'Simulazione Assenza Proprietario',
  'Test realistico del comportamento durante assenza simulata per valutare efficacia delle strategie anti-distruttive.',
  12,
  'behavioral',
  ARRAY[
    'Prepara ambiente come per uscita reale: Kong riempito, giocattoli disponibili',
    'Esci dalla stanza per 2 minuti, poi torna senza fare drammi',
    'Osserva segni di ansia o tentativi distruttivi',
    'Se tutto va bene, aumenta a 5 minuti, poi 10 minuti',
    'Documenta comportamenti osservati e oggetti scelti',
    'Premia calma e scelte appropriate al tuo rientro'
  ],
  ARRAY['Kong preparato', 'Giocattoli vari', 'Timer', 'Telecamera o ascolto attento', 'Quaderno osservazioni'],
  false
FROM protocol_id p;