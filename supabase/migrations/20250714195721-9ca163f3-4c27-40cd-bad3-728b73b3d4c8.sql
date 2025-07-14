-- Correggere i tier da inglese a italiano
UPDATE public.user_referrals 
SET current_tier = CASE 
  WHEN current_tier = 'Bronze' THEN 'Bronzo'
  WHEN current_tier = 'Silver' THEN 'Argento'
  WHEN current_tier = 'Gold' THEN 'Oro'
  WHEN current_tier = 'Platinum' THEN 'Platino'
  WHEN current_tier = 'Diamond' THEN 'Platino'
  ELSE current_tier
END
WHERE current_tier IN ('Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond');

-- Creare una funzione per controllare email duplicate lato applicazione
CREATE OR REPLACE FUNCTION public.check_email_exists(email_to_check text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  existing_user_count integer;
BEGIN
  -- Controlla se l'email esiste già tra gli utenti confermati
  SELECT COUNT(*) INTO existing_user_count 
  FROM auth.users 
  WHERE email = LOWER(TRIM(email_to_check)) 
  AND email_confirmed_at IS NOT NULL;
  
  RETURN existing_user_count > 0;
END;
$$;

-- Modificare la funzione handle_referral_conversion per gestire i rinnovi mensili
-- Creare una nuova funzione per gestire i crediti di rinnovo
CREATE OR REPLACE FUNCTION public.handle_referral_monthly_credit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  referral_record RECORD;
  referrer_profile RECORD;
  tier_commission NUMERIC;
  credit_amount NUMERIC;
  subscription_amount NUMERIC := 0.97; -- Monthly subscription amount
BEGIN
  -- Processare solo quando subscription è attiva (inclusi rinnovi)
  IF NEW.subscribed = true AND OLD.subscribed = true THEN
    -- Questo è un rinnovo mensile - cercare referral record
    SELECT * INTO referral_record
    FROM public.referrals
    WHERE (referred_user_id = NEW.user_id OR referred_email = NEW.email)
      AND status = 'converted'
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF referral_record IS NOT NULL THEN
      -- Ottenere profilo referrer per determinare tier commission
      SELECT * INTO referrer_profile
      FROM public.user_referrals
      WHERE user_id = referral_record.referrer_id;
      
      IF referrer_profile IS NOT NULL THEN
        -- Determinare commissione basata sul tier
        CASE referrer_profile.current_tier
          WHEN 'Bronzo' THEN tier_commission := 0.05;
          WHEN 'Argento' THEN tier_commission := 0.10;
          WHEN 'Oro' THEN tier_commission := 0.15;
          WHEN 'Platino' THEN tier_commission := 0.20;
          ELSE tier_commission := 0.05; -- Default to Bronzo
        END CASE;
        
        -- Calcolare credito
        credit_amount := subscription_amount * tier_commission;
        
        -- Aggiungere crediti al referrer per il rinnovo
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
          'Credito mensile per referral: ' || referral_record.referred_email,
          'active',
          now() + interval '24 months'
        );
        
        -- Aggiornare statistiche referrer
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
          'referral_monthly_credit',
          'Credito mensile da referral: ' || referral_record.referred_email || ' (+€' || credit_amount || ')',
          jsonb_build_object(
            'referred_email', referral_record.referred_email,
            'referred_user_id', referral_record.referred_user_id,
            'credit_amount', credit_amount,
            'tier_commission', tier_commission,
            'tier', referrer_profile.current_tier,
            'credit_type', 'monthly_renewal'
          )
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Creare trigger per gestire i crediti di rinnovo mensile
CREATE TRIGGER handle_referral_monthly_credit_trigger
  AFTER UPDATE ON public.subscribers
  FOR EACH ROW EXECUTE FUNCTION public.handle_referral_monthly_credit();