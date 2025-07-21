-- FUNZIONE SEMPLICE: CONVERTE SOLO REGISTERED -> CONVERTED + PRIMA SOTTOSCRIZIONE

-- 1. Crea funzione per convertire referral quando utente diventa attivo
CREATE OR REPLACE FUNCTION public.convert_registered_referrals()
RETURNS TRIGGER AS $$
DECLARE
  referral_rec RECORD;
  tier_info RECORD;
  commission_amount DECIMAL;
  subscription_amount DECIMAL := 0.97;
BEGIN
  -- Solo quando subscription diventa attiva per la prima volta
  IF NEW.subscription_status = 'active' AND 
     (OLD IS NULL OR OLD.subscription_status != 'active') THEN
    
    -- Trova referral con status REGISTERED per questo utente
    SELECT * INTO referral_rec
    FROM public.referrals
    WHERE referred_user_id = NEW.user_id 
      AND status = 'registered'  -- SOLO registered
    LIMIT 1;
    
    IF referral_rec IS NOT NULL THEN
      -- Converti da REGISTERED a CONVERTED
      UPDATE public.referrals
      SET status = 'converted', updated_at = NOW()
      WHERE id = referral_rec.id;
      
      -- Calcola tier del referrer
      SELECT * INTO tier_info
      FROM get_tier_info((
        SELECT COALESCE(total_conversions, 0) + 1 -- +1 perché stiamo aggiungendo questa conversione
        FROM public.referrer_stats 
        WHERE user_id = referral_rec.referrer_id
      ));
      
      commission_amount := subscription_amount * tier_info.rate;
      
      -- Crea SOLO commissione first_payment
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
        'referral_converted',
        'Referral convertito: ' || COALESCE((SELECT email FROM auth.users WHERE id = NEW.user_id), 'utente'),
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
$$ LANGUAGE plpgsql;

-- 2. Crea trigger che si attiva SOLO quando subscription diventa attiva
CREATE TRIGGER convert_registered_to_converted
  AFTER UPDATE ON public.subscribers
  FOR EACH ROW
  WHEN (NEW.subscription_status = 'active' AND 
        COALESCE(OLD.subscription_status, '') != 'active')
  EXECUTE FUNCTION public.convert_registered_referrals();

-- 3. Applica immediatamente a giuseppe.eros.lana@gmail.com
-- Forza conversione manuale per giuseppe che è già attivo
DO $$
DECLARE
  giuseppe_referral RECORD;
  tier_info RECORD;
  commission_amount DECIMAL := 0.0485; -- Bronzo 5%
BEGIN
  -- Trova il referral di giuseppe
  SELECT * INTO giuseppe_referral
  FROM public.referrals
  WHERE referred_email = 'giuseppe.eros.lana@gmail.com'
    AND status = 'registered';
    
  IF giuseppe_referral IS NOT NULL THEN
    -- Converti a converted
    UPDATE public.referrals
    SET status = 'converted', updated_at = NOW()
    WHERE id = giuseppe_referral.id;
    
    -- Crea commissione first_payment
    INSERT INTO public.referral_commissions (
      referrer_id, referred_user_id, amount, commission_rate, tier,
      commission_type, subscription_amount, status,
      billing_period_start, billing_period_end, created_at
    ) VALUES (
      giuseppe_referral.referrer_id, 
      'ff530d6b-08ec-48f2-b1b1-3d8526f652f7', -- giuseppe user_id
      commission_amount, 0.05, 'Bronzo',
      'first_payment', 0.97, 'active',
      '2025-07-21', '2025-08-21', '2025-07-21 16:33:53'
    );
    
    -- Aggiorna statistiche (ora 4 conversioni totali)
    UPDATE public.referrer_stats
    SET 
      total_conversions = 4,
      available_credits = available_credits + commission_amount,
      total_credits_earned = total_credits_earned + commission_amount,
      updated_at = NOW()
    WHERE user_id = giuseppe_referral.referrer_id;
    
  END IF;
END $$;