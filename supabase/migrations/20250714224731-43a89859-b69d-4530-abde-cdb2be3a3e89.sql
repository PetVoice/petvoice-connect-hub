-- Modifica il sistema referral per dare crediti solo quando i clienti pagano
-- Rimuovi il trigger di registrazione che dava crediti subito
DROP TRIGGER IF EXISTS on_complete_user_registration ON auth.users;

-- Crea il trigger solo per profile e subscriber, senza referral
CREATE OR REPLACE FUNCTION public.handle_user_registration_only()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
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
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
    updated_at = NOW();

  -- 2. Crea abbonamento (senza attivarlo subito)
  INSERT INTO public.subscribers (
    user_id,
    subscription_plan,
    subscription_status,
    trial_used,
    max_pets_allowed
  ) VALUES (
    NEW.id,
    'premium',
    'pending', -- Inizia come pending, non active
    FALSE,
    999
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- 3. Salva solo il referral code nei metadati per elaborazione futura
  ref_code := NEW.raw_user_meta_data ->> 'referral_code';
  
  IF ref_code IS NOT NULL AND ref_code != '' THEN
    -- Trova il referrer
    SELECT user_id INTO referrer_user_id
    FROM public.user_referrals
    WHERE referral_code = ref_code;
    
    -- Se trovato, crea solo il record referral senza crediti
    IF referrer_user_id IS NOT NULL THEN
      INSERT INTO public.referrals (
        referrer_id,
        referred_email,
        referred_user_id,
        referral_code,
        status,
        channel,
        utm_source,
        utm_medium,
        utm_campaign
      ) VALUES (
        referrer_user_id,
        NEW.email,
        NEW.id,
        ref_code,
        'registered', -- Solo registrato, non convertito
        'manual_code',
        'referral',
        'manual',
        'friend_referral'
      );
      
      -- Aggiorna solo il contatore registrazioni (non conversioni)
      UPDATE public.user_referrals 
      SET 
        total_referrals = total_referrals + 1,
        updated_at = NOW()
      WHERE user_id = referrer_user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Ricrea il trigger per la registrazione
CREATE TRIGGER on_user_registration_only
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_registration_only();

-- Modifica il trigger per i pagamenti per dare crediti solo quando si paga
CREATE OR REPLACE FUNCTION public.handle_referral_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  referral_record RECORD;
  referrer_profile RECORD;
  tier_commission NUMERIC;
  credit_amount NUMERIC;
  subscription_amount NUMERIC := 0.97; -- Monthly subscription amount
  calculated_tier TEXT;
  referrer_conversions INTEGER;
BEGIN
  -- Solo quando subscription diventa attiva (primo pagamento)
  IF NEW.subscription_status = 'active' AND (OLD.subscription_status IS NULL OR OLD.subscription_status != 'active') THEN
    -- Cercare referral record per questo utente
    SELECT * INTO referral_record
    FROM public.referrals
    WHERE referred_user_id = NEW.user_id
      AND status = 'registered'
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF referral_record IS NOT NULL THEN
      -- Ottenere profilo referrer
      SELECT * INTO referrer_profile
      FROM public.user_referrals
      WHERE user_id = referral_record.referrer_id;
      
      IF referrer_profile IS NOT NULL THEN
        -- Calcolare il tier corretto basato sulle conversioni attuali
        referrer_conversions := referrer_profile.successful_conversions;
        
        IF referrer_conversions >= 50 THEN
          calculated_tier := 'Platino';
          tier_commission := 0.20;
        ELSIF referrer_conversions >= 20 THEN
          calculated_tier := 'Oro';
          tier_commission := 0.15;
        ELSIF referrer_conversions >= 5 THEN
          calculated_tier := 'Argento';
          tier_commission := 0.10;
        ELSE
          calculated_tier := 'Bronzo';
          tier_commission := 0.05;
        END IF;
        
        -- Calcolare credito
        credit_amount := subscription_amount * tier_commission;
        
        -- Aggiornare referral status
        UPDATE public.referrals 
        SET 
          status = 'converted',
          conversion_date = now(),
          credits_awarded = credit_amount,
          updated_at = now()
        WHERE id = referral_record.id;
        
        -- Aggiungere crediti al referrer
        INSERT INTO public.referral_credits (
          user_id,
          referral_id,
          amount,
          credit_type,
          description,
          status,
          expires_at
        ) VALUES (
          referrer_profile.user_id,
          referral_record.id,
          credit_amount,
          'referral_conversion',
          'Credito per primo pagamento referral: ' || referral_record.referred_email,
          'active',
          now() + interval '24 months'
        );
        
        -- Aggiornare statistiche referrer
        UPDATE public.user_referrals 
        SET 
          successful_conversions = successful_conversions + 1,
          total_credits_earned = total_credits_earned + credit_amount,
          current_tier = calculated_tier,
          updated_at = now()
        WHERE user_id = referrer_profile.user_id;
        
        -- Log conversione
        INSERT INTO public.activity_log (
          user_id,
          activity_type,
          activity_description,
          metadata
        ) VALUES (
          referrer_profile.user_id,
          'referral_first_payment',
          'Primo pagamento referral: ' || referral_record.referred_email || ' (+€' || credit_amount || ')',
          jsonb_build_object(
            'referred_email', referral_record.referred_email,
            'referred_user_id', referral_record.referred_user_id,
            'credit_amount', credit_amount,
            'tier_commission', tier_commission,
            'tier', calculated_tier,
            'payment_type', 'first_payment'
          )
        );
      END IF;
    END IF;
  
  -- Gestire rinnovi mensili (quando subscription_end_date viene aggiornata)
  ELSIF NEW.subscription_status = 'active' AND OLD.subscription_status = 'active' 
        AND NEW.subscription_end_date IS NOT NULL 
        AND OLD.subscription_end_date IS NOT NULL
        AND NEW.subscription_end_date > OLD.subscription_end_date THEN
    
    -- Questo è un rinnovo - cercare referral convertito
    SELECT * INTO referral_record
    FROM public.referrals
    WHERE referred_user_id = NEW.user_id
      AND status = 'converted'
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF referral_record IS NOT NULL THEN
      -- Ottenere profilo referrer
      SELECT * INTO referrer_profile
      FROM public.user_referrals
      WHERE user_id = referral_record.referrer_id;
      
      IF referrer_profile IS NOT NULL THEN
        -- Usare la commissione del tier attuale
        CASE referrer_profile.current_tier
          WHEN 'Bronzo' THEN tier_commission := 0.05;
          WHEN 'Argento' THEN tier_commission := 0.10;
          WHEN 'Oro' THEN tier_commission := 0.15;
          WHEN 'Platino' THEN tier_commission := 0.20;
          ELSE tier_commission := 0.05;
        END CASE;
        
        credit_amount := subscription_amount * tier_commission;
        
        -- Aggiungere crediti per il rinnovo
        INSERT INTO public.referral_credits (
          user_id,
          referral_id,
          amount,
          credit_type,
          description,
          status,
          expires_at
        ) VALUES (
          referrer_profile.user_id,
          referral_record.id,
          credit_amount,
          'monthly_renewal',
          'Credito rinnovo mensile referral: ' || referral_record.referred_email,
          'active',
          now() + interval '24 months'
        );
        
        -- Aggiornare solo i crediti totali (non le conversioni)
        UPDATE public.user_referrals 
        SET 
          total_credits_earned = total_credits_earned + credit_amount,
          updated_at = now()
        WHERE user_id = referrer_profile.user_id;
        
        -- Log rinnovo
        INSERT INTO public.activity_log (
          user_id,
          activity_type,
          activity_description,
          metadata
        ) VALUES (
          referrer_profile.user_id,
          'referral_renewal_payment',
          'Rinnovo mensile referral: ' || referral_record.referred_email || ' (+€' || credit_amount || ')',
          jsonb_build_object(
            'referred_email', referral_record.referred_email,
            'referred_user_id', referral_record.referred_user_id,
            'credit_amount', credit_amount,
            'tier_commission', tier_commission,
            'tier', referrer_profile.current_tier,
            'payment_type', 'monthly_renewal'
          )
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Rimuovi il vecchio trigger
DROP TRIGGER IF EXISTS on_referral_conversion ON public.subscribers;

-- Crea il nuovo trigger per i pagamenti
CREATE TRIGGER on_referral_payment
  AFTER UPDATE ON public.subscribers
  FOR EACH ROW EXECUTE FUNCTION public.handle_referral_payment();