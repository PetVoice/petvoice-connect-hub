-- Rimuovi i job cron obsoleti che causano errori
SELECT cron.unschedule('simple-referral-converter-1');
SELECT cron.unschedule('simple-referral-converter-instant');