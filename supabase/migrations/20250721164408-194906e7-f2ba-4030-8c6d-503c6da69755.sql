-- SISTEMA COMPLETO: CONVERSIONI + RINNOVI AUTOMATICI

-- 1. FORZA CONVERSIONE GIUSEPPE SUBITO  
UPDATE public.referrals
SET status = 'converted'
WHERE referred_email = 'giuseppe.eros.lana@gmail.com';

-- Crea commissione first_payment per Giuseppe
INSERT INTO public.referral_commissions (
  referrer_id, referred_user_id, amount, commission_rate, tier,
  commission_type, subscription_amount, status,
  billing_period_start, billing_period_end, created_at
) VALUES (
  '5d336311-bfc2-40f4-8cd8-3ad17bd246d5',  -- referrer
  'ff530d6b-08ec-48f2-b1b1-3d8526f652f7',  -- giuseppe user_id
  0.0485, 0.05, 'Bronzo',
  'first_payment', 0.97, 'active',
  '2025-07-21', '2025-08-21', '2025-07-21 16:33:53'
);

-- 2. AGGIORNA STATISTICHE (4 conversioni totali ora)
UPDATE public.referrer_stats
SET 
  total_conversions = 4,
  available_credits = 0.194,  -- 4 * 0.0485
  total_credits_earned = 0.194,
  updated_at = NOW()
WHERE user_id = '5d336311-bfc2-40f4-8cd8-3ad17bd246d5';

-- 3. SISTEMA RINNOVI AUTOMATICI - Una commissione per ogni rinnovo
CREATE OR REPLACE FUNCTION public.process_monthly_renewals()
RETURNS TRIGGER AS $$
DECLARE
  referral_rec RECORD;
  tier_info RECORD;
  commission_amount DECIMAL;
  subscription_amount DECIMAL := 0.97;
BEGIN
  -- RINNOVO: quando cambia current_period_end (nuovo periodo fatturazione)
  IF NEW.subscription_status = 'active' AND OLD.subscription_status = 'active' AND
     OLD.current_period_end IS NOT NULL AND NEW.current_period_end IS NOT NULL AND
     OLD.current_period_end != NEW.current_period_end THEN
    
    -- Trova referral convertito per questo utente
    SELECT * INTO referral_rec
    FROM public.referrals
    WHERE referred_user_id = NEW.user_id 
      AND status = 'converted'
    LIMIT 1;
    
    IF referral_rec IS NOT NULL THEN
      -- Calcola tier attuale del referrer
      SELECT * INTO tier_info
      FROM get_tier_info((
        SELECT COALESCE(total_conversions, 0) 
        FROM public.referrer_stats 
        WHERE user_id = referral_rec.referrer_id
      ));
      
      commission_amount := subscription_amount * tier_info.rate;
      
      -- Controlla se NON esiste già commissione recurring per questo periodo
      IF NOT EXISTS (
        SELECT 1 FROM public.referral_commissions 
        WHERE referrer_id = referral_rec.referrer_id 
          AND referred_user_id = NEW.user_id
          AND commission_type = 'recurring'
          AND billing_period_start = NEW.current_period_start
      ) THEN
        
        -- Crea commissione recurring per questo rinnovo
        INSERT INTO public.referral_commissions (
          referrer_id, referred_user_id, amount, commission_rate, tier,
          commission_type, subscription_amount, status,
          billing_period_start, billing_period_end, created_at
        ) VALUES (
          referral_rec.referrer_id, NEW.user_id, commission_amount, tier_info.rate, tier_info.tier,
          'recurring', subscription_amount, 'active',
          NEW.current_period_start, NEW.current_period_end, NOW()
        );
        
        -- Aggiorna crediti per rinnovo
        UPDATE public.referrer_stats
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
$$ LANGUAGE plpgsql;

-- 4. TRIGGER PER RINNOVI
CREATE TRIGGER process_monthly_renewals_trigger
  AFTER UPDATE ON public.subscribers
  FOR EACH ROW
  WHEN (NEW.subscription_status = 'active' AND OLD.subscription_status = 'active' AND
        OLD.current_period_end IS DISTINCT FROM NEW.current_period_end)
  EXECUTE FUNCTION public.process_monthly_renewals();

-- 5. LOG CORREZIONE
INSERT INTO public.activity_log (
  user_id, activity_type, activity_description, metadata
) VALUES (
  '5d336311-bfc2-40f4-8cd8-3ad17bd246d5',
  'giuseppe_conversion_fix',
  '🔥 GIUSEPPE CONVERTITO + Sistema rinnovi automatici attivato',
  jsonb_build_object(
    'giuseppe_converted', true,
    'total_conversions', 4,
    'recurring_system', 'active'
  )
);