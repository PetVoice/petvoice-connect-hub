-- GIORNI 7-8: Consolidamento e Prevenzione Ricadute
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
  7,
  'Routine Giornaliera Anti-Distruttiva',
  'Stabilire routine quotidiana strutturata che incorpora tutte le strategie apprese per prevenire ricadute comportamentali.',
  15,
  'behavioral',
  ARRAY[
    'Mattino: 10 minuti gioco fisico + comando "Prendi questo" con Kong',
    'Pomeriggio: 15 minuti mental stimulation (puzzle feeder o snuffle)',
    'Sera: 5 minuti training "Lascia" + sessione angolo masticazione',
    'Prima uscite: routine pre-partenza con Kong speciale',
    'Documenta orari e risposte per creare programma personalizzato',
    'Identifica 3 momenti chiave dove implementare redirezione preventiva'
  ],
  ARRAY['Kong vari', 'Puzzle feeder', 'Tappetino snuffle', 'Timer', 'Quaderno routine'],
  false
FROM protocol_id p

UNION ALL

SELECT 
  p.id,
  7,
  'Test Stress Controllato',
  'Simulare situazioni stressanti che tipicamente scatenano comportamenti distruttivi per testare resilienza e strategie di coping.',
  12,
  'behavioral',
  ARRAY[
    'Simula situazioni trigger identificate nel Giorno 1 (rumori, preparativi uscita)',
    'Offri immediatamente alternative appropriate quando noti primi segni stress',
    'Usa comandi "Lascia" e "Prendi questo" preventivamente',
    'Mantieni calma e coerenza nella tua risposta',
    'Documenta quali situazioni causano ancora difficoltà',
    'Premia ogni momento di autocontrollo durante stress'
  ],
  ARRAY['Oggetti per simulare trigger', 'Giocattoli di emergenza', 'Premi di alto valore', 'Calma personale'],
  false
FROM protocol_id p

UNION ALL

SELECT 
  p.id,
  7,
  'Valutazione Progressi Settimanali',
  'Assessment completo dei miglioramenti ottenuti e identificazione di aree che necessitano rinforzo continuo.',
  10,
  'behavioral',
  ARRAY[
    'Revisiona foto del Giorno 1 e confronta con situazione attuale',
    'Testa tutti i comandi appresi: "Lascia", "Prendi questo", "Aspetta"',
    'Valuta autonomia nella scelta di oggetti appropriati (scala 1-10)',
    'Identifica 2-3 aree dove servono ancora miglioramenti',
    'Celebra progressi ottenuti con sessione di gioco extra',
    'Pianifica strategie di mantenimento per prossima settimana'
  ],
  ARRAY['Foto/note Giorno 1', 'Tutti i materiali usati', 'Scala valutazione', 'Premi celebrativi'],
  false
FROM protocol_id p

UNION ALL

SELECT 
  p.id,
  8,
  'Piano Mantenimento Personalizzato',
  'Creare strategia di mantenimento a lungo termine basata sui progressi individuali e le preferenze specifiche osservate.',
  12,
  'behavioral',
  ARRAY[
    'Identifica i 3 interventi più efficaci per il tuo animale',
    'Stabilisci frequenza minima per mantenere risultati (es. Kong giornaliero)',
    'Crea calendario settimanale con attività anti-distruttive distribuite',
    'Prepara "kit emergenza" con oggetti preferiti per momenti difficili',
    'Scrivi promemoria comportamenti da rinforzare quotidianamente',
    'Pianifica controlli mensili per monitorare mantenimento progressi'
  ],
  ARRAY['Quaderno/app pianificazione', 'Calendario', 'Kit oggetti preferiti', 'Promemoria'],
  false
FROM protocol_id p

UNION ALL

SELECT 
  p.id,
  8,
  'Test Finale Autonomia',
  'Valutazione conclusiva dell''autonomia dell''animale nelle scelte appropriate senza supporto umano diretto.',
  15,
  'behavioral',
  ARRAY[
    'Prepara ambiente con mix oggetti appropriati e inappropriati',
    'Osserva comportamento per 10 minuti senza interventi',
    'Documenta: tempo per scegliere, tipo oggetti scelti, persistenza',
    'Solo se necessario, usa comandi appresi per correggere',
    'Valuta miglioramento rispetto al Giorno 1 (scala 1-100)',
    'Termina con celebrazione dei progressi ottenuti'
  ],
  ARRAY['Mix oggetti vari', 'Timer', 'Quaderno valutazione', 'Telecamera se disponibile', 'Premi celebrativi'],
  false
FROM protocol_id p

UNION ALL

SELECT 
  p.id,
  8,
  'Sessione Rinforzo Positivo Finale',
  'Conclusione celebrativa che rinforza tutti i comportamenti positivi appresi e stabilisce associazioni positive durature.',
  10,
  'social',
  ARRAY[
    'Dedica tempo qualità esclusivo giocando con tutti i giocattoli appropriati',
    'Pratica tutti i comandi appresi in atmosfera rilassata e divertente',
    'Premia generosamente ogni risposta corretta, anche imperfetta',
    'Scatta foto/video per documentare i progressi',
    'Termina con attività che l''animale preferisce di più',
    'Pianifica "laurea" simbolica con premio speciale o gita'
  ],
  ARRAY['Tutti i giocattoli usati', 'Premi speciali', 'Fotocamera', 'Atmosfera festiva', 'Premio graduazione'],
  false
FROM protocol_id p;