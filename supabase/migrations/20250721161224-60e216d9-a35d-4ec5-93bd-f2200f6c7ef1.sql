-- CORREZIONE TRIGGER COMMISSIONI: Distingui prima sottoscrizione da rinnovo

-- 1. Rimuovi il trigger esistente
DROP TRIGGER IF EXISTS safe_referral_conversion_trigger ON public.subscribers;

-- 2. Crea nuovo trigger corretto che distingue prima sottoscrizione da rinnovo
CREATE OR REPLACE FUNCTION public.process_referral_conversion_corrected()
RETURNS TRIGGER 
LANGUAGE plpgsql AS $$
DECLARE
  referral_rec RECORD;
  tier_info RECORD;
  commission_amount DECIMAL;
  subscription_amount DECIMAL := 0.97;
BEGIN
  -- PRIMA SOTTOSCRIZIONE: Solo quando diventa 'active' per la prima volta
  IF NEW.subscription_status = 'active' AND 
     (OLD IS NULL OR OLD.subscription_status != 'active') THEN
    
    -- Trova referral per questo utente
    SELECT * INTO referral_rec
    FROM referrals
    WHERE referred_user_id = NEW.user_id 
      AND status = 'converted'
    LIMIT 1;
    
    IF referral_rec IS NOT NULL THEN
      -- Controlla se NON esiste già una commissione first_payment per questo utente
      IF NOT EXISTS (
        SELECT 1 FROM referral_commissions 
        WHERE referred_user_id = NEW.user_id 
          AND commission_type = 'first_payment'
      ) THEN
        
        -- Calcola tier del referrer
        SELECT * INTO tier_info
        FROM get_tier_info((
          SELECT COALESCE(total_conversions, 0) 
          FROM referrer_stats 
          WHERE user_id = referral_rec.referrer_id
        ));
        
        commission_amount := subscription_amount * tier_info.rate;
        
        -- Crea commissione PRIMA SOTTOSCRIZIONE
        INSERT INTO referral_commissions (
          referrer_id, referred_user_id, amount, commission_rate, tier,
          commission_type, subscription_amount, 
          billing_period_start, billing_period_end,
          created_at
        ) VALUES (
          referral_rec.referrer_id, NEW.user_id, commission_amount, tier_info.rate, tier_info.tier,
          'first_payment', subscription_amount, 
          COALESCE(NEW.current_period_start, CURRENT_DATE), 
          COALESCE(NEW.current_period_end, CURRENT_DATE + INTERVAL '1 month'),
          NOW()
        );
        
        -- Aggiorna statistiche referrer
        UPDATE referrer_stats
        SET 
          total_conversions = total_conversions + 1,
          available_credits = available_credits + commission_amount,
          total_credits_earned = total_credits_earned + commission_amount,
          current_tier = tier_info.tier,
          updated_at = NOW()
        WHERE user_id = referral_rec.referrer_id;
        
      END IF;
    END IF;
  END IF;
  
  -- RINNOVO MENSILE: Solo quando cambia il periodo di fatturazione (fine mese)
  IF NEW.subscription_status = 'active' AND OLD.subscription_status = 'active' AND
     OLD.current_period_end IS NOT NULL AND NEW.current_period_end IS NOT NULL AND
     OLD.current_period_end != NEW.current_period_end THEN
    
    -- Trova referral per questo utente
    SELECT * INTO referral_rec
    FROM referrals
    WHERE referred_user_id = NEW.user_id 
      AND status = 'converted'
    LIMIT 1;
    
    IF referral_rec IS NOT NULL THEN
      -- Calcola tier del referrer
      SELECT * INTO tier_info
      FROM get_tier_info((
        SELECT COALESCE(total_conversions, 0) 
        FROM referrer_stats 
        WHERE user_id = referral_rec.referrer_id
      ));
      
      commission_amount := subscription_amount * tier_info.rate;
      
      -- Crea commissione RINNOVO MENSILE (solo se non esiste già per questo periodo)
      IF NOT EXISTS (
        SELECT 1 FROM referral_commissions 
        WHERE referrer_id = referral_rec.referrer_id 
          AND referred_user_id = NEW.user_id
          AND commission_type = 'recurring'
          AND billing_period_start = NEW.current_period_start
      ) THEN
        INSERT INTO referral_commissions (
          referrer_id, referred_user_id, amount, commission_rate, tier,
          commission_type, subscription_amount,
          billing_period_start, billing_period_end,
          created_at
        ) VALUES (
          referral_rec.referrer_id, NEW.user_id, commission_amount, tier_info.rate, tier_info.tier,
          'recurring', subscription_amount,
          NEW.current_period_start, NEW.current_period_end,
          NOW()
        );
        
        -- Aggiorna crediti disponibili per rinnovo
        UPDATE referrer_stats
        SET 
          available_credits = available_credits + commission_amount,
          total_credits_earned = total_credits_earned + commission_amount,
          updated_at = NOW()
        WHERE user_id = referral_rec.referrer_id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 3. Crea nuovo trigger corretto
CREATE TRIGGER safe_referral_conversion_trigger_corrected
AFTER INSERT OR UPDATE ON public.subscribers
FOR EACH ROW
EXECUTE FUNCTION public.process_referral_conversion_corrected();

-- 4. Log della correzione
INSERT INTO public.activity_log (
  user_id, activity_type, activity_description, metadata
) VALUES (
  '5d336311-bfc2-40f4-8cd8-3ad17bd246d5',
  'system_fix',
  '🔧 TRIGGER CORRETTO: Prima sottoscrizione vs Rinnovo mensile ora distinti',
  jsonb_build_object(
    'fix_time', now(),
    'fix_type', 'referral_commission_trigger_correction'
  )
);