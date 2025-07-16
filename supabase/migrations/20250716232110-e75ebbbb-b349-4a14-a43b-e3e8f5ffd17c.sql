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
SECURITY DEFINER
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