-- Reset all exercise instructions back to Italian
UPDATE ai_training_exercises 
SET instructions = ARRAY[
  'Scegli uno spazio tranquillo e familiare per l''animale',
  'Posiziona il tappetino comfort in un angolo sicuro',
  'Offri snack premio quando l''animale si avvicina spontaneamente',
  'Mantieni distanza e lascia che l''animale esplori liberamente',
  'Rinforza positivamente ogni comportamento calmo e rilassato',
  'BODY LANGUAGE: Osserva postura rilassata, coda in posizione neutrale',
  'BODY LANGUAGE: Cerca respiro regolare e orecchie rilassate',
  'BODY LANGUAGE: Evita segnali stress come ansimare o tremare'
]
WHERE title = 'Creazione Safe Space Personale';

UPDATE ai_training_exercises 
SET instructions = ARRAY[
  'Praticare manovra di allontanamento rapido dal trigger',
  'Testare efficacia comando "via" per uscita immediata',
  'Verificare che guinzaglio e equipment siano sicuri al 100%',
  'Stabilire rotta di fuga sicura in ogni ambiente di training'
]
WHERE title = 'Emergency Safety Protocol';

UPDATE ai_training_exercises 
SET instructions = ARRAY[
  'Posizionati vicino a una finestra o porta a vetri',
  'Lascia che l''animale osservi l''esterno dal suo safe space',
  'Ricompensa la curiosità calma verso stimoli esterni',
  'Non forzare l''avvicinamento, rispetta i tempi dell''animale',
  'Offri distrazioni positive se mostra stress',
  'BODY LANGUAGE: Osserva orecchie in avanti che indicano interesse',
  'BODY LANGUAGE: Cerca postura bilanciata, non tesa o rigida',
  'BODY LANGUAGE: Valuta se l''animale si avvicina volontariamente'
]
WHERE title = 'Osservazione Passiva Ambiente';

UPDATE ai_training_exercises 
SET instructions = ARRAY[
  'Inizia con ambiente silenzioso e luci soffuse',
  'Pet in posizione down su superficie morbida',
  'Massaggio sistematico: inizia da testa, scendi gradualmente',
  'Sincronizza massaggio con respirazione lenta',
  'Sussurra "rilassa" e "calma" ritmicamente',
  'Obiettivo: 12 minuti di rilassamento profondo'
]
WHERE title = 'Guided Deep Relaxation';

UPDATE ai_training_exercises 
SET instructions = ARRAY[
  'Rinforza 7 su 10 esposizioni invece che tutte',
  'Varia quale esposizione non viene rinforzata',
  'Osserva se comportamento rimane stabile',
  'Aumenta qualità premio quando lo dai',
  'Mantieni rinforzo sociale (lodi) sempre',
  'Target: animale mantiene calma anche senza premio immediato'
]
WHERE title = 'Strategic Intermittent Reinforcement';