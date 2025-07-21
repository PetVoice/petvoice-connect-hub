-- CORREZIONE URGENTE: Ferma i trigger problematici e pulisci commissioni duplicate

-- 1. Disabilita temporaneamente i trigger problematici
DROP TRIGGER IF EXISTS first_referral_conversion_trigger ON public.subscribers;
DROP TRIGGER IF EXISTS recurring_referral_commission_trigger ON public.subscribers;
DROP TRIGGER IF EXISTS on_referral_payment ON public.subscribers;

-- 2. Elimina le commissioni duplicate mantenendo solo la prima per ogni utente
WITH first_commissions AS (
  SELECT DISTINCT ON (referred_user_id, commission_type) 
    id,
    referred_user_id,
    commission_type
  FROM referral_commissions 
  WHERE commission_type = 'first_payment'
  ORDER BY referred_user_id, commission_type, created_at ASC
)
DELETE FROM referral_commissions 
WHERE commission_type = 'first_payment' 
  AND id NOT IN (SELECT id FROM first_commissions);

-- 3. Correggi le statistiche nei referrer_stats
UPDATE referrer_stats 
SET 
  total_conversions = (
    SELECT COUNT(DISTINCT rc.referred_user_id) 
    FROM referral_commissions rc 
    WHERE rc.referrer_id = referrer_stats.user_id 
      AND rc.commission_type = 'first_payment'
  ),
  total_credits_earned = (
    SELECT COALESCE(SUM(rc.amount), 0) 
    FROM referral_commissions rc 
    WHERE rc.referrer_id = referrer_stats.user_id
  ),
  available_credits = (
    SELECT COALESCE(SUM(rc.amount), 0) 
    FROM referral_commissions rc 
    WHERE rc.referrer_id = referrer_stats.user_id 
      AND rc.status = 'active' 
      AND rc.is_cancelled = false
  );

-- 4. Crea trigger corretto per evitare duplicati
CREATE OR REPLACE FUNCTION process_referral_conversion()
RETURNS TRIGGER AS $$
DECLARE
  referral_rec RECORD;
  tier_info RECORD;
  commission_amount DECIMAL;
  subscription_amount DECIMAL := 0.97;
BEGIN
  -- Solo per nuove attivazioni o primo pagamento
  IF NEW.subscription_status = 'active' AND OLD.subscription_status != 'active' THEN
    
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
        
        -- Crea commissione first_payment SOLO se non esiste
        INSERT INTO referral_commissions (
          referrer_id, referred_user_id, amount, commission_rate, tier,
          commission_type, subscription_amount, billing_period_start, billing_period_end
        ) VALUES (
          referral_rec.referrer_id, NEW.user_id, commission_amount, tier_info.rate, tier_info.tier,
          'first_payment', subscription_amount, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 month'
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
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Applica il trigger corretto
CREATE TRIGGER safe_referral_conversion_trigger
  AFTER UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION process_referral_conversion();