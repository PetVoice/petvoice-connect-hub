-- Aggiungi il trigger mancante per gestire i pagamenti referral
CREATE TRIGGER on_referral_payment
  AFTER UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_referral_payment();