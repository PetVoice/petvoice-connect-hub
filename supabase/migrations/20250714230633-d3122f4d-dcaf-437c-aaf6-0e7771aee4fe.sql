-- Ricrea il trigger per gestire automaticamente i pagamenti referral
DROP TRIGGER IF EXISTS on_referral_payment ON public.subscribers;

CREATE TRIGGER on_referral_payment
  AFTER UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_referral_payment();