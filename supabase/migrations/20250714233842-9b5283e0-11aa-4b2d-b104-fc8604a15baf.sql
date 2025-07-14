-- RIMUOVO IL TRIGGER VECCHIO CHE INTERFERISCE
DROP TRIGGER IF EXISTS handle_referral_conversion_trigger ON public.subscribers;

-- RIMUOVO ANCHE LA FUNZIONE VECCHIA CHE NON SERVE
DROP FUNCTION IF EXISTS public.handle_referral_conversion();

-- VERIFICO CHE IL TRIGGER GIUSTO ESISTA
DROP TRIGGER IF EXISTS on_referral_payment ON public.subscribers;

CREATE TRIGGER on_referral_payment
  AFTER UPDATE ON public.subscribers
  FOR EACH ROW
  WHEN (NEW.subscription_status = 'active' AND (OLD.subscription_status IS NULL OR OLD.subscription_status != 'active'))
  EXECUTE FUNCTION public.handle_referral_payment();

-- TEST: Aggiorno un subscriber per far scattare il trigger
UPDATE public.subscribers 
SET subscription_status = 'inactive'
WHERE user_id = '377a5951-e0b8-4539-a62b-6f0ab5cd3eeb';

UPDATE public.subscribers 
SET subscription_status = 'active'
WHERE user_id = '377a5951-e0b8-4539-a62b-6f0ab5cd3eeb';