-- RIATTIVA IL CRON JOB PER AUTO-CONVERSIONE REFERRAL
-- Assicuriamoci che il cron job per la conversione automatica sia attivo e funzioni ogni 30 secondi

-- Prima elimina eventuali cron job esistenti
SELECT cron.unschedule('complete-referral-processor');
SELECT cron.unschedule('auto-referral-converter');

-- Crea il cron job che esegue ogni 30 secondi
SELECT cron.schedule(
  'auto-referral-converter',
  '*/30 * * * * *', -- Ogni 30 secondi
  $$
  SELECT auto_convert_pending_referrals();
  SELECT update_all_referral_stats();
  $$
);

-- Verifica che il cron job sia stato creato
SELECT 
  jobname,
  schedule,
  command,
  active
FROM cron.job 
WHERE jobname = 'auto-referral-converter';

-- Esegui una volta manualmente per testare
SELECT auto_convert_pending_referrals();
SELECT update_all_referral_stats();