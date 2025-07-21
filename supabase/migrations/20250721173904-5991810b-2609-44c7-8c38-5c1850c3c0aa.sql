-- RIMUOVI IL TRIGGER ESISTENTE E RICREALO CON I NOMI COLONNA CORRETTI

-- 1. Rimuovi il trigger esistente
DROP TRIGGER IF EXISTS trigger_process_referral_conversion ON public.subscribers;

-- 2. Ricrea il trigger con i nomi colonna corretti (subscription_status invece di subscribed)
CREATE TRIGGER trigger_process_referral_conversion
  AFTER UPDATE ON public.subscribers
  FOR EACH ROW 
  EXECUTE FUNCTION process_referral_conversion();