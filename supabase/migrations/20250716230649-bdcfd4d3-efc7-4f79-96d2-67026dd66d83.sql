-- Rimuovi il job esistente
SELECT cron.unschedule('simple-referral-converter');

-- Crea due job sfasati per controllo ogni 30 secondi
SELECT cron.schedule(
  'simple-referral-converter-1',
  '* * * * *',  -- Ogni minuto al secondo 0
  'SELECT public.simple_convert_all_pending();'
);

-- Job sfasato di 30 secondi (non supportato direttamente, quindi usiamo un job che gira ogni minuto)
-- Per simulare 30 secondi, creiamo un secondo job che parte subito
SELECT cron.schedule(
  'simple-referral-converter-instant',
  '* * * * *',  -- Ogni minuto
  'SELECT pg_sleep(30); SELECT public.simple_convert_all_pending();'
);

-- Esegui subito per test
SELECT public.simple_convert_all_pending();