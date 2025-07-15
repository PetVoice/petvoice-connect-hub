-- PULIZIA COMPLETA: Rimuove TUTTI i trigger e funzioni referral esistenti
DROP TRIGGER IF EXISTS on_referral_payment ON public.subscribers;
DROP TRIGGER IF EXISTS handle_referral_conversion_trigger ON public.subscribers;
DROP TRIGGER IF EXISTS referral_trigger ON public.subscribers;
DROP TRIGGER IF EXISTS on_user_registration_only ON auth.users;
DROP TRIGGER IF EXISTS on_complete_user_registration ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_referral_registration ON auth.users;
DROP TRIGGER IF EXISTS on_user_referral_registration ON auth.users;

-- Rimuove tutte le funzioni referral esistenti
DROP FUNCTION IF EXISTS public.handle_referral_payment();
DROP FUNCTION IF EXISTS public.handle_referral_conversion();
DROP FUNCTION IF EXISTS public.handle_referral_registration();
DROP FUNCTION IF EXISTS public.handle_user_registration_only();
DROP FUNCTION IF EXISTS public.handle_new_user_no_subscription();

-- RICREA DA ZERO: Funzione semplice per gestire nuovi utenti
CREATE OR REPLACE FUNCTION public.handle_new_user_simple()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  ref_code TEXT;
  referrer_user_id UUID;
BEGIN
  -- 1. Crea profilo
  INSERT INTO public.profiles (user_id, display_name, language, theme)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'language', 'it'),
    COALESCE(NEW.raw_user_meta_data->>'theme', 'light')
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- 2. Gestisci referral se presente
  ref_code := NEW.raw_user_meta_data ->> 'referral_code';
  
  IF ref_code IS NOT NULL AND ref_code != '' THEN
    -- Trova il referrer
    SELECT user_id INTO referrer_user_id
    FROM public.user_referrals
    WHERE referral_code = ref_code;
    
    -- Se trovato, crea il record referral
    IF referrer_user_id IS NOT NULL THEN
      INSERT INTO public.referrals (
        referrer_id,
        referred_email,
        referred_user_id,
        referral_code,
        status,
        channel
      ) VALUES (
        referrer_user_id,
        NEW.email,
        NEW.id,
        ref_code,
        'registered',
        'manual_code'
      )
      ON CONFLICT (referrer_id, referred_email) DO UPDATE SET
        referred_user_id = NEW.id,
        status = 'registered',
        updated_at = now();
      
      -- Aggiorna contatore registrazioni
      UPDATE public.user_referrals 
      SET 
        total_referrals = total_referrals + 1,
        updated_at = NOW()
      WHERE user_id = referrer_user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- RICREA DA ZERO: Funzione semplice per gestire pagamenti
CREATE OR REPLACE FUNCTION public.handle_payment_simple()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  referral_record RECORD;
  tier_commission NUMERIC;
  credit_amount NUMERIC := 0.97 * 0.05; -- 5% di default
BEGIN
  -- Solo quando subscription diventa attiva
  IF NEW.subscription_status = 'active' AND 
     COALESCE(OLD.subscription_status, '') != 'active' THEN
    
    -- Trova referral per questo utente
    SELECT * INTO referral_record
    FROM public.referrals
    WHERE referred_user_id = NEW.user_id 
      AND status = 'registered'
    LIMIT 1;
    
    IF referral_record IS NOT NULL THEN
      -- Aggiorna referral a convertito
      UPDATE public.referrals 
      SET 
        status = 'converted',
        conversion_date = now(),
        credits_awarded = credit_amount,
        updated_at = now()
      WHERE id = referral_record.id;
      
      -- Aggiorna statistiche referrer
      UPDATE public.user_referrals 
      SET 
        successful_conversions = successful_conversions + 1,
        total_credits_earned = total_credits_earned + credit_amount,
        updated_at = now()
      WHERE user_id = referral_record.referrer_id;
      
      -- Crea credito
      INSERT INTO public.referral_credits (
        user_id, 
        referral_id, 
        amount, 
        credit_type, 
        description, 
        status, 
        expires_at
      ) VALUES (
        referral_record.referrer_id,
        referral_record.id,
        credit_amount,
        'referral_conversion',
        'Credito per conversione referral',
        'active',
        now() + interval '24 months'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- RICREA TRIGGER SEMPLICI
CREATE TRIGGER on_new_user_simple
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_simple();

CREATE TRIGGER on_payment_simple
  AFTER UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_payment_simple();