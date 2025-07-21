-- RIMUOVI TUTTI I TRIGGER VECCHI CHE FANNO RIFERIMENTO A 'subscribed'
-- E LE VECCHIE FUNZIONI CHE POTREBBERO ESSERE RIMASTE

-- 1. Rimuovi tutti i trigger sulla tabella subscribers
DROP TRIGGER IF EXISTS trigger_process_referral_conversion ON public.subscribers;
DROP TRIGGER IF EXISTS on_referral_payment ON public.subscribers; 
DROP TRIGGER IF EXISTS handle_referral_payment_trigger ON public.subscribers;
DROP TRIGGER IF EXISTS process_monthly_renewals_trigger ON public.subscribers;
DROP TRIGGER IF EXISTS convert_registered_referrals_trigger ON public.subscribers;

-- 2. Rimuovi le vecchie funzioni che potrebbero ancora riferirsi a 'subscribed'
DROP FUNCTION IF EXISTS public.handle_referral_payment();
DROP FUNCTION IF EXISTS public.process_monthly_renewals();
DROP FUNCTION IF EXISTS public.convert_registered_referrals();
DROP FUNCTION IF EXISTS public.convert_referral(uuid, text);
DROP FUNCTION IF EXISTS public.process_referral_conversion();

-- 3. Rimuovi eventuali altri trigger o funzioni che potrebbero esistere
-- Ottieni lista di tutti i trigger su subscribers
DO $$
DECLARE
    trigger_name TEXT;
BEGIN
    FOR trigger_name IN 
        SELECT tgname FROM pg_trigger t 
        JOIN pg_class c ON c.oid = t.tgrelid 
        WHERE c.relname = 'subscribers' AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.subscribers', trigger_name);
    END LOOP;
END $$;

-- 4. Ora ricrea SOLO il trigger necessario per la conversione referral
-- ma usando i nomi colonna corretti

CREATE OR REPLACE FUNCTION public.process_referral_conversion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  referral_rec RECORD;
  tier_info RECORD;
  commission_amount DECIMAL;
  subscription_amount DECIMAL := 0.97;
  user_email TEXT;
BEGIN
  -- Solo quando subscription diventa attiva per la prima volta
  IF NEW.subscription_status = 'active' AND 
     (OLD IS NULL OR OLD.subscription_status != 'active') THEN
    
    -- Ottieni email utente
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = NEW.user_id;
    
    IF user_email IS NULL THEN
      RETURN NEW;
    END IF;
    
    -- Trova referral con status REGISTERED per questo utente
    SELECT * INTO referral_rec
    FROM public.referrals
    WHERE referred_user_id = NEW.user_id 
      AND status = 'registered'
    LIMIT 1;
    
    IF referral_rec IS NOT NULL THEN
      -- Converti da REGISTERED a CONVERTED
      UPDATE public.referrals
      SET status = 'converted', converted_at = NOW()
      WHERE id = referral_rec.id;
      
      -- Calcola tier del referrer
      SELECT * INTO tier_info
      FROM get_tier_info((
        SELECT COALESCE(total_conversions, 0) + 1
        FROM public.referrer_stats 
        WHERE user_id = referral_rec.referrer_id
      ));
      
      commission_amount := subscription_amount * tier_info.rate;
      
      -- Crea commissione first_payment
      INSERT INTO public.referral_commissions (
        referrer_id, referred_user_id, amount, commission_rate, tier,
        commission_type, subscription_amount, status,
        billing_period_start, billing_period_end, created_at
      ) VALUES (
        referral_rec.referrer_id, NEW.user_id, commission_amount, tier_info.rate, tier_info.tier,
        'first_payment', subscription_amount, 'active',
        CURRENT_DATE, CURRENT_DATE + INTERVAL '1 month', NOW()
      );
      
      -- Aggiorna statistiche referrer
      UPDATE public.referrer_stats
      SET 
        total_conversions = total_conversions + 1,
        available_credits = available_credits + commission_amount,
        total_credits_earned = total_credits_earned + commission_amount,
        current_tier = tier_info.tier,
        updated_at = NOW()
      WHERE user_id = referral_rec.referrer_id;
      
      -- Log conversione
      INSERT INTO public.activity_log (
        user_id, activity_type, activity_description, metadata
      ) VALUES (
        referral_rec.referrer_id,
        'referral_converted_auto',
        'Referral convertito automaticamente: ' || user_email,
        jsonb_build_object(
          'referred_user_id', NEW.user_id,
          'commission_amount', commission_amount,
          'tier', tier_info.tier,
          'commission_type', 'first_payment'
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 5. Attiva il trigger pulito
CREATE TRIGGER trigger_process_referral_conversion
  AFTER UPDATE ON public.subscribers
  FOR EACH ROW 
  EXECUTE FUNCTION process_referral_conversion();