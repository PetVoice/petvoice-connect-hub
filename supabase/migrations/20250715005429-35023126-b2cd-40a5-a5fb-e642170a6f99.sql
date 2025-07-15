-- Aggiorna il cron job per processare tutto ogni 30 secondi
SELECT cron.unschedule('complete-referral-processor');
SELECT cron.schedule(
  'complete-referral-processor',
  '*/30 * * * * *', -- Ogni 30 secondi
  $$
  SELECT auto_convert_pending_referrals();
  SELECT update_all_referral_stats();
  $$
);