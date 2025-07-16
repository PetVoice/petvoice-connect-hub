-- STEP 1: ELIMINA TUTTO IL SISTEMA VECCHIO
DROP TRIGGER IF EXISTS auto_referral_processor ON public.subscribers;
DROP TRIGGER IF EXISTS bulletproof_referral_trigger ON public.subscribers;
DROP TRIGGER IF EXISTS on_referral_payment ON public.subscribers;
DROP TRIGGER IF EXISTS handle_referral_conversion_trigger ON public.subscribers;
DROP TRIGGER IF EXISTS on_auth_user_referral_registration ON auth.users;

DROP FUNCTION IF EXISTS auto_convert_pending_referrals();
DROP FUNCTION IF EXISTS simple_convert_all_pending();
DROP FUNCTION IF EXISTS bulletproof_referral_conversion();
DROP FUNCTION IF EXISTS bulletproof_referral_conversion_manual(uuid, text);
DROP FUNCTION IF EXISTS process_first_referral_conversion();
DROP FUNCTION IF EXISTS handle_referral_registration();
DROP FUNCTION IF EXISTS handle_referral_conversion();
DROP FUNCTION IF EXISTS convert_missed_referrals();
DROP FUNCTION IF EXISTS update_all_referral_stats();
DROP FUNCTION IF EXISTS process_recurring_referral_commission();

-- Cancella cron jobs
SELECT cron.unschedule('auto-referral-converter');
SELECT cron.unschedule('simple-referral-converter');
SELECT cron.unschedule('convert-missed-referrals');
SELECT cron.unschedule('complete-referral-processor');

-- STEP 2: RICREA TABELLE PULITE
DROP TABLE IF EXISTS public.referral_credits CASCADE;
DROP TABLE IF EXISTS public.user_referrals CASCADE;
DROP TABLE IF EXISTS public.referrals CASCADE;
DROP TABLE IF EXISTS public.referral_analytics CASCADE;
DROP TABLE IF EXISTS public.referral_badges CASCADE;
DROP TABLE IF EXISTS public.challenge_participations CASCADE;
DROP TABLE IF EXISTS public.referral_challenges CASCADE;
DROP TABLE IF EXISTS public.sharing_templates CASCADE;

-- Tabella referral principale
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_email TEXT NOT NULL,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'registered', -- 'registered', 'converted'
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  converted_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella commissioni
CREATE TABLE public.referral_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,4) NOT NULL, -- Importo commissione in euro
  commission_rate DECIMAL(5,4) NOT NULL, -- Percentuale (es. 0.05 = 5%)
  tier TEXT NOT NULL, -- 'Bronzo', 'Argento', 'Oro', 'Platino'
  commission_type TEXT NOT NULL, -- 'first_payment', 'recurring'
  billing_period_start DATE,
  billing_period_end DATE,
  subscription_amount DECIMAL(10,4) NOT NULL, -- €0.97
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'used'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella statistiche referrer
CREATE TABLE public.referrer_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT UNIQUE NOT NULL,
  total_registrations INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  total_credits_earned DECIMAL(10,4) DEFAULT 0,
  available_credits DECIMAL(10,4) DEFAULT 0, -- Crediti disponibili
  current_tier TEXT DEFAULT 'Bronzo',
  tier_progress INTEGER DEFAULT 0, -- Conversioni nel tier attuale
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici
CREATE INDEX idx_referrals_code ON public.referrals(referral_code);
CREATE INDEX idx_referrals_email ON public.referrals(referred_email);
CREATE INDEX idx_referrals_user ON public.referrals(referred_user_id);
CREATE INDEX idx_referrals_status ON public.referrals(status);
CREATE INDEX idx_commissions_referrer ON public.referral_commissions(referrer_id);
CREATE INDEX idx_commissions_status ON public.referral_commissions(status);

-- RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrer_stats ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own referrals" ON public.referrals 
  FOR SELECT USING (auth.uid() = referrer_id);

