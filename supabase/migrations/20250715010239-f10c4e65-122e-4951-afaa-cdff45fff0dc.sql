-- Aggiunge un cron job per sincronizzare i subscriber di Stripe ogni 10 minuti
SELECT cron.schedule(
  'sync-stripe-subscriptions',
  '*/10 * * * *', -- Ogni 10 minuti
  $$
  SELECT net.http_post(
    url := 'https://unwxkufzauulzhmjxxqi.supabase.co/functions/v1/sync-stripe-subscriptions',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVud3hrdWZ6YXV1bHpobWp4eHFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMDcwMTIsImV4cCI6MjA2NzU4MzAxMn0.QfjmWCFEIaHzeYy0Z1gROZQchzqcCCo9In4ayqR3cXw"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);