-- Creare trigger per conversione referral quando subscriber diventa attivo
CREATE OR REPLACE TRIGGER handle_referral_conversion_trigger
  AFTER INSERT OR UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_referral_conversion();

-- Anche creare trigger per aggiornare stats referral
CREATE OR REPLACE TRIGGER update_referral_stats_trigger
  AFTER UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_referral_stats();