-- Funzione RPC per convertire referral al pagamento
CREATE OR REPLACE FUNCTION convert_referral_on_payment(user_email TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  referral_record RECORD;
  referrer_profile RECORD;
  tier_commission NUMERIC;
  credit_amount NUMERIC;
  subscription_amount NUMERIC := 0.97; -- Monthly subscription amount
  calculated_tier TEXT;
  referrer_conversions INTEGER;
  result_data jsonb;
BEGIN
  -- Log per debug
  INSERT INTO public.activity_log (user_id, activity_type, activity_description)
  VALUES (
    (SELECT id FROM auth.users WHERE email = user_email LIMIT 1),
    'rpc_referral_check',
    'RPC chiamata per email: ' || user_email
  );

  -- Trova referral "registered" per questo utente tramite email
  SELECT * INTO referral_record
  FROM public.referrals
  WHERE referred_email = user_email
    AND status = 'registered'
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Se non trova referral, ritorna info
  IF referral_record IS NULL THEN
    result_data := jsonb_build_object(
      'success', false,
      'message', 'Nessun referral trovato per email: ' || user_email,
      'user_email', user_email
    );
    
    INSERT INTO public.activity_log (user_id, activity_type, activity_description, metadata)
    VALUES (
      (SELECT id FROM auth.users WHERE email = user_email LIMIT 1),
      'rpc_referral_not_found',
      'Nessun referral trovato per: ' || user_email,
      result_data
    );
    
    RETURN result_data;
  END IF;

  -- Ottieni profilo referrer
  SELECT * INTO referrer_profile
  FROM public.user_referrals
  WHERE user_id = referral_record.referrer_id;
  
  IF referrer_profile IS NULL THEN
    result_data := jsonb_build_object(
      'success', false,
      'message', 'Referrer non trovato',
      'referral_id', referral_record.id,
      'referrer_id', referral_record.referrer_id
    );
    RETURN result_data;
  END IF;

  -- Calcola il tier corretto basato sulle conversioni attuali
  referrer_conversions := referrer_profile.successful_conversions;
  
  IF referrer_conversions >= 50 THEN
    calculated_tier := 'Platino';
    tier_commission := 0.20;
  ELSIF referrer_conversions >= 20 THEN
    calculated_tier := 'Oro';
    tier_commission := 0.15;
  ELSIF referrer_conversions >= 5 THEN
    calculated_tier := 'Argento';
    tier_commission := 0.10;
  ELSE
    calculated_tier := 'Bronzo';
    tier_commission := 0.05;
  END IF;
  
  -- Calcola credito
  credit_amount := subscription_amount * tier_commission;
  
  -- Aggiorna referral status
  UPDATE public.referrals 
  SET 
    status = 'converted',
    conversion_date = now(),
    credits_awarded = credit_amount,
    updated_at = now()
  WHERE id = referral_record.id;
  
  -- Aggiorna statistiche referrer
  UPDATE public.user_referrals 
  SET 
    successful_conversions = successful_conversions + 1,
    total_credits_earned = total_credits_earned + credit_amount,
    current_tier = calculated_tier,
    updated_at = now()
  WHERE user_id = referrer_profile.user_id;
  
  -- Crea credito per il referrer
  INSERT INTO public.referral_credits (
    user_id,
    referral_id,
    amount,
    credit_type,
    description,
    status,
    expires_at
  ) VALUES (
    referrer_profile.user_id,
    referral_record.id,
    credit_amount,
    'referral_conversion',
    'Credito per primo pagamento referral: ' || user_email,
    'active',
    now() + interval '24 months'
  );
  
  -- Log conversione
  INSERT INTO public.activity_log (
    user_id,
    activity_type,
    activity_description,
    metadata
  ) VALUES (
    referrer_profile.user_id,
    'referral_converted_via_webhook',
    'Referral convertito via webhook: ' || user_email || ' (+€' || credit_amount || ')',
    jsonb_build_object(
      'referred_email', user_email,
      'referred_user_id', referral_record.referred_user_id,
      'credit_amount', credit_amount,
      'tier_commission', tier_commission,
      'tier', calculated_tier,
      'conversion_method', 'stripe_webhook'
    )
  );
  
  -- Prepara risultato di successo
  result_data := jsonb_build_object(
    'success', true,
    'message', 'Referral convertito con successo',
    'user_email', user_email,
    'referral_id', referral_record.id,
    'referrer_id', referrer_profile.user_id,
    'credit_amount', credit_amount,
    'tier', calculated_tier,
    'tier_commission', tier_commission
  );
  
  RETURN result_data;
END;
$$;