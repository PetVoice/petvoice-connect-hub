-- Funzione conversione (quando paga)
CREATE OR REPLACE FUNCTION convert_referral(p_user_id UUID, p_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
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