-- Ricreo il trigger automatico senza condizione WHEN
DROP TRIGGER IF EXISTS on_referral_payment ON public.subscribers;

CREATE TRIGGER on_referral_payment
  AFTER INSERT OR UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.process_first_referral_conversion();

-- Verifico che il cron job sia attivo
SELECT cron.schedule(
  'complete-referral-processor',
  '*/30 * * * * *', -- Ogni 30 secondi
  $$
  SELECT auto_convert_pending_referrals();
  SELECT update_all_referral_stats();
  $$
);