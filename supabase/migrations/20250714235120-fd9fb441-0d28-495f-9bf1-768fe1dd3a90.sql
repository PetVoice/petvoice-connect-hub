-- SOLUZIONE DEFINITIVA: Fix condizione trigger
DROP TRIGGER IF EXISTS on_referral_payment ON public.subscribers;

CREATE TRIGGER on_referral_payment
  AFTER UPDATE ON public.subscribers
  FOR EACH ROW
  WHEN (NEW.subscription_status = 'active' AND 
        COALESCE(OLD.subscription_status, '') != 'active')
  EXECUTE FUNCTION public.handle_referral_payment();

-- TEST IMMEDIATO
UPDATE public.subscribers 
SET subscription_status = 'inactive'
WHERE user_id = '377a5951-e0b8-4539-a62b-6f0ab5cd3eeb';

UPDATE public.subscribers 
SET subscription_status = 'active'  
WHERE user_id = '377a5951-e0b8-4539-a62b-6f0ab5cd3eeb';