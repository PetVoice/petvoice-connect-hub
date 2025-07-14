-- Ricrea il trigger per la conversione referral in modo più sicuro
CREATE OR REPLACE TRIGGER handle_referral_conversion_trigger
  AFTER INSERT OR UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_referral_conversion();