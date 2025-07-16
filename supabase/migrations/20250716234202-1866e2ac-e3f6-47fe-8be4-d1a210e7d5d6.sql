-- Aggiorna la funzione get_tier_info con le commissioni corrette
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

-- Aggiorna anche la funzione calculate_referral_tier per coerenza
CREATE OR REPLACE FUNCTION public.calculate_referral_tier(converted_count integer)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
BEGIN
  IF converted_count >= 20 THEN
    RETURN jsonb_build_object('tier', 'Platino', 'commission', 0.20);
  ELSIF converted_count >= 10 THEN
    RETURN jsonb_build_object('tier', 'Oro', 'commission', 0.15);
  ELSIF converted_count >= 5 THEN
    RETURN jsonb_build_object('tier', 'Argento', 'commission', 0.10);
  ELSE
    RETURN jsonb_build_object('tier', 'Bronzo', 'commission', 0.05);
  END IF;
END;
$$;