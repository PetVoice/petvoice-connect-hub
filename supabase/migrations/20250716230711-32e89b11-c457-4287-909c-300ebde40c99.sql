-- SISTEMA ULTRAVELOCE - CONTROLLO OGNI 30 SECONDI EFFETTIVI

-- Prima rimuovi tutti i job esistenti
SELECT cron.unschedule(job_name) 
FROM cron.job 
WHERE job_name LIKE '%referral%';

-- Job principale che gira ogni minuto
SELECT cron.schedule(
  'ultra-fast-referral-check',
  '* * * * *',  -- Ogni minuto
  'SELECT public.simple_convert_all_pending();'
);

-- Job sfasato che gira 30 secondi dopo (usando pg_sleep)
SELECT cron.schedule(
  'ultra-fast-referral-check-delayed',
  '* * * * *',  -- Ogni minuto
  'SELECT pg_sleep(30); SELECT public.simple_convert_all_pending();'
);

-- Test immediato
SELECT public.simple_convert_all_pending();