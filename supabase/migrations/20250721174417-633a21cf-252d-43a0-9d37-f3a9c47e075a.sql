-- Ricrea il trigger per attivarsi sia su INSERT che UPDATE
DROP TRIGGER IF EXISTS trigger_process_referral_conversion ON public.subscribers;

CREATE TRIGGER trigger_process_referral_conversion
  AFTER INSERT OR UPDATE ON public.subscribers
  FOR EACH ROW 
  EXECUTE FUNCTION process_referral_conversion();