CREATE POLICY "Users can view own commissions" ON public.referral_commissions 
  FOR SELECT USING (auth.uid() = referrer_id);

CREATE POLICY "Users can view own stats" ON public.referrer_stats 
  FOR ALL USING (auth.uid() = user_id);

-- STEP 3: FUNZIONI TIER SYSTEM

-- Funzione calcolo tier
CREATE OR REPLACE FUNCTION get_tier_info(conversions INTEGER)
RETURNS TABLE(tier TEXT, rate DECIMAL, min_conversions INTEGER, max_conversions INTEGER)
LANGUAGE plpgsql
AS $$
BEGIN
  IF conversions >= 20 THEN
    RETURN QUERY SELECT 'Platino'::TEXT, 0.20::DECIMAL, 20, 999999;
  ELSIF conversions >= 10 THEN
    RETURN QUERY SELECT 'Oro'::TEXT, 0.15::DECIMAL, 10, 19;
  ELSIF conversions >= 5 THEN
    RETURN QUERY SELECT 'Argento'::TEXT, 0.10::DECIMAL, 5, 9;
  ELSE
    RETURN QUERY SELECT 'Bronzo'::TEXT, 0.05::DECIMAL, 0, 4;
  END IF;
END;
$$;

-- Funzione registrazione referral
CREATE OR REPLACE FUNCTION register_referral(
  p_referrer_id UUID,
  p_referred_email TEXT,
  p_referral_code TEXT
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  referral_id UUID;
BEGIN
  -- Crea referral
  INSERT INTO public.referrals (referrer_id, referred_email, referral_code, status)
  VALUES (p_referrer_id, p_referred_email, p_referral_code, 'registered')
  RETURNING id INTO referral_id;
  
  -- Aggiorna statistiche referrer
  INSERT INTO public.referrer_stats (user_id, referral_code, total_registrations)
  VALUES (p_referrer_id, p_referral_code, 1)
  ON CONFLICT (user_id) DO UPDATE SET
    total_registrations = referrer_stats.total_registrations + 1,
    updated_at = NOW();
  
  RETURN referral_id;
END;
$$;

-- Funzione conversione (quando paga)
CREATE OR REPLACE FUNCTION convert_referral(p_user_id UUID, p_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  referral_rec RECORD;
  tier_info RECORD;
  commission_amount DECIMAL;
  subscription_amount DECIMAL := 0.97;
  result JSONB;
BEGIN
  -- Trova referral "registered"
  SELECT * INTO referral_rec
  FROM public.referrals
  WHERE (referred_user_id = p_user_id OR referred_email = p_email)
    AND status = 'registered'
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF referral_rec.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'No referral found');
  END IF;
  
  -- Converte referral
  UPDATE public.referrals
  SET status = 'converted', 
      converted_at = NOW(),
      referred_user_id = p_user_id
  WHERE id = referral_rec.id;
  
  -- Aggiorna statistiche referrer
  UPDATE public.referrer_stats
  SET total_conversions = total_conversions + 1,
      updated_at = NOW()
  WHERE user_id = referral_rec.referrer_id;
  
  -- Calcola tier corrente
  SELECT * INTO tier_info
  FROM get_tier_info((
    SELECT total_conversions FROM public.referrer_stats 
    WHERE user_id = referral_rec.referrer_id
  ));
  
  -- Aggiorna tier
  UPDATE public.referrer_stats
  SET current_tier = tier_info.tier,
      tier_progress = total_conversions - tier_info.min_conversions
  WHERE user_id = referral_rec.referrer_id;
  
  -- Calcola commissione
  commission_amount := subscription_amount * tier_info.rate;
  
  -- Crea commissione primo pagamento
  INSERT INTO public.referral_commissions (
    referrer_id, referred_user_id, amount, commission_rate, tier,
    commission_type, subscription_amount, billing_period_start, billing_period_end
  ) VALUES (
    referral_rec.referrer_id, p_user_id, commission_amount, tier_info.rate, tier_info.tier,
    'first_payment', subscription_amount, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 month'
  );
  
  -- Aggiorna crediti
  UPDATE public.referrer_stats
  SET total_credits_earned = total_credits_earned + commission_amount,
      available_credits = available_credits + commission_amount,
      updated_at = NOW()
  WHERE user_id = referral_rec.referrer_id;
  
  result := jsonb_build_object(
    'success', true,
    'referral_id', referral_rec.id,
    'commission_amount', commission_amount,
    'tier', tier_info.tier,
    'rate', tier_info.rate
  );
  
  RETURN result;
END;
$$;

-- Funzione commissioni ricorrenti
CREATE OR REPLACE FUNCTION process_recurring_commissions(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  ref_rec RECORD;
  tier_info RECORD;
  commission_amount DECIMAL;
  subscription_amount DECIMAL := 0.97;
  total_processed INTEGER := 0;
BEGIN
  -- Per ogni referral convertito di questo utente
  FOR ref_rec IN 
    SELECT r.referrer_id, r.id as referral_id
    FROM public.referrals r
    WHERE r.referred_user_id = p_user_id AND r.status = 'converted'
  LOOP
    -- Calcola tier attuale del referrer
    SELECT * INTO tier_info
    FROM get_tier_info((
      SELECT total_conversions FROM public.referrer_stats 
      WHERE user_id = ref_rec.referrer_id
    ));
    
    commission_amount := subscription_amount * tier_info.rate;
    
    -- Crea commissione ricorrente
    INSERT INTO public.referral_commissions (
      referrer_id, referred_user_id, amount, commission_rate, tier,
      commission_type, subscription_amount, billing_period_start, billing_period_end
    ) VALUES (
      ref_rec.referrer_id, p_user_id, commission_amount, tier_info.rate, tier_info.tier,
      'recurring', subscription_amount, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 month'
    );
    
    -- Aggiorna crediti disponibili
    UPDATE public.referrer_stats
    SET available_credits = available_credits + commission_amount,
        total_credits_earned = total_credits_earned + commission_amount,
        updated_at = NOW()
    WHERE user_id = ref_rec.referrer_id;
    
    total_processed := total_processed + 1;
  END LOOP;
  
  RETURN jsonb_build_object('success', true, 'processed', total_processed);
END;
$$;

-- STEP 4: SISTEMA AUTOMATICO

-- Funzione che processa TUTTI i pagamenti
CREATE OR REPLACE FUNCTION process_all_payments()
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  subscriber_rec RECORD;
  result JSONB;
  converted_count INTEGER := 0;
  recurring_count INTEGER := 0;
BEGIN
  -- Per ogni subscriber attivo CON stripe_customer_id (pagamento reale)
  FOR subscriber_rec IN
    SELECT DISTINCT s.user_id, au.email
    FROM public.subscribers s
    JOIN auth.users au ON s.user_id = au.id
    WHERE s.subscription_status = 'active'
      AND s.stripe_customer_id IS NOT NULL
  LOOP
    -- Prova conversione primo pagamento
    SELECT convert_referral(subscriber_rec.user_id, subscriber_rec.email) INTO result;
    
    IF (result->>'success')::boolean THEN
      converted_count := converted_count + 1;
    END IF;
    
    -- Processa commissioni ricorrenti
    SELECT process_recurring_commissions(subscriber_rec.user_id) INTO result;
    
    IF (result->>'processed')::integer > 0 THEN
      recurring_count := recurring_count + (result->>'processed')::integer;
    END IF;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'converted_referrals', converted_count,
    'recurring_commissions', recurring_count,
    'processed_at', NOW()
  );
END;
$$;

-- Scheduled job ogni 5 minuti
SELECT cron.schedule(
  'process-referral-payments',
  '*/5 * * * *',
  'SELECT process_all_payments();'
);

-- Esegui subito per testare
SELECT process_all_payments();