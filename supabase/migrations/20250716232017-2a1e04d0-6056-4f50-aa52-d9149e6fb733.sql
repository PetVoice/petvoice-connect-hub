-- STEP 1: CLEANUP SICURO (ignora errori su elementi inesistenti)
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