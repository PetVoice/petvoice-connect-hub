-- STEP 1: PULISCI TUTTO - Rimuovi TUTTI i trigger referral esistenti
DROP TRIGGER IF EXISTS on_referral_payment ON public.subscribers;
DROP TRIGGER IF EXISTS handle_referral_conversion_trigger ON public.subscribers;
DROP TRIGGER IF EXISTS referral_trigger ON public.subscribers;

-- STEP 2: RICREA FUNZIONE SEMPLICE E SICURA
CREATE OR REPLACE FUNCTION public.handle_referral_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log per debug
  INSERT INTO public.activity_log (user_id, activity_type, activity_description)
  VALUES (NEW.user_id, 'trigger_test', 'Trigger fired for user: ' || NEW.user_id);

  -- Trova referral "registered" per questo utente
  UPDATE public.referrals 
  SET 
    status = 'converted',
    conversion_date = now(),
    credits_awarded = 0.05,
    updated_at = now()
  WHERE referred_user_id = NEW.user_id 
    AND status = 'registered';

  -- Aggiorna statistiche referrer
  UPDATE public.user_referrals ur
  SET 
    successful_conversions = successful_conversions + 1,
    total_credits_earned = total_credits_earned + 0.05,
    updated_at = now()
  FROM public.referrals r
  WHERE r.referred_user_id = NEW.user_id 
    AND r.status = 'converted'
    AND ur.user_id = r.referrer_id;

  -- Crea credito
  INSERT INTO public.referral_credits (
    user_id, referral_id, amount, credit_type, description, status, expires_at
  )
  SELECT 
    r.referrer_id,
    r.id,
    0.05,
    'referral_conversion',
    'Credito referral: ' || NEW.user_id,
    'active',
    now() + interval '24 months'
  FROM public.referrals r
  WHERE r.referred_user_id = NEW.user_id 
    AND r.status = 'converted';

  RETURN NEW;
END;
$$;

-- STEP 3: RICREA TRIGGER SEMPLICE
CREATE TRIGGER on_referral_payment
  AFTER UPDATE ON public.subscribers
  FOR EACH ROW
  WHEN (NEW.subscription_status = 'active' AND OLD.subscription_status != 'active')
  EXECUTE FUNCTION public.handle_referral_payment();

-- STEP 4: TESTA SUBITO
UPDATE public.subscribers 
SET subscription_status = 'inactive'
WHERE user_id = '377a5951-e0b8-4539-a62b-6f0ab5cd3eeb';

UPDATE public.subscribers 
SET subscription_status = 'active'  
WHERE user_id = '377a5951-e0b8-4539-a62b-6f0ab5cd3eeb';