-- Ricreo il trigger automatico per le conversioni referral (corretto)
DROP TRIGGER IF EXISTS on_referral_payment ON public.subscribers;

CREATE TRIGGER on_referral_payment
  AFTER INSERT OR UPDATE ON public.subscribers
  FOR EACH ROW
  WHEN (NEW.subscription_status = 'active' AND 
        COALESCE(OLD.subscription_status, '') != 'active')
  EXECUTE FUNCTION public.process_first_referral_conversion